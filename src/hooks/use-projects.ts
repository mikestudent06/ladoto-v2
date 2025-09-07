import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { projectsApi } from "@/api/projects";
import type { Project, ProjectFormData } from "@/types";

// Query Keys
export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (filters: string) => [...projectKeys.lists(), { filters }] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  stats: (id: string) => [...projectKeys.all, "stats", id] as const,
};

// Get all projects
export function useProjects() {
  return useQuery({
    queryKey: projectKeys.lists(),
    queryFn: projectsApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get single project
export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectsApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Get project stats
export function useProjectStats(id: string) {
  return useQuery({
    queryKey: projectKeys.stats(id),
    queryFn: () => projectsApi.getStats(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes - stats change more frequently
  });
}

// Create project mutation
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectsApi.create,
    onSuccess: (newProject) => {
      // Invalidate and refetch projects list
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });

      // Add to cache optimistically
      queryClient.setQueryData(projectKeys.detail(newProject.id), newProject);

      toast.success("Projet créé avec succès !");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Échec de la création du projet");
    },
  });
}

// Update project mutation
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<ProjectFormData>;
    }) => projectsApi.update(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: projectKeys.detail(id) });

      // Snapshot previous value
      const previousProject = queryClient.getQueryData(projectKeys.detail(id));

      // Optimistically update
      queryClient.setQueryData(
        projectKeys.detail(id),
        (old: Project | undefined) =>
          old ? { ...old, ...data, updated_at: new Date().toISOString() } : old
      );

      return { previousProject };
    },
    onError: (error: Error, { id }, context) => {
      // Rollback on error
      queryClient.setQueryData(
        projectKeys.detail(id),
        context?.previousProject
      );
      toast.error(error.message || "Échec de la mise à jour du projet");
    },
    onSuccess: (updatedProject) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.setQueryData(
        projectKeys.detail(updatedProject.id),
        updatedProject
      );
      toast.success("Projet mis à jour avec succès !");
    },
  });
}

// Delete project mutation
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectsApi.delete,
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: projectKeys.lists() });

      // Snapshot previous value
      const previousProjects = queryClient.getQueryData(projectKeys.lists());

      // Optimistically remove from list
      queryClient.setQueryData(
        projectKeys.lists(),
        (old: Project[] | undefined) =>
          old ? old.filter((project) => project.id !== id) : []
      );

      return { previousProjects };
    },
    onError: (error: Error) => {
      // Rollback on error
      toast.error(error.message || "Échec de la suppression du projet");
    },
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: projectKeys.detail(id) });
      queryClient.removeQueries({ queryKey: projectKeys.stats(id) });
      toast.success("Projet supprimé avec succès !");
    },
  });
}
