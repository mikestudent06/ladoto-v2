import { Calendar, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable, type TableColumn } from "@/components/ui/data-table";
import {
  useTasks,
  useDeleteTask,
  useUpdateTaskStatus,
} from "@/hooks/use-tasks";
import { formatDate } from "@/lib/utils";
import type { Task, TaskFilters } from "@/types";

interface TasksTableProps {
  filters?: TaskFilters;
  onExport?: () => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onView?: (task: Task) => void;
}

export function TasksTable({
  filters,
  onExport,
  onEdit,
  onDelete,
  onView,
}: TasksTableProps) {
  const { data: tasks = [], isLoading } = useTasks(filters || {});
  const deleteTask = useDeleteTask();
  const updateTaskStatus = useUpdateTaskStatus();

  const columns: TableColumn<Task>[] = [
    {
      key: "title",
      label: "Tâche",
      sortable: true,
      render: (value, task) => (
        <div>
          <div className="font-medium">{value}</div>
          {task.description && (
            <div className="text-sm text-muted-foreground line-clamp-1">
              {task.description}
            </div>
          )}
          {task.project && (
            <div className="text-xs text-muted-foreground mt-1">
              dans {task.project.name}
            </div>
          )}
        </div>
      ),
      width: "30%",
    },
    {
      key: "status",
      label: "Statut",
      sortable: true,
      filterable: true,
      render: (value, task) => {
        return (
          <select
            value={value}
            onChange={(e) =>
              updateTaskStatus.mutate({
                id: task.id,
                status: e.target.value as Task["status"],
              })
            }
            className="bg-transparent border-none text-sm font-medium focus:outline-none"
          >
            <option value="todo">À faire</option>
            <option value="in_progress">En cours</option>
            <option value="done">Terminé</option>
          </select>
        );
      },
      width: "15%",
    },
    {
      key: "priority",
      label: "Priorité",
      sortable: true,
      filterable: true,
      render: (value) => {
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

        return (
          <Badge variant={getPriorityColor(value)} className="gap-1">
            <Flag className="h-3 w-3" />
            {getPriorityText(value)}
          </Badge>
        );
      },
      width: "15%",
    },
    {
      key: "due_date",
      label: "Date d'échéance",
      sortable: true,
      render: (value, task) => {
        if (!value) return <span className="text-muted-foreground">-</span>;

        const isOverdue =
          new Date(value) < new Date() && task.status !== "done";

        return (
          <div
            className={`flex items-center gap-1 text-sm ${
              isOverdue ? "text-red-600" : ""
            }`}
          >
            <Calendar className="h-3 w-3" />
            {formatDate(value)}
          </div>
        );
      },
      width: "20%",
    },
    {
      key: "updated_at",
      label: "Mis à jour",
      sortable: true,
      render: (value) => (
        <div className="text-sm text-muted-foreground">{formatDate(value)}</div>
      ),
      width: "20%",
    },
  ];

  const handleBulkDelete = async (tasks: Task[]) => {
    // Supprimer les tâches une par une (pourrait être optimisé avec une API de suppression en lot)
    for (const task of tasks) {
      await deleteTask.mutateAsync(task.id);
    }
  };

  return (
    <DataTable
      data={tasks}
      columns={columns}
      isLoading={isLoading}
      onEdit={onEdit}
      onDelete={onDelete}
      onView={onView}
      onBulkDelete={handleBulkDelete}
      onExport={onExport}
      searchPlaceholder="Rechercher des tâches..."
      emptyMessage="Aucune tâche trouvée. Créez votre première tâche pour commencer."
    />
  );
}
