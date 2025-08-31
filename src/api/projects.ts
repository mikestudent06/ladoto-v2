import { supabase } from "@/lib/supabase";
import type { Project, ProjectFormData } from "@/types";

export const projectsApi = {
  // Get all projects for the authenticated user
  getAll: async (): Promise<Project[]> => {
    const { data, error } = await supabase
      .from("projects")
      .select(
        `
        id,
        name,
        description,
        status,
        owner_id,
        created_at,
        updated_at,
        tasks:tasks(count)
      `
      )
      .order("updated_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  },

  // Get single project by ID
  getById: async (id: string): Promise<Project> => {
    const { data, error } = await supabase
      .from("projects")
      .select(
        `
        id,
        name,
        description,
        status,
        owner_id,
        created_at,
        updated_at,
        tasks:tasks(
          id,
          title,
          status,
          priority,
          assignee_id,
          due_date,
          created_at
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as Project;
  },

  // Create new project
  create: async (projectData: ProjectFormData): Promise<Project> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("projects")
      .insert({
        name: projectData.name,
        description: projectData.description,
        owner_id: user.id,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  // Update project
  update: async (
    id: string,
    projectData: Partial<ProjectFormData>
  ): Promise<Project> => {
    const { data, error } = await supabase
      .from("projects")
      .update({
        name: projectData.name,
        description: projectData.description,
        status: projectData.status,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  // Delete project
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  },

  // Get project statistics
  getStats: async (id: string) => {
    const { data, error } = await supabase
      .from("tasks")
      .select("status, priority")
      .eq("project_id", id);

    if (error) {
      throw new Error(error.message);
    }

    const stats = {
      total: data.length,
      completed: data.filter((task) => task.status === "done").length,
      inProgress: data.filter((task) => task.status === "in_progress").length,
      todo: data.filter((task) => task.status === "todo").length,
      highPriority: data.filter((task) => task.priority === "high").length,
    };

    return stats;
  },
};
