import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Flag, Edit, Folder } from "lucide-react";
import { TaskForm } from "./task-form";
import { useCreateTask, useUpdateTask } from "@/hooks/use-tasks";
import { cn, formatDate } from "@/lib/utils";
import type { Task, TaskFormData } from "@/types";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task;
  projectId?: string;
  mode: "create" | "edit" | "view";
}

export function TaskModal({
  isOpen,
  onClose,
  task,
  projectId,
  mode,
}: TaskModalProps) {
  const [editMode, setEditMode] = useState(false);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const isEditing = mode === "edit" || editMode;
  const isViewing = mode === "view" && !editMode;
  const isCreating = mode === "create";
  const isLoading = createTask.isPending || updateTask.isPending;

  const handleSubmit = async (data: TaskFormData) => {
    try {
      if (isCreating) {
        await createTask.mutateAsync(data);
      } else {
        await updateTask.mutateAsync({
          id: task!.id,
          data,
        });
      }
      onClose();
      setEditMode(false);
    } catch (error) {
      // Gestion des erreurs dans les hooks de mutation
    }
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    if (mode === "view") {
      setEditMode(false);
    } else {
      onClose();
    }
  };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "todo":
        return "secondary";
      case "in_progress":
        return "info";
      case "done":
        return "success";
      default:
        return "default";
    }
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "warning";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  const getStatusText = (status: Task["status"]) => {
    switch (status) {
      case "todo":
        return "À faire";
      case "in_progress":
        return "En cours";
      case "done":
        return "Terminé";
      default:
        return status;
    }
  };

  const getPriorityText = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "Haute";
      case "medium":
        return "Moyenne";
      case "low":
        return "Basse";
      default:
        return priority;
    }
  };

  const isOverdue =
    task?.due_date &&
    task.due_date < new Date().toISOString().split("T")[0] &&
    task.status !== "done";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          // Base: mobile-first responsive design
          "w-full max-w-full h-full max-h-screen overflow-y-auto",
          // Sur mobile (default): plein écran
          "sm:max-w-lg sm:h-auto sm:max-h-[60vh]",
          // Sur desktop: taille adaptée au contenu
          "md:max-w-2xl lg:max-w-3xl",
          // Padding adaptatif
          "p-4 sm:p-6",
          // Mode formulaire: plus d'espace sur desktop
          !isViewing && "sm:max-w-2xl md:max-w-3xl lg:max-w-4xl"
        )}
      >
        <DialogHeader className="space-y-2 sm:space-y-3">
          <DialogTitle className="text-lg sm:text-xl">
            {isCreating && "Créer une nouvelle tâche"}
            {isEditing && !isViewing && "Modifier la tâche"}
            {isViewing && !editMode && "Détails de la tâche"}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            {isCreating && "Ajouter une nouvelle tâche à votre projet."}
            {isEditing &&
              !isViewing &&
              "Apporter des modifications à votre tâche ici."}
            {isViewing &&
              !editMode &&
              "Consulter les détails et informations de la tâche."}
          </DialogDescription>
        </DialogHeader>

        {isViewing && !editMode ? (
          // Mode Visualisation - Détails de la tâche en lecture seule
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-3">
                <h3 className="text-base sm:text-lg font-semibold leading-tight">
                  {task?.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={getStatusColor(task?.status!)}
                    className="text-xs"
                  >
                    {getStatusText(task?.status!)}
                  </Badge>
                  <Badge
                    variant={getPriorityColor(task?.priority!)}
                    className="text-xs gap-1"
                  >
                    <Flag className="h-3 w-3" />
                    {getPriorityText(task?.priority!)}
                  </Badge>
                </div>
              </div>

              {task?.description && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Description
                  </h4>
                  <p className="text-sm leading-relaxed">{task.description}</p>
                </div>
              )}

              {/* Grid responsive: 1 colonne sur mobile, 2 sur desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {task?.project && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Projet
                    </h4>
                    <div className="flex items-center space-x-2">
                      <Folder className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm truncate">
                        {task.project.name}
                      </span>
                    </div>
                  </div>
                )}

                {task?.due_date && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Date d'échéance
                    </h4>
                    <div
                      className={`flex items-center space-x-2 text-sm ${
                        isOverdue ? "text-red-600" : ""
                      }`}
                    >
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span>{formatDate(task.due_date)}</span>
                      {isOverdue && (
                        <span className="text-xs font-medium whitespace-nowrap">
                          (En retard)
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Dates de création/modification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Créé
                  </h4>
                  <span className="text-sm">
                    {formatDate(task?.created_at!)}
                  </span>
                </div>
                {task?.updated_at !== task?.created_at && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Dernière mise à jour
                    </h4>
                    <span className="text-sm">
                      {formatDate(task?.updated_at!)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions - Stack sur mobile, inline sur desktop */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto"
              >
                Fermer
              </Button>
              <Button onClick={handleEdit} className="w-full sm:w-auto">
                <Edit className="h-4 w-4 mr-2" />
                Modifier la tâche
              </Button>
            </div>
          </div>
        ) : (
          // Mode Création/Modification - Formulaire
          <TaskForm
            task={task}
            projectId={projectId}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
