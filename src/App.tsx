import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";

// Layouts
import { RootLayout } from "@/components/layouts/root-layout";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";

// Auth
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AuthProvider } from "@/components/auth/auth-provider";

// UI
import { ErrorBoundary } from "@/components/ui/error-boundary";

// Pages
import { HomePage } from "@/pages/home";
import { LoginPage } from "@/pages/auth/login";
import { RegisterPage } from "@/pages/auth/register";
import { DashboardPage } from "@/pages/dashboard";
import { ProjectsPage } from "@/pages/projects";
import { TasksPage } from "@/pages/tasks";
import { SettingsPage } from "@/pages/settings";
import NotFound from "@/components/NotFound";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-background font-sans antialiased">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<RootLayout />}>
                  <Route index element={<HomePage />} />
                </Route>

                {/* Auth Routes */}
                <Route path="/auth" element={<AuthLayout />}>
                  <Route path="login" element={<LoginPage />} />
                  <Route path="register" element={<RegisterPage />} />
                </Route>

                {/* Protected Dashboard Routes */}
                {/* Protected Dashboard Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<DashboardPage />} />
                  <Route path="projects" element={<ProjectsPage />} />
                  <Route path="tasks" element={<TasksPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>

            {/* Global Toast Notifications */}
            <Toaster position="top-right" richColors />
          </Router>
        </AuthProvider>

        {/* React Query DevTools */}
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
