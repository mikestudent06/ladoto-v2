// import { create } from 'zustand'
// import { devtools, persist } from 'zustand/middleware'
// import { toast } from 'sonner'
// import { auth } from '@/lib/supabase'
// import type { User, AuthState } from '@/types'

// interface AuthStore extends AuthState {
//   // Actions
//   login: (email: string, password: string) => Promise<boolean>
//   register: (email: string, password: string, fullName: string) => Promise<boolean>
//   logout: () => Promise<void>
//   setUser: (user: User | null) => void
//   setLoading: (loading: boolean) => void
//   initializeAuth: () => Promise<void>
// }

// export const useAuthStore = create<AuthStore>()(
//   devtools(
//     persist(
//       (set, get) => ({
//         // Initial state
//         user: null,
//         loading: true,
//         isAuthenticated: false,

//         // Actions
//         login: async (email: string, password: string) => {
//           try {
//             set({ loading: true })

//             const { data, error } = await auth.signIn(email, password)

//             if (error) {
//               toast.error(error.message)
//               return false
//             }

//             if (data.user) {
//               const user: User = {
//                 id: data.user.id,
//                 email: data.user.email!,
//                 full_name: data.user.user_metadata?.full_name || data.user.email!.split('@')[0],
//                 avatar_url: data.user.user_metadata?.avatar_url,
//                 created_at: data.user.created_at,
//                 updated_at: data.user.updated_at!
//               }

//               set({
//                 user,
//                 isAuthenticated: true,
//                 loading: false
//               })

//               toast.success('Welcome back!')
//               return true
//             }

//             return false
//           } catch (error) {
//             toast.error('An unexpected error occurred')
//             set({ loading: false })
//             return false
//           }
//         },

//         register: async (email: string, password: string, fullName: string) => {
//           try {
//             set({ loading: true })

//             const { data, error } = await auth.signUp(email, password, fullName)

//             if (error) {
//               toast.error(error.message)
//               return false
//             }

//             if (data.user) {
//               toast.success('Account created! Please check your email to verify your account.')
//               return true
//             }

//             return false
//           } catch (error) {
//             toast.error('An unexpected error occurred')
//             return false
//           } finally {
//             set({ loading: false })
//           }
//         },

//         logout: async () => {
//           try {
//             set({ loading: true })

//             const { error } = await auth.signOut()

//             if (error) {
//               toast.error(error.message)
//               return
//             }

//             set({
//               user: null,
//               isAuthenticated: false,
//               loading: false
//             })

//             toast.success('Logged out successfully')
//           } catch (error) {
//             toast.error('Error logging out')
//             set({ loading: false })
//           }
//         },

//         setUser: (user: User | null) => {
//           set({
//             user,
//             isAuthenticated: !!user,
//             loading: false
//           })
//         },

//         setLoading: (loading: boolean) => {
//           set({ loading })
//         },

//         initializeAuth: async () => {
//           try {
//             set({ loading: true })

//             const { data: { user }, error } = await auth.getCurrentUser()

//             if (error) {
//               console.error('Auth initialization error:', error)
//               set({ user: null, isAuthenticated: false, loading: false })
//               return
//             }

//             if (user) {
//               const userProfile: User = {
//                 id: user.id,
//                 email: user.email!,
//                 full_name: user.user_metadata?.full_name || user.email!.split('@')[0],
//                 avatar_url: user.user_metadata?.avatar_url,
//                 created_at: user.created_at,
//                 updated_at: user.updated_at!
//               }

//               set({
//                 user: userProfile,
//                 isAuthenticated: true,
//                 loading: false
//               })
//             } else {
//               set({ user: null, isAuthenticated: false, loading: false })
//             }
//           } catch (error) {
//             console.error('Auth initialization failed:', error)
//             set({ user: null, isAuthenticated: false, loading: false })
//           }
//         }
//       }),
//       {
//         name: 'auth-storage',
//         partialize: (state) => ({
//           user: state.user,
//           isAuthenticated: state.isAuthenticated
//         })
//       }
//     ),
//     {
//       name: 'auth-store'
//     }
//   )
// )

