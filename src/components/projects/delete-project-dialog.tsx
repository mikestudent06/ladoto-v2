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
      // Gestion des erreurs dans le hook de mutation
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Supprimer le projet</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer "{project.name}" ? Cette action
            ne peut pas être annulée. Toutes les tâches de ce projet seront
            également supprimées.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteProject.isPending}
          >
            {deleteProject.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Supprimer le projet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
