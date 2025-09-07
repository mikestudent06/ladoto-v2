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
          isViewing
            ? "max-h-full"
            : "w-full h-full sm:max-w-[1100px] sm:max-h-[810px] overflow-y-scroll"
        )}
      >
        <DialogHeader>
          <DialogTitle>
            {isCreating && "Créer une nouvelle tâche"}
            {isEditing && !isViewing && "Modifier la tâche"}
            {isViewing && !editMode && "Détails de la tâche"}
          </DialogTitle>
          <DialogDescription>
            {isCreating && "Ajouter une nouvelle tâche à votre projet."}
            {isEditing && !isViewing && "Apporter des modifications à votre tâche ici."}
            {isViewing && !editMode && "Consulter les détails et informations de la tâche."}
          </DialogDescription>
        </DialogHeader>

        {isViewing && !editMode ? (
          // Mode Visualisation - Détails de la tâche en lecture seule
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{task?.title}</h3>
                <div className="flex items-center space-x-2 mt-2">
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
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Description
                  </h4>
                  <p className="text-sm">{task.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {task?.project && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      Projet
                    </h4>
                    <div className="flex items-center space-x-1">
                      <Folder className="h-4 w-4" />
                      <span className="text-sm">{task.project.name}</span>
                    </div>
                  </div>
                )}

                {task?.due_date && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      Date d'échéance
                    </h4>
                    <div
                      className={`flex items-center space-x-1 text-sm ${
                        isOverdue ? "text-red-600" : ""
                      }`}
                    >
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(task.due_date)}</span>
                      {isOverdue && (
                        <span className="text-xs font-medium">(En retard)</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Créé
                  </h4>
                  <span>{formatDate(task?.created_at!)}</span>
                </div>
                {task?.updated_at !== task?.created_at && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      Dernière mise à jour
                    </h4>
                    <span>{formatDate(task?.updated_at!)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Fermer
              </Button>
              <Button onClick={handleEdit}>
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