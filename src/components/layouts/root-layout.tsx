import { Outlet, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="font-bold">T</span>
            </div>
            <span className="font-bold text-xl">TaskFlow</span>
          </Link>

          <nav className="flex items-center space-x-4">
            <Link to="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/auth/register">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-10 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with React, TypeScript, and shadcn/ui. Learn modern frontend
            development.
          </p>
        </div>
      </footer>
    </div>
  );
}
