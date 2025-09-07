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
import { useDeleteTask } from "@/hooks/use-tasks";
import type { Task } from "@/types";

interface DeleteTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}

export function DeleteTaskDialog({
  isOpen,
  onClose,
  task,
}: DeleteTaskDialogProps) {
  const deleteTask = useDeleteTask();

  if (!task) return null;

  const handleDelete = async () => {
    try {
      await deleteTask.mutateAsync(task.id);
      onClose();
    } catch (error) {
      // Gestion des erreurs dans le hook de mutation
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Supprimer la tâche</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer "{task.title}" ? Cette action ne
            peut pas être annulée.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteTask.isPending}
          >
            {deleteTask.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Supprimer la tâche
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
