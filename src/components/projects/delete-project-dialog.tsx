import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useDeleteProject } from "@/hooks/use-projects";
import type { Project } from "@/types";

interface DeleteProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

export function DeleteProjectDialog({
  isOpen,
  onClose,
  project,
}: DeleteProjectDialogProps) {
  const deleteProject = useDeleteProject();

  if (!project) return null;

  const handleDelete = async () => {
    try {
      await deleteProject.mutateAsync(project.id);
      onClose();
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Delete Project</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{project.name}"? This action cannot
            be undone. All tasks in this project will also be deleted.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteProject.isPending}
          >
            {deleteProject.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Delete Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
