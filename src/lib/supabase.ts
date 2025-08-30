// import { createClient } from '@supabase/supabase-js'

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// if (!supabaseUrl || !supabaseAnonKey) {
//   throw new Error('Missing Supabase environment variables')
// }

// export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
//   auth: {
//     autoRefreshToken: true,
//     persistSession: true,
//     detectSessionInUrl: true
//   }
// })

// // Auth helper functions
// export const auth = {
//   signUp: async (email: string, password: string, fullName: string) => {
//     const { data, error } = await supabase.auth.signUp({
//       email,
//       password,
//       options: {
//         data: {
//           full_name: fullName,
//         }
//       }
//     })
//     return { data, error }
//   },

//   signIn: async (email: string, password: string) => {
//     const { data, error } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     })
//     return { data, error }
//   },

//   signOut: async () => {
//     const { error } = await supabase.auth.signOut()
//     return { error }
//   },

//   getCurrentUser: () => {
//     return supabase.auth.getUser()
//   },

//   onAuthStateChange: (callback: (event: string, session: any) => void) => {
//     return supabase.auth.onAuthStateChange(callback)
//   }
// }

//Session storage version :
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// ✅ SECURE: Custom storage using sessionStorage
const customStorage = {
  getItem: (key: string) => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // ✅ SECURE: Use sessionStorage instead of localStorage
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // ✅ SECURE: Use PKCE flow for better security
    flowType: "pkce",
  },
});

// Same auth helper functions as before
export const auth = {
  signUp: async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    return { data, error };
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    // ✅ SECURE: Clear sessionStorage on logout
    if (typeof window !== "undefined") {
      sessionStorage.clear();
    }
    return { error };
  },

  getCurrentUser: () => {
    return supabase.auth.getUser();
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// ✅ SECURE: Input sanitization helper
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, "") // Remove basic HTML chars
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .trim()
    .slice(0, 1000); // Limit length
};
