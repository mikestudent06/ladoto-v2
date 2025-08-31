// Auth types
export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Project types
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: "active" | "archived" | "completed";
  owner_id: string;
  created_at: string;
  updated_at: string;
  tasks?: Task[] | { count: number }[]; // For different query contexts
}

export interface ProjectFormData {
  name: string;
  description?: string;
  status?: "active" | "archived" | "completed";
}

export interface ProjectStats {
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  highPriority: number;
}

// Task types
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  project_id: string;
  assignee_id?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
  project?: {
    id: string;
    name: string;
  };
}

export interface TaskFormData {
  title: string;
  description?: string;
  status?: "todo" | "in_progress" | "done";
  priority?: "low" | "medium" | "high";
  project_id: string;
  assignee_id?: string;
  due_date?: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
  dueToday: number;
  highPriority: number;
}

// Comment types (for future phases)
export interface TaskComment {
  id: string;
  content: string;
  task_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  totalPages: number;
}

// Common component props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Filter and search types
export interface TaskFilters {
  status?: Task["status"][];
  priority?: Task["priority"][];
  assignee_id?: string;
  project_id?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
}

export interface ProjectFilters {
  status?: Project["status"][];
  owner_id?: string;
  search?: string;
  created_from?: string;
  created_to?: string;
}

// UI State types
export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
  className?: string;
}

export interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

// Modal and Dialog types
export interface ModalState {
  isOpen: boolean;
  type?: "create" | "edit" | "delete" | "view";
  data?: any;
}

// Dashboard types
export interface DashboardStats {
  projects: {
    total: number;
    active: number;
    completed: number;
  };
  tasks: TaskStats;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: "project_created" | "task_created" | "task_completed" | "task_updated";
  title: string;
  description?: string;
  timestamp: string;
  user?: User;
}
