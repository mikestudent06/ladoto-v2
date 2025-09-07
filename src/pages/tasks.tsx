import { useEffect, useState } from "react";
import { Plus, Search, Download } from "lucide-react";
import { useDebounce } from "use-debounce";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ViewToggle, type ViewMode } from "@/components/common/view-toggle";

import { useTasks, useUpdateTaskStatus } from "@/hooks/use-tasks";
import { useProjects } from "@/hooks/use-projects";
import { TaskCard } from "@/components/tasks/task-card";
import { TaskModal } from "@/components/tasks/task-modal";
import { DeleteTaskDialog } from "@/components/tasks/delete-task-dialog";
import { TasksTable } from "@/components/tasks/tasks-table";

import type { Task, TaskFilters } from "@/types";

export function TasksPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [filters, setFilters] = useState<TaskFilters>({});
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch] = useDebounce(searchInput, 500);

  // Effet de recherche avec débounce
  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: debouncedSearch || undefined }));
  }, [debouncedSearch]);

  // État unifié du modal - fonctionne pour les vues cartes et tableau
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: "create" | "edit" | "view";
    task?: Task;
  }>({
    isOpen: false,
    mode: "create",
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    task: Task | null;
  }>({
    isOpen: false,
    task: null,
  });

  const { data: tasks, isLoading, error, isFetching } = useTasks(filters);
  const { data: projects } = useProjects();
  const updateTaskStatus = useUpdateTaskStatus();

  // Suivi intelligent de l'état de chargement
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  useEffect(() => {
    if (tasks !== undefined && !hasInitiallyLoaded) {
      setHasInitiallyLoaded(true);
    }
  }, [tasks, hasInitiallyLoaded]);

  // Gestionnaires unifiés - fonctionnent pour les deux vues
  const handleCreateTask = () => {
    setModalState({ isOpen: true, mode: "create" });
  };

  const handleEditTask = (task: Task) => {
    setModalState({ isOpen: true, mode: "edit", task });
  };

  const handleViewTask = (task: Task) => {
    setModalState({ isOpen: true, mode: "view", task });
  };

  const handleDeleteTask = (task: Task) => {
    setDeleteDialog({ isOpen: true, task });
  };

  const handleStatusChange = async (task: Task, status: Task["status"]) => {
    await updateTaskStatus.mutateAsync({ id: task.id, status });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, mode: "create", task: undefined });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, task: null });
  };

  // Gestionnaire de recherche amélioré
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleExport = () => {
    // Exporter les tâches en CSV
    const csv = [
      [
        "Titre",
        "Description",
        "Statut",
        "Priorité",
        "Projet",
        "Date d'échéance",
        "Créé",
        "Modifié",
      ],
      ...(tasks?.map((task) => [
        task.title,
        task.description || "",
        task.status,
        task.priority,
        task.project?.name || "",
        task.due_date || "",
        task.created_at,
        task.updated_at,
      ]) || []),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `taches-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Logique de chargement intelligente
  if (isLoading && !hasInitiallyLoaded) {
    return <LoadingSpinner text="Chargement des tâches..." />;
  }

  if (error) {
    return (
      <Alert>
        <AlertDescription>
          Échec du chargement des tâches. Veuillez réessayer.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tâches</h1>
          <p className="text-muted-foreground">
            Consultez et gérez toutes vos tâches
          </p>
        </div>
        <Button onClick={handleCreateTask}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle tâche
        </Button>
      </div>

      {/* Contrôles */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 items-center gap-4">
          {/* Filtres - uniquement pour la vue cartes, le tableau a ses propres filtres */}
          {viewMode === "cards" && (
            <>
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher des tâches..."
                  value={searchInput}
                  onChange={handleSearch}
                  className="pl-10 pr-10"
                />
                {/* Indicateur de chargement subtil pour la recherche */}
                {isFetching && hasInitiallyLoaded && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600"></div>
                  </div>
                )}
              </div>

              <Select
                value={filters.project_id || "all"}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    project_id: value === "all" ? undefined : value,
                  }))
                }
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Tous les projets" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les projets</SelectItem>
                  {projects?.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.status?.[0] || "all"}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    status:
                      value === "all" ? undefined : [value as Task["status"]],
                  }))
                }
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="todo">À faire</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="done">Terminé</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <ViewToggle view={viewMode} onViewChange={setViewMode} />
        </div>
      </div>

      {/* Contenu */}
      {viewMode === "table" ? (
        <TasksTable
          filters={filters}
          onExport={handleExport}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          onView={handleViewTask}
        />
      ) : (
        <>
          {/* Grille de tâches */}
          {tasks?.length === 0 ? (
            <div className="text-center py-12">
              <div className="max-w-sm mx-auto">
                <h3 className="text-lg font-medium mb-2">
                  Aucune tâche trouvée
                </h3>
                <p className="text-muted-foreground mb-6">
                  {filters.search ||
                  filters.project_id ||
                  filters.status?.length
                    ? "Essayez d'ajuster vos filtres"
                    : "Commencez en créant votre première tâche"}
                </p>
                <Button onClick={handleCreateTask}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer une tâche
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks?.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleStatusChange}
                  showProject
                  onView={handleViewTask}
                />
              ))}
            </div>
          )}
        </>
      )}

      <TaskModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        task={modalState.task}
        mode={modalState.mode}
      />

      <DeleteTaskDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleCloseDeleteDialog}
        task={deleteDialog.task}
      />
    </div>
  );
}
