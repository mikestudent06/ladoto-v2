-- TaskFlow Database Schema - Version Sans Récursion RLS
-- À exécuter dans Supabase SQL Editor

-- =====================================================
-- 1. CRÉATION DES TABLES
-- =====================================================

-- Table des projets
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des tâches
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des commentaires de tâches
CREATE TABLE task_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des membres de projet
CREATE TABLE project_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- =====================================================
-- 2. FONCTIONS TRIGGERS POUR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Application des triggers
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_comments_updated_at BEFORE UPDATE ON task_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. FONCTIONS HELPER POUR RLS (ÉVITER LA RÉCURSION)
-- =====================================================

-- Fonction pour vérifier si un utilisateur est propriétaire d'un projet
CREATE OR REPLACE FUNCTION user_owns_project(project_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM projects 
    WHERE id = project_uuid AND owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si un utilisateur est membre d'un projet
CREATE OR REPLACE FUNCTION user_is_project_member(project_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM project_members 
    WHERE project_id = project_uuid AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction combinée pour l'accès complet au projet
CREATE OR REPLACE FUNCTION user_has_project_access(project_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN user_owns_project(project_uuid) OR user_is_project_member(project_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. ACTIVATION RLS
-- =====================================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. POLITIQUES RLS - PROJECT_MEMBERS (BASE)
-- =====================================================

-- Voir ses propres appartenances
CREATE POLICY "view_own_memberships" ON project_members
  FOR SELECT USING (user_id = auth.uid());

-- Voir les autres membres des projets où on est membre
CREATE POLICY "view_project_members" ON project_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_members pm2 
      WHERE pm2.project_id = project_members.project_id 
      AND pm2.user_id = auth.uid()
    )
  );

-- Seuls les propriétaires peuvent gérer les membres
CREATE POLICY "manage_project_members_insert" ON project_members
  FOR INSERT WITH CHECK (user_owns_project(project_id));

CREATE POLICY "manage_project_members_update" ON project_members
  FOR UPDATE USING (user_owns_project(project_id));

CREATE POLICY "manage_project_members_delete" ON project_members
  FOR DELETE USING (user_owns_project(project_id));

-- =====================================================
-- 6. POLITIQUES RLS - PROJECTS
-- =====================================================

-- Voir ses propres projets
CREATE POLICY "view_owned_projects" ON projects
  FOR SELECT USING (owner_id = auth.uid());

-- Voir les projets où on est membre
CREATE POLICY "view_member_projects" ON projects
  FOR SELECT USING (user_is_project_member(id));

-- Créer ses propres projets
CREATE POLICY "create_own_projects" ON projects
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Modifier ses propres projets
CREATE POLICY "update_owned_projects" ON projects
  FOR UPDATE USING (owner_id = auth.uid());

-- Supprimer ses propres projets
CREATE POLICY "delete_owned_projects" ON projects
  FOR DELETE USING (owner_id = auth.uid());

-- =====================================================
-- 7. POLITIQUES RLS - TASKS
-- =====================================================

CREATE POLICY "view_project_tasks" ON tasks
  FOR SELECT USING (user_has_project_access(project_id));

CREATE POLICY "create_project_tasks" ON tasks
  FOR INSERT WITH CHECK (user_has_project_access(project_id));

CREATE POLICY "update_project_tasks" ON tasks
  FOR UPDATE USING (user_has_project_access(project_id));

CREATE POLICY "delete_project_tasks" ON tasks
  FOR DELETE USING (user_has_project_access(project_id));

-- =====================================================
-- 8. POLITIQUES RLS - TASK_COMMENTS
-- =====================================================

CREATE POLICY "view_task_comments" ON task_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE tasks.id = task_comments.task_id 
      AND user_has_project_access(tasks.project_id)
    )
  );

CREATE POLICY "create_task_comments" ON task_comments
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE tasks.id = task_comments.task_id 
      AND user_has_project_access(tasks.project_id)
    )
  );

CREATE POLICY "update_own_comments" ON task_comments
  FOR UPDATE USING (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE tasks.id = task_comments.task_id 
      AND user_has_project_access(tasks.project_id)
    )
  );

CREATE POLICY "delete_own_comments" ON task_comments
  FOR DELETE USING (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE tasks.id = task_comments.task_id 
      AND user_has_project_access(tasks.project_id)
    )
  );

-- =====================================================
-- 9. INDEX POUR LES PERFORMANCES
-- =====================================================

CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_updated_at ON projects(updated_at DESC);

CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_project_members_user_id ON project_members(user_id);
CREATE INDEX idx_project_members_composite ON project_members(project_id, user_id);

CREATE INDEX idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX idx_task_comments_user_id ON task_comments(user_id);

-- =====================================================
-- 10. TRIGGER AUTOMATIQUE POUR AJOUTER LE PROPRIÉTAIRE COMME MEMBRE
-- =====================================================

-- Fonction pour ajouter automatiquement le propriétaire comme membre
CREATE OR REPLACE FUNCTION add_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO project_members (project_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger qui s'exécute après la création d'un projet
CREATE TRIGGER add_owner_as_member_trigger
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION add_owner_as_member();

-- =====================================================
-- 11. VUES UTILES (OPTIONNEL)
-- =====================================================

-- Vue pour les projets avec compteurs de tâches
CREATE OR REPLACE VIEW projects_with_stats AS
SELECT 
  p.*,
  COALESCE(task_counts.total_tasks, 0) as total_tasks,
  COALESCE(task_counts.completed_tasks, 0) as completed_tasks,
  COALESCE(task_counts.in_progress_tasks, 0) as in_progress_tasks,
  COALESCE(task_counts.todo_tasks, 0) as todo_tasks
FROM projects p
LEFT JOIN (
  SELECT 
    project_id,
    COUNT(*) as total_tasks,
    COUNT(*) FILTER (WHERE status = 'done') as completed_tasks,
    COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_tasks,
    COUNT(*) FILTER (WHERE status = 'todo') as todo_tasks
  FROM tasks
  GROUP BY project_id
) task_counts ON p.id = task_counts.project_id;

-- =====================================================
-- 12. DONNÉES DE TEST (OPTIONNEL)
-- =====================================================

-- Décommentez et modifiez avec votre user ID pour tester
/*
-- Remplacez 'YOUR_USER_ID' par votre vrai user ID
INSERT INTO projects (name, description, owner_id) VALUES 
  ('TaskFlow Development', 'Building the ultimate task management app', 'YOUR_USER_ID'),
  ('Marketing Campaign', 'Q1 2024 marketing initiatives', 'YOUR_USER_ID'),
  ('Personal Goals', 'My personal development goals', 'YOUR_USER_ID');

-- Exemple de tâches (remplacez les IDs par les vrais IDs de projets)
INSERT INTO tasks (title, description, status, priority, project_id) VALUES 
  ('Set up authentication', 'Implement Supabase auth with protected routes', 'done', 'high', 'PROJECT_ID_1'),
  ('Build CRUD operations', 'Create projects and tasks management', 'in_progress', 'high', 'PROJECT_ID_1'),
  ('Design landing page', 'Create compelling marketing page', 'todo', 'medium', 'PROJECT_ID_2');
*/

-- =====================================================
-- 13. VERIFICATION DU SCHEMA
-- =====================================================

-- Requête pour vérifier que tout est bien configuré
SELECT 
  'Tables créées' as status,
  COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('projects', 'tasks', 'task_comments', 'project_members');

-- Vérification des politiques RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;