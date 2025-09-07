import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Folder, CheckSquare, User, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuthStore } from "@/store/auth-store";

const navigation = [
  { name: "Tableau de bord", href: "/dashboard", icon: Home },
  { name: "Projets", href: "/dashboard/projects", icon: Folder },
  { name: "Tâches", href: "/dashboard/tasks", icon: CheckSquare },
];

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate("/auth/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Overlay sidebar mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </div>
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:inset-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-12 px-6 border-b">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="font-bold">L</span>
              </div>
              <span className="font-bold text-xl">Latodo</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Section utilisateur */}
          <div className="border-t p-4">
            <div className="flex items-center space-x-3 px-3 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.full_name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start mt-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Se déconnecter
            </Button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="lg:ml-64">
        {/* Barre supérieure */}
        <header className="bg-white border-b px-4 py-4 h-12 lg:px-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex items-center space-x-4 ml-auto">
              <div className="text-sm text-gray-600">
                Bon retour, {user?.full_name?.split(" ")[0] || "Utilisateur"} !
                👋
              </div>
            </div>
          </div>
        </header>

        {/* Contenu de la page */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
