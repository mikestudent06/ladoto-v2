import { Badge } from "@/components/ui/badge";
import { DataTable, type TableColumn } from "@/components/ui/data-table";
import { useProjects, useDeleteProject } from "@/hooks/use-projects";
import { formatDate } from "@/lib/utils";
import type { Project } from "@/types";

interface ProjectsTableProps {
  onExport?: () => void;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  onView?: (project: Project) => void;
}

export function ProjectsTable({
  onExport,
  onEdit,
  onDelete,
  onView,
}: ProjectsTableProps) {
  const { data: projects = [], isLoading } = useProjects();
  const deleteProject = useDeleteProject();

  const columns: TableColumn<Project>[] = [
    {
      key: "name",
      label: "Project Name",
      sortable: true,
      render: (value, project) => (
        <div>
          <div className="font-medium">{value}</div>
          {project.description && (
            <div className="text-sm text-muted-foreground line-clamp-1">
              {project.description}
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
      render: (value) => {
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

        return (
          <Badge variant={getStatusColor(value)}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </Badge>
        );
      },
      width: "15%",
    },
    {
      key: "tasks",
      label: "Tasks",
      render: (value) => {
        const taskCount = Array.isArray(value)
          ? value.length
          : value?.[0]?.count || 0;
        return (
          <div className="text-center">
            <span className="font-medium">{taskCount}</span>
            <span className="text-muted-foreground"> tasks</span>
          </div>
        );
      },
      width: "15%",
    },
    {
      key: "created_at",
      label: "Created",
      sortable: true,
      render: (value) => <div className="text-sm">{formatDate(value)}</div>,
      width: "20%",
    },
    {
      key: "updated_at",
      label: "Last Updated",
      sortable: true,
      render: (value) => (
        <div className="text-sm text-muted-foreground">{formatDate(value)}</div>
      ),
      width: "20%",
    },
  ];

  const handleBulkDelete = async (projects: Project[]) => {
    // Delete projects one by one (could be optimized with bulk API)
    for (const project of projects) {
      await deleteProject.mutateAsync(project.id);
    }
  };

  return (
    <DataTable
      data={projects}
      columns={columns}
      isLoading={isLoading}
      onEdit={onEdit}
      onDelete={onDelete}
      onView={onView}
      onBulkDelete={handleBulkDelete}
      onExport={onExport}
      searchPlaceholder="Search projects..."
      emptyMessage="No projects found. Create your first project to get started."
    />
  );
}