//Session storage version :
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { toast } from "sonner";
import { auth } from "@/lib/supabase";
import type { User, AuthState } from "@/types";

interface AuthStore extends AuthState {
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => Promise<void>;
}

// ✅ SECURE: Custom persist implementation using sessionStorage
const createPersist = (config: any) => (set: any, get: any, api: any) => {
  const persistedState =
    typeof window !== "undefined"
      ? (() => {
          try {
            const saved = sessionStorage.getItem("auth-storage");
            return saved ? JSON.parse(saved) : {};
          } catch {
            return {};
          }
        })()
      : {};

  const store = config(
    (...args: any[]) => {
      set(...args);
      // Save to sessionStorage on state changes
      if (typeof window !== "undefined") {
        const state = get();
        const toSave = {
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          // ❌ Don't persist loading state
        };
        sessionStorage.setItem("auth-storage", JSON.stringify(toSave));
      }
    },
    get,
    api
  );

  // Restore persisted state
  set(persistedState);

  return store;
};

export const useAuthStore = create<AuthStore>()(
  devtools(
    createPersist((set: any, _get: any) => ({
      // Initial state
      user: null,
      loading: true,
      isAuthenticated: false,

      // Actions
      login: async (email: string, password: string) => {
        try {
          set({ loading: true });

          const { data, error } = await auth.signIn(email, password);

          if (error) {
            toast.error(error.message);
            set({ loading: false });
            return false;
          }

          if (data.user) {
            const user: User = {
              id: data.user.id,
              email: data.user.email!,
              full_name:
                data.user.user_metadata?.full_name ||
                data.user.email!.split("@")[0],
              avatar_url: data.user.user_metadata?.avatar_url,
              created_at: data.user.created_at,
              updated_at: data.user.updated_at!,
            };

            set({
              user,
              isAuthenticated: true,
              loading: false,
            });

            toast.success("Welcome back!");
            return true;
          }

          return false;
        } catch (error) {
          toast.error("An unexpected error occurred");
          set({ loading: false });
          return false;
        }
      },

      register: async (email: string, password: string, fullName: string) => {
        try {
          set({ loading: true });

          const { data, error } = await auth.signUp(email, password, fullName);

          if (error) {
            toast.error(error.message);
            return false;
          }

          if (data.user) {
            toast.success(
              "Account created! Please check your email to verify your account."
            );
            return true;
          }

          return false;
        } catch (error) {
          toast.error("An unexpected error occurred");
          return false;
        } finally {
          set({ loading: false });
        }
      },

      logout: async () => {
        try {
          set({ loading: true });

          const { error } = await auth.signOut();

          if (error) {
            toast.error(error.message);
            return;
          }

          set({
            user: null,
            isAuthenticated: false,
            loading: false,
          });

          toast.success("Logged out successfully");
        } catch (error) {
          toast.error("Error logging out");
          set({ loading: false });
        }
      },

      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: !!user,
          loading: false,
        });
      },

      setLoading: (loading: boolean) => {
        set({ loading });
      },

      initializeAuth: async () => {
        try {
          set({ loading: true });

          const {
            data: { user },
            error,
          } = await auth.getCurrentUser();

          if (error) {
            console.error("Auth initialization error:", error);
            set({ user: null, isAuthenticated: false, loading: false });
            return;
          }

          if (user) {
            const userProfile: User = {
              id: user.id,
              email: user.email!,
              full_name:
                user.user_metadata?.full_name || user.email!.split("@")[0],
              avatar_url: user.user_metadata?.avatar_url,
              created_at: user.created_at,
              updated_at: user.updated_at!,
            };

            set({
              user: userProfile,
              isAuthenticated: true,
              loading: false,
            });
          } else {
            set({ user: null, isAuthenticated: false, loading: false });
          }
        } catch (error) {
          console.error("Auth initialization failed:", error);
          set({ user: null, isAuthenticated: false, loading: false });
        }
      },
    })),
    {
      name: "auth-store",
    }
  )
);
