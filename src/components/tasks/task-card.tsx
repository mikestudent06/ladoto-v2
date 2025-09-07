import { Calendar, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { Task } from "@/types";

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onStatusChange?: (task: Task, status: Task["status"]) => void;
  showProject?: boolean;
  onView?: (task: Task) => void;
}

export function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  showProject = false,
  onView,
}: TaskCardProps) {
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
    task.due_date &&
    task.due_date < new Date().toISOString().split("T")[0] &&
    task.status !== "done";

  return (
    <div className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{task.title}</h4>
          {showProject && task.project && (
            <p className="text-xs text-muted-foreground mt-1">
              dans {task.project.name}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-1 ml-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView?.(task)}
            className="h-8 px-2"
          >
            Voir
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit?.(task)}
            className="h-8 px-2"
          >
            Modifier
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete?.(task)}
            className="h-8 px-2"
          >
            Supprimer
          </Button>
        </div>
      </div>

      {task.description && (
        <p className="text-muted-foreground text-xs mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Badge variant={getStatusColor(task.status)} className="text-xs">
            {getStatusText(task.status)}
          </Badge>
          <Badge variant={getPriorityColor(task.priority)} className="text-xs">
            <Flag className="h-3 w-3 mr-1" />
            {getPriorityText(task.priority)}
          </Badge>
        </div>

        {task.due_date && (
          <div
            className={`flex items-center space-x-1 text-xs ${
              isOverdue ? "text-red-600" : "text-muted-foreground"
            }`}
          >
            <Calendar className="h-3 w-3" />
            <span>{formatDate(task.due_date)}</span>
          </div>
        )}
      </div>

      {onStatusChange && (
        <div className="mt-3 pt-3 border-t">
          <div className="flex space-x-1">
            {(["todo", "in_progress", "done"] as const).map((status) => (
              <Button
                key={status}
                variant={task.status === status ? "default" : "outline"}
                size="sm"
                onClick={() => onStatusChange(task, status)}
                className="h-7 px-2 text-xs"
              >
                {getStatusText(status)}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
