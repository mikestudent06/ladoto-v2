import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Users, Zap } from "lucide-react";

export function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Task management for{" "}
            <span className="text-primary">modern teams</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Streamline your workflow, collaborate seamlessly, and deliver
            projects on time. Built with the latest web technologies for the
            modern developer.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link to="/auth/register">
              <Button size="lg" className="flex items-center">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth/login">
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-24 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to manage tasks
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Built with modern tools: React, TypeScript, Tailwind CSS, and more
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-6 rounded-lg border">
              <CheckCircle className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Smart Task Management
              </h3>
              <p className="text-muted-foreground">
                Create, assign, and track tasks with powerful filtering and
                search capabilities.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <Users className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Team Collaboration</h3>
              <p className="text-muted-foreground">
                Work together seamlessly with real-time updates and file
                sharing.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <Zap className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Modern Stack</h3>
              <p className="text-muted-foreground">
                Built with React, TypeScript, shadcn/ui, Zustand, and TanStack
                Query.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
