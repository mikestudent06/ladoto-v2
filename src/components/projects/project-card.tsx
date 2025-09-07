import { Calendar, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  onView?: (project: Project) => void;
}

export function ProjectCard({
  project,
  onEdit,
  onDelete,
  onView,
}: ProjectCardProps) {
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
        return "Active";
      case "completed":
        return "Completed";
      case "archived":
        return "Archived";
      default:
        return status;
    }
  };

  const taskCount = Array.isArray(project.tasks)
    ? project.tasks.length
    : project.tasks?.[0]?.count || 0;

  return (
    <div className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">{project.name}</h3>
          <Badge variant={getStatusColor(project.status)} className="mt-1">
            {getStatusText(project.status)}
          </Badge>
        </div>
        <div className="flex items-center space-x-1 ml-2">
          <Button variant="ghost" size="sm" onClick={() => onView?.(project)}>
            View
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit?.(project)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete?.(project)}>
            Delete
          </Button>
        </div>
      </div>

      {project.description && (
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {project.description}
        </p>
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <CheckSquare className="h-4 w-4" />
            <span>{taskCount} tasks</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>Created {formatDate(project.created_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
