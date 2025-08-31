import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TaskForm } from "./task-form";
import { useCreateTask, useUpdateTask } from "@/hooks/use-tasks";
import type { Task, TaskFormData } from "@/types";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task;
  projectId?: string;
  mode: "create" | "edit";
}

export function TaskModal({
  isOpen,
  onClose,
  task,
  projectId,
  mode,
}: TaskModalProps) {
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const isEditing = mode === "edit" && !!task;
  const isLoading = createTask.isPending || updateTask.isPending;

  const handleSubmit = async (data: TaskFormData) => {
    try {
      if (isEditing) {
        await updateTask.mutateAsync({
          id: task.id,
          data,
        });
      } else {
        await createTask.mutateAsync(data);
      }
      onClose();
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full h-full sm:max-w-[1100px] sm:max-h-[810px] overflow-y-scroll">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Task" : "Create New Task"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Make changes to your task here."
              : "Add a new task to your project."}
          </DialogDescription>
        </DialogHeader>

        <TaskForm
          task={task}
          projectId={projectId}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
