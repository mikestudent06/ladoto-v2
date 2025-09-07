import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { tasksApi } from "@/api/tasks";
import type { Task, TaskFormData, TaskFilters } from "@/types";

// Query Keys
export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (filters: TaskFilters) => [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, "detail"] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
  byProject: (projectId: string) =>
    [...taskKeys.all, "project", projectId] as const,
  dashboardStats: () => [...taskKeys.all, "dashboard-stats"] as const,
};

// Get all tasks with filters
export function useTasks(filters: TaskFilters = {}) {
  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: () => tasksApi.getAll(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Get single task
export function useTask(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => tasksApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Get tasks by project
export function useProjectTasks(projectId: string) {
  return useQuery({
    queryKey: taskKeys.byProject(projectId),
    queryFn: () => tasksApi.getByProject(projectId),
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000,
  });
}

// Get dashboard stats
export function useDashboardStats() {
  return useQuery({
    queryKey: taskKeys.dashboardStats(),
    queryFn: tasksApi.getDashboardStats,
    staleTime: 1 * 60 * 1000, // 1 minute - dashboard stats change frequently
  });
}

// Create task mutation
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.create,
    onSuccess: (newTask) => {
      // Invalidate all task lists
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });

      // Invalidate project tasks
      queryClient.invalidateQueries({
        queryKey: taskKeys.byProject(newTask.project_id),
      });

      // Invalidate dashboard stats
      queryClient.invalidateQueries({ queryKey: taskKeys.dashboardStats() });

      // Add to cache
      queryClient.setQueryData(taskKeys.detail(newTask.id), newTask);

      toast.success("Tâche créée avec succès !");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Échec de la création de la tâche");
    },
  });
}

// Update task mutation
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TaskFormData> }) =>
      tasksApi.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.detail(id) });

      const previousTask = queryClient.getQueryData(taskKeys.detail(id));

      queryClient.setQueryData(taskKeys.detail(id), (old: Task | undefined) =>
        old ? { ...old, ...data, updated_at: new Date().toISOString() } : old
      );

      return { previousTask };
    },
    onError: (error: Error, { id }, context) => {
      queryClient.setQueryData(taskKeys.detail(id), context?.previousTask);
      toast.error(error.message || "Échec de la mise à jour de la tâche");
    },
    onSuccess: (updatedTask) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: taskKeys.byProject(updatedTask.project_id),
      });
      queryClient.invalidateQueries({ queryKey: taskKeys.dashboardStats() });

      queryClient.setQueryData(taskKeys.detail(updatedTask.id), updatedTask);
      toast.success("Tâche mise à jour avec succès !");
    },
  });
}

// Quick status update (for drag-and-drop)
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Task["status"] }) =>
      tasksApi.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.detail(id) });

      const previousTask = queryClient.getQueryData(taskKeys.detail(id));

      queryClient.setQueryData(taskKeys.detail(id), (old: Task | undefined) =>
        old ? { ...old, status, updated_at: new Date().toISOString() } : old
      );

      return { previousTask };
    },
    onError: (error: Error, { id }, context) => {
      queryClient.setQueryData(taskKeys.detail(id), context?.previousTask);
      toast.error(
        error.message || "Échec de la mise à jour du statut de la tâche"
      );
    },
    onSuccess: (updatedTask) => {
      // Invalidate lists and stats
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: taskKeys.byProject(updatedTask.project_id),
      });
      queryClient.invalidateQueries({ queryKey: taskKeys.dashboardStats() });
    },
  });
}

// Delete task mutation
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.delete,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });

      const previousTask = queryClient.getQueryData(taskKeys.detail(id)) as
        | Task
        | undefined;
      const previousTasks = queryClient.getQueryData(taskKeys.lists());

      // Optimistically remove from lists
      queryClient.setQueriesData(
        { queryKey: taskKeys.lists() },
        (old: Task[] | undefined) =>
          old ? old.filter((task) => task.id !== id) : []
      );

      if (previousTask) {
        queryClient.setQueryData(
          taskKeys.byProject(previousTask.project_id),
          (old: Task[] | undefined) =>
            old ? old.filter((task) => task.id !== id) : []
        );
      }

      return { previousTasks, previousTask };
    },
    onError: (error: Error) => {
      // Rollback on error
      toast.error(error.message || "Échec de la suppression de la tâche");
    },
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: taskKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: taskKeys.dashboardStats() });
      toast.success("Tâche supprimée avec succès !");
    },
  });
}
