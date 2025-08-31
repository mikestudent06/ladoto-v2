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
      // Error handling is done in the mutation hooks
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
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const taskCount = Array.isArray(project?.tasks)
    ? project.tasks.length
    : project?.tasks?.[0]?.count || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isCreating && "Create New Project"}
            {isEditing && !isViewing && "Edit Project"}
            {isViewing && !editMode && "Project Details"}
          </DialogTitle>
          <DialogDescription>
            {isCreating && "Add a new project to organize your tasks."}
            {isEditing && !isViewing && "Make changes to your project here."}
            {isViewing && !editMode && "View project details and information."}
          </DialogDescription>
        </DialogHeader>

        {isViewing && !editMode ? (
          // View Mode - Read-only project details
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
                    Tasks
                  </h4>
                  <div className="flex items-center space-x-1">
                    <CheckSquare className="h-4 w-4" />
                    <span className="text-sm">{taskCount} tasks</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Created
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
                    Last Updated
                  </h4>
                  <span className="text-sm">
                    {formatDate(project?.updated_at!)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </Button>
            </div>
          </div>
        ) : (
          // Create/Edit Mode - Form
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
