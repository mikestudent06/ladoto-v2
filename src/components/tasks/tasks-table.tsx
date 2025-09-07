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
      label: "Task",
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
              in {task.project.name}
            </div>
          )}
        </div>
      ),
      width: "30%",
    },
    {
      key: "status",
      label: "Status",
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
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        );
      },
      width: "15%",
    },
    {
      key: "priority",
      label: "Priority",
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

        return (
          <Badge variant={getPriorityColor(value)} className="gap-1">
            <Flag className="h-3 w-3" />
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </Badge>
        );
      },
      width: "15%",
    },
    {
      key: "due_date",
      label: "Due Date",
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
      label: "Updated",
      sortable: true,
      render: (value) => (
        <div className="text-sm text-muted-foreground">{formatDate(value)}</div>
      ),
      width: "20%",
    },
  ];

  const handleBulkDelete = async (tasks: Task[]) => {
    // Delete tasks one by one (could be optimized with bulk API)
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
      searchPlaceholder="Search tasks..."
      emptyMessage="No tasks found. Create your first task to get started."
    />
  );
}
