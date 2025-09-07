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
      label: "Nom du projet",
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
      label: "Statut",
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

        const getStatusText = (status: Project["status"]) => {
          switch (status) {
            case "active":
              return "Actif";
            case "completed":
              return "Terminé";
            case "archived":
              return "Archivé";
            default:
              return status;
          }
        };

        return (
          <Badge variant={getStatusColor(value)}>{getStatusText(value)}</Badge>
        );
      },
      width: "15%",
    },
    {
      key: "tasks",
      label: "Tâches",
      render: (value) => {
        const taskCount = Array.isArray(value)
          ? value.length
          : value?.[0]?.count || 0;
        return (
          <div className="text-center">
            <span className="font-medium">{taskCount}</span>
            <span className="text-muted-foreground"> tâches</span>
          </div>
        );
      },
      width: "15%",
    },
    {
      key: "created_at",
      label: "Créé",
      sortable: true,
      render: (value) => <div className="text-sm">{formatDate(value)}</div>,
      width: "20%",
    },
    {
      key: "updated_at",
      label: "Dernière mise à jour",
      sortable: true,
      render: (value) => (
        <div className="text-sm text-muted-foreground">{formatDate(value)}</div>
      ),
      width: "20%",
    },
  ];

  const handleBulkDelete = async (projects: Project[]) => {
    // Supprimer les projets un par un (pourrait être optimisé avec une API de suppression en lot)
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
      searchPlaceholder="Rechercher des projets..."
      emptyMessage="Aucun projet trouvé. Créez votre premier projet pour commencer."
    />
  );
}
