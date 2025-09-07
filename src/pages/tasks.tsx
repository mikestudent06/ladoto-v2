import { useEffect, useState } from "react";
import { Plus, Search, Download } from "lucide-react";
import { useDebounce } from "use-debounce";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ViewToggle, type ViewMode } from "@/components/common/view-toggle";

import { useTasks, useUpdateTaskStatus } from "@/hooks/use-tasks";
import { useProjects } from "@/hooks/use-projects";
import { TaskCard } from "@/components/tasks/task-card";
import { TaskModal } from "@/components/tasks/task-modal";
import { DeleteTaskDialog } from "@/components/tasks/delete-task-dialog";
import { TasksTable } from "@/components/tasks/tasks-table";

import type { Task, TaskFilters } from "@/types";

export function TasksPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [filters, setFilters] = useState<TaskFilters>({});
  const [searchInput, setSearchInput] = useState(""); // Your separate input state
  const [debouncedSearch] = useDebounce(searchInput, 500); // Your 500ms debounce

  // Your debounced search effect
  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: debouncedSearch || undefined }));
  }, [debouncedSearch]);

  // ✅ UNIFIED MODAL STATE - works for both card and table views
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: "create" | "edit" | "view";
    task?: Task;
  }>({
    isOpen: false,
    mode: "create",
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    task: Task | null;
  }>({
    isOpen: false,
    task: null,
  });

  const { data: tasks, isLoading, error, isFetching } = useTasks(filters);
  const { data: projects } = useProjects();
  const updateTaskStatus = useUpdateTaskStatus();

  // Your smart loading state tracking
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  useEffect(() => {
    if (tasks !== undefined && !hasInitiallyLoaded) {
      setHasInitiallyLoaded(true);
    }
  }, [tasks, hasInitiallyLoaded]);

  // ✅ UNIFIED HANDLERS - work for both views
  const handleCreateTask = () => {
    setModalState({ isOpen: true, mode: "create" });
  };

  const handleEditTask = (task: Task) => {
    setModalState({ isOpen: true, mode: "edit", task });
  };

  const handleViewTask = (task: Task) => {
    setModalState({ isOpen: true, mode: "view", task });
  };

  const handleDeleteTask = (task: Task) => {
    setDeleteDialog({ isOpen: true, task });
  };

  const handleStatusChange = async (task: Task, status: Task["status"]) => {
    await updateTaskStatus.mutateAsync({ id: task.id, status });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, mode: "create", task: undefined });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, task: null });
  };

  // Your improved search handler
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value); // only update input
  };

  const handleExport = () => {
    // Export tasks to CSV
    const csv = [
      [
        "Title",
        "Description",
        "Status",
        "Priority",
        "Project",
        "Due Date",
        "Created",
        "Updated",
      ],
      ...(tasks?.map((task) => [
        task.title,
        task.description || "",
        task.status,
        task.priority,
        task.project?.name || "",
        task.due_date || "",
        task.created_at,
        task.updated_at,
      ]) || []),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tasks-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Your smart loading logic
  if (isLoading && !hasInitiallyLoaded) {
    return <LoadingSpinner text="Loading tasks..." />;
  }

  if (error) {
    return (
      <Alert>
        <AlertDescription>
          Failed to load tasks. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">
            View and manage all your tasks
          </p>
        </div>
        {/* ✅ ADD BUTTON - works in both views */}
        <Button onClick={handleCreateTask}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 items-center gap-4">
          {/* Filters - only show for card view, table has its own filters */}
          {viewMode === "cards" && (
            <>
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchInput} // Your immediate user input
                  onChange={handleSearch}
                  className="pl-10 pr-10"
                />
                {/* Your subtle loading indicator for search */}
                {isFetching && hasInitiallyLoaded && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600"></div>
                  </div>
                )}
              </div>

              {/* Your fixed Select components using "all" instead of empty string */}
              <Select
                value={filters.project_id || "all"}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    project_id: value === "all" ? undefined : value,
                  }))
                }
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects?.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.status?.[0] || "all"}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    status:
                      value === "all" ? undefined : [value as Task["status"]],
                  }))
                }
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
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
        <TasksTable
          filters={filters}
          onExport={handleExport}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          onView={handleViewTask}
        />
      ) : (
        <>
          {/* Tasks Grid - Your existing logic */}
          {tasks?.length === 0 ? (
            <div className="text-center py-12">
              <div className="max-w-sm mx-auto">
                <h3 className="text-lg font-medium mb-2">No tasks found</h3>
                <p className="text-muted-foreground mb-6">
                  {filters.search ||
                  filters.project_id ||
                  filters.status?.length
                    ? "Try adjusting your filters"
                    : "Get started by creating your first task"}
                </p>
                <Button onClick={handleCreateTask}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks?.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleStatusChange}
                  showProject
                  onView={handleViewTask}
                />
              ))}
            </div>
          )}
        </>
      )}

      <TaskModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        task={modalState.task}
        mode={modalState.mode}
      />

      <DeleteTaskDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleCloseDeleteDialog}
        task={deleteDialog.task}
      />
    </div>
  );
}
