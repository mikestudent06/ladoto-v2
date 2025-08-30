import { useEffect } from "react";
import { auth } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth-store";
import type { User } from "@/types";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, setLoading, initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize auth state on app start
    initializeAuth();

    // Listen for auth changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = auth.onAuthStateChange(async (event, session) => {
      console.log("Auth event:", event, session?.user?.email);

      if (event === "SIGNED_IN" && session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email!,
          full_name:
            session.user.user_metadata?.full_name ||
            session.user.email!.split("@")[0],
          avatar_url: session.user.user_metadata?.avatar_url,
          created_at: session.user.created_at,
          updated_at: session.user.updated_at!,
        };
        setUser(user);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [setUser, setLoading, initializeAuth]);

  return <>{children}</>;
}

// Custom hook for auth-related functionality
export function useAuthActions() {
  const authStore = useAuthStore();

  return {
    login: authStore.login,
    register: authStore.register,
    logout: authStore.logout,
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    isLoading: authStore.loading,
  };
}
