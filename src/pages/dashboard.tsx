import { useProjects } from "@/hooks/use-projects";
import { useDashboardStats } from "@/hooks/use-tasks";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Plus,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { Project } from "@/types";

export function DashboardPage() {
  const {
    data: projects,
    isLoading: projectsLoading,
    error: projectsError,
  } = useProjects();
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useDashboardStats();

  if (projectsLoading || statsLoading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  if (projectsError || statsError) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load dashboard data. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  const recentProjects = projects?.slice(0, 3) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your projects and tasks.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Projects
              </p>
              <p className="text-2xl font-bold">{projects?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Tasks Completed
              </p>
              <p className="text-2xl font-bold">{stats?.completed || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                In Progress
              </p>
              <p className="text-2xl font-bold">{stats?.inProgress || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                High Priority
              </p>
              <p className="text-2xl font-bold">{stats?.highPriority || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/dashboard/projects">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </Link>
          <Link to="/dashboard/tasks">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Projects</h2>
          <Link to="/dashboard/projects">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>

        {recentProjects.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No projects yet</p>
            <Link to="/dashboard/projects">
              <Button>Create Your First Project</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentProjects.map((project: Project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{project.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {project.description}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium capitalize">
                    {project.status}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {Array.isArray(project.tasks)
                      ? project.tasks.length
                      : 0}{" "}
                    task(s)
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
