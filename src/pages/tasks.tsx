import { Button } from "@/components/ui/button";

export function TasksPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">
            View and manage all your tasks
          </p>
        </div>
        <Button>New Task</Button>
      </div>

      <div className="bg-white p-6 rounded-lg border text-center">
        <p className="text-muted-foreground">
          Tasks functionality will be implemented in Phase 3 - Core CRUD
          Operations
        </p>
      </div>
    </div>
  );
}
