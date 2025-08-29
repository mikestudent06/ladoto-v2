import { Outlet, Link } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-12 bg-gradient-to-br from-primary/20 via-primary to-background">
        <div className="max-w-md">
          <Link to="/" className="flex items-center space-x-2 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="font-bold text-xl">T</span>
            </div>
            <span className="font-bold text-2xl">TaskFlow</span>
          </Link>

          <h1 className="text-4xl font-bold tracking-tight mb-6">
            Manage tasks like a pro
          </h1>

          <p className="text-lg text-muted-foreground mb-8 text-white/90">
            Collaborate with your team, track progress, and deliver projects on
            time. Built with modern tools for the modern developer.
          </p>

          <ul className="space-y-4 text-sm text-muted-foreground text-white/80">
            <li className="flex items-center space-x-2">
              <div className="w-1 h-1 bg-white rounded-full" />
              <span>Real-time collaboration</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-1 h-1 bg-white rounded-full" />
              <span>File uploads and attachments</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-1 h-1 bg-white rounded-full" />
              <span>Advanced filtering and search</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12">
        <div className="mx-auto w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
