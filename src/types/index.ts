// Auth types
export interface User {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface AuthState {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
}

// Form types
export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

// Project types (for future phases)
export interface Project {
  id: string
  name: string
  description?: string
  owner_id: string
  created_at: string
  updated_at: string
}

// Task types (for future phases)
export interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  project_id: string
  assignee_id?: string
  due_date?: string
  created_at: string
  updated_at: string
}

// API Response types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

// Common component props
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

// Filter and search types (for future phases)
export interface TaskFilters {
  status?: Task['status'][]
  priority?: Task['priority'][]
  assignee_id?: string
  project_id?: string
  search?: string
  date_from?: string
  date_to?: string
}

export interface ProjectFilters {
  owner_id?: string
  search?: string
  created_from?: string
  created_to?: string
}