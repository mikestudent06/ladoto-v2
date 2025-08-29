import { Button } from "@/components/ui/button";

export function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            Manage your projects and track progress
          </p>
        </div>
        <Button>New Project</Button>
      </div>

      <div className="bg-white p-6 rounded-lg border text-center">
        <p className="text-muted-foreground">
          Projects functionality will be implemented in Phase 3 - Core CRUD
          Operations
        </p>
      </div>
    </div>
  );
}
