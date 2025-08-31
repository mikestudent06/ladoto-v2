import { useMemo, useState } from "react";
import { Plus, Search, Filter, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ViewToggle, type ViewMode } from "@/components/common/view-toggle";

import { useProjects } from "@/hooks/use-projects";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectModal } from "@/components/projects/project-modal";
import { DeleteProjectDialog } from "@/components/projects/delete-project-dialog";
import { ProjectsTable } from "@/components/projects/projects-table";

import type { Project } from "@/types";

export function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const { data: projects, isLoading, error } = useProjects();

  // ✅ UNIFIED MODAL STATE - works for both card and table views
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: "create" | "edit" | "view";
    project?: Project;
  }>({
    isOpen: false,
    mode: "create",
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    project: Project | null;
  }>({
    isOpen: false,
    project: null,
  });

  // Your smart memoized filtering
  const filteredProjects = useMemo(() => {
    return projects?.filter(
      (project) =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projects, searchTerm]);

  // ✅ UNIFIED HANDLERS - work for both views
  const handleCreateProject = () => {
    setModalState({ isOpen: true, mode: "create" });
  };

  const handleEditProject = (project: Project) => {
    setModalState({ isOpen: true, mode: "edit", project });
  };

  const handleViewProject = (project: Project) => {
    setModalState({ isOpen: true, mode: "view", project });
  };

  const handleDeleteProject = (project: Project) => {
    console.log("project", project); // Your debug log
    setDeleteDialog({ isOpen: true, project });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, mode: "create", project: undefined });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, project: null });
  };

  const handleExport = () => {
    // Export projects to CSV
    const csv = [
      ["Name", "Description", "Status", "Tasks", "Created", "Updated"],
      ...(projects?.map((project) => [
        project.name,
        project.description || "",
        project.status,
        Array.isArray(project.tasks) ? project.tasks.length.toString() : "0",
        project.created_at,
        project.updated_at,
      ]) || []),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `projects-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading projects..." />;
  }

  if (error) {
    return (
      <Alert>
        <AlertDescription>
          Failed to load projects. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            Manage your projects and track progress
          </p>
        </div>
        {/* ✅ ADD BUTTON - works in both views */}
        <Button onClick={handleCreateProject}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 items-center gap-4">
          {/* Search - only show for card view, table has its own search */}
          {viewMode === "cards" && (
            <>
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <ViewToggle view={viewMode} onViewChange={setViewMode} />
        </div>
      </div>

      {/* Content */}
      {viewMode === "table" ? (
        <ProjectsTable
          onExport={handleExport}
          onEdit={handleEditProject}
          onDelete={handleDeleteProject}
          onView={handleViewProject}
        />
      ) : (
        <>
          {/* Projects Grid - Your existing logic */}
          {filteredProjects?.length === 0 ? (
            <div className="text-center py-12">
              <div className="max-w-sm mx-auto">
                <h3 className="text-lg font-medium mb-2">
                  {searchTerm ? "No projects found" : "No projects yet"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Get started by creating your first project"}
                </p>
                {!searchTerm && (
                  <Button onClick={handleCreateProject}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects?.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={handleEditProject}
                  onDelete={handleDeleteProject}
                  onView={handleViewProject} // ✅ FIXED: Added view handler
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ✅ ALWAYS RENDER MODALS - works for both views */}
      <ProjectModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        project={modalState.project}
        mode={modalState.mode}
      />

      <DeleteProjectDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleCloseDeleteDialog}
        project={deleteDialog.project}
      />
    </div>
  );
}
