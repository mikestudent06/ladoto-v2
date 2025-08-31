import { supabase } from "@/lib/supabase";
import type { Task, TaskFormData, TaskFilters } from "@/types";

export const tasksApi = {
  // Get all tasks with optional filtering
  getAll: async (filters: TaskFilters = {}): Promise<Task[]> => {
    let query = supabase.from("tasks").select(`
        id,
        title,
        description,
        status,
        priority,
        project_id,
        assignee_id,
        due_date,
        created_at,
        updated_at,
        project:projects(
          id,
          name
        )
      `);

    // Apply filters
    if (filters.project_id) {
      query = query.eq("project_id", filters.project_id);
    }

    if (filters.status && filters.status.length > 0) {
      query = query.in("status", filters.status);
    }

    if (filters.priority && filters.priority.length > 0) {
      query = query.in("priority", filters.priority);
    }

    if (filters.assignee_id) {
      query = query.eq("assignee_id", filters.assignee_id);
    }

    if (filters.search) {
      query = query.or(
        `title.ilike.%${filters.search}%, description.ilike.%${filters.search}%`
      );
    }

    if (filters.date_from) {
      query = query.gte("due_date", filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte("due_date", filters.date_to);
    }

    const { data, error } = await query.order("updated_at", {
      ascending: false,
    });

    if (error) {
      throw new Error(error.message);
    }

    return (
      (data?.map((task) => ({
        ...task,
        project: task.project?.[0] || null,
      })) as Task[]) || []
    );
  },

  // Get single task by ID
  getById: async (id: string): Promise<Task> => {
    const { data, error } = await supabase
      .from("tasks")
      .select(
        `
        id,
        title,
        description,
        status,
        priority,
        project_id,
        assignee_id,
        due_date,
        created_at,
        updated_at,
        project:projects(
          id,
          name
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      ...data,
      project: data.project?.[0] || null,
    } as Task;
  },

  // Create new task
  create: async (taskData: TaskFormData): Promise<Task> => {
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title: taskData.title,
        description: taskData.description,
        status: taskData.status || "todo",
        priority: taskData.priority || "medium",
        project_id: taskData.project_id,
        assignee_id: taskData.assignee_id,
        due_date: taskData.due_date,
      })
      .select(
        `
        id,
        title,
        description,
        status,
        priority,
        project_id,
        assignee_id,
        due_date,
        created_at,
        updated_at,
        project:projects(
          id,
          name
        )
      `
      )
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      ...data,
      project: data.project?.[0] || null,
    } as Task;
  },

  // Update task
  update: async (
    id: string,
    taskData: Partial<TaskFormData>
  ): Promise<Task> => {
    const { data, error } = await supabase
      .from("tasks")
      .update({
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        assignee_id: taskData.assignee_id,
        due_date: taskData.due_date,
      })
      .eq("id", id)
      .select(
        `
        id,
        title,
        description,
        status,
        priority,
        project_id,
        assignee_id,
        due_date,
        created_at,
        updated_at,
        project:projects(
          id,
          name
        )
      `
      )
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      ...data,
      project: data.project?.[0] || null,
    } as Task;
  },

  // Delete task
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  },

  // Quick status update (for drag-and-drop or quick actions)
  updateStatus: async (id: string, status: Task["status"]): Promise<Task> => {
    const { data, error } = await supabase
      .from("tasks")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  // Get tasks by project ID
  getByProject: async (projectId: string): Promise<Task[]> => {
    const { data, error } = await supabase
      .from("tasks")
      .select(
        `
        id,
        title,
        description,
        status,
        priority,
        project_id,
        assignee_id,
        due_date,
        created_at,
        updated_at
      `
      )
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("status, priority, due_date, created_at")
      .gte(
        "created_at",
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      ); // Last 30 days

    if (error) {
      throw new Error(error.message);
    }

    const today = new Date().toISOString().split("T")[0];

    return {
      total: data.length,
      completed: data.filter((task) => task.status === "done").length,
      inProgress: data.filter((task) => task.status === "in_progress").length,
      overdue: data.filter(
        (task) =>
          task.due_date && task.due_date < today && task.status !== "done"
      ).length,
      dueToday: data.filter((task) => task.due_date === today).length,
      highPriority: data.filter(
        (task) => task.priority === "high" && task.status !== "done"
      ).length,
    };
  },
};
