export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to TaskFlow! Here's an overview of your projects and tasks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Projects
          </h3>
          <p className="text-2xl font-bold mt-2">12</p>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-sm font-medium text-muted-foreground">
            Active Tasks
          </h3>
          <p className="text-2xl font-bold mt-2">48</p>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-sm font-medium text-muted-foreground">
            Completed Today
          </h3>
          <p className="text-2xl font-bold mt-2">6</p>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-sm font-medium text-muted-foreground">
            Team Members
          </h3>
          <p className="text-2xl font-bold mt-2">8</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Task "Update landing page" completed</span>
            <span className="text-muted-foreground ml-auto">2 hours ago</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>New task "Fix navigation bug" assigned</span>
            <span className="text-muted-foreground ml-auto">4 hours ago</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Project "Mobile App" created</span>
            <span className="text-muted-foreground ml-auto">1 day ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
