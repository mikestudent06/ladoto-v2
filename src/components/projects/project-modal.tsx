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
import { Calendar, CheckSquare, Edit } from "lucide-react";
import { ProjectForm } from "./project-form";
import { useCreateProject, useUpdateProject } from "@/hooks/use-projects";
import { formatDate } from "@/lib/utils";
import type { Project, ProjectFormData } from "@/types";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project;
  mode: "create" | "edit" | "view";
}

export function ProjectModal({
  isOpen,
  onClose,
  project,
  mode,
}: ProjectModalProps) {
  const [editMode, setEditMode] = useState(false);
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();

  const isEditing = mode === "edit" || editMode;
  const isViewing = mode === "view" && !editMode;
  const isCreating = mode === "create";
  const isLoading = createProject.isPending || updateProject.isPending;

  const handleSubmit = async (data: ProjectFormData) => {
    try {
      if (isCreating) {
        await createProject.mutateAsync(data);
      } else {
        await updateProject.mutateAsync({
          id: project!.id,
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

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "active":
        return "default";
      case "completed":
        return "success";
      case "archived":
        return "secondary";
      default:
        return "default";
    }
  };

  const getStatusText = (status: Project["status"]) => {
    switch (status) {
      case "active":
        return "Actif";
      case "completed":
        return "Terminé";
      case "archived":
        return "Archivé";
      default:
        return status;
    }
  };

  const taskCount = Array.isArray(project?.tasks) ? project.tasks.length : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isCreating && "Créer un nouveau projet"}
            {isEditing && !isViewing && "Modifier le projet"}
            {isViewing && !editMode && "Détails du projet"}
          </DialogTitle>
          <DialogDescription>
            {isCreating &&
              "Ajoutez un nouveau projet pour organiser vos tâches."}
            {isEditing &&
              !isViewing &&
              "Apportez des modifications à votre projet ici."}
            {isViewing &&
              !editMode &&
              "Consultez les détails et informations du projet."}
          </DialogDescription>
        </DialogHeader>

        {isViewing && !editMode ? (
          // Mode Visualisation - Détails du projet en lecture seule
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{project?.name}</h3>
                <Badge
                  variant={getStatusColor(project?.status!)}
                  className="mt-1"
                >
                  {getStatusText(project?.status!)}
                </Badge>
              </div>

              {project?.description && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Description
                  </h4>
                  <p className="text-sm">{project.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Tâches
                  </h4>
                  <div className="flex items-center space-x-1">
                    <CheckSquare className="h-4 w-4" />
                    <span className="text-sm">{taskCount} tâches</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Créé
                  </h4>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      {formatDate(project?.created_at!)}
                    </span>
                  </div>
                </div>
              </div>

              {project?.updated_at !== project?.created_at && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Dernière mise à jour
                  </h4>
                  <span className="text-sm">
                    {formatDate(project?.updated_at!)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Fermer
              </Button>
              <Button onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier le projet
              </Button>
            </div>
          </div>
        ) : (
          // Mode Création/Modification - Formulaire
          <ProjectForm
            project={project}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
