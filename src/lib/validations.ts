import { z } from "zod";

// Schémas de validation d'authentification
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Veuillez entrer une adresse email valide"),
  password: z
    .string()
    .min(1, "Le mot de passe est requis")
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Le nom complet est requis")
      .min(2, "Le nom doit contenir au moins 2 caractères")
      .max(50, "Le nom doit contenir moins de 50 caractères"),
    email: z
      .string()
      .min(1, "L'email est requis")
      .email("Veuillez entrer une adresse email valide"),
    password: z
      .string()
      .min(1, "Le mot de passe est requis")
      .min(6, "Le mot de passe doit contenir au moins 6 caractères")
      .max(100, "Le mot de passe doit contenir moins de 100 caractères"),
    confirmPassword: z.string().min(1, "Veuillez confirmer votre mot de passe"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

// Schémas de validation de projet
export const projectSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom du projet est requis")
    .min(2, "Le nom du projet doit contenir au moins 2 caractères")
    .max(100, "Le nom du projet doit contenir moins de 100 caractères"),
  description: z
    .string()
    .max(500, "La description doit contenir moins de 500 caractères")
    .optional()
    .or(z.literal("")),
  status: z.enum(["active", "completed", "archived"]).optional(),
});

// Schémas de validation de tâche
export const taskSchema = z.object({
  title: z
    .string()
    .min(1, "Le titre de la tâche est requis")
    .min(2, "Le titre de la tâche doit contenir au moins 2 caractères")
    .max(200, "Le titre de la tâche doit contenir moins de 200 caractères"),
  description: z
    .string()
    .max(1000, "La description doit contenir moins de 1000 caractères")
    .optional()
    .or(z.literal("")),
  status: z.enum(["todo", "in_progress", "done"]).default("todo"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  project_id: z.string().min(1, "Le projet est requis"),
  assignee_id: z.string().optional().or(z.literal("")),
  due_date: z.string().optional().or(z.literal("")),
});

// Schémas de recherche et de filtrage
export const taskFiltersSchema = z.object({
  status: z.array(z.enum(["todo", "in_progress", "done"])).optional(),
  priority: z.array(z.enum(["low", "medium", "high"])).optional(),
  project_id: z.string().optional(),
  assignee_id: z.string().optional(),
  search: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
});

export const projectFiltersSchema = z.object({
  status: z.array(z.enum(["active", "completed", "archived"])).optional(),
  search: z.string().optional(),
  owner_id: z.string().optional(),
  created_from: z.string().optional(),
  created_to: z.string().optional(),
});

// Exporter les types des schémas
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProjectFormData = z.infer<typeof projectSchema>;
export type TaskFormData = z.infer<typeof taskSchema>;
export type TaskFiltersData = z.infer<typeof taskFiltersSchema>;
export type ProjectFiltersData = z.infer<typeof projectFiltersSchema>;

// Utilitaires de validation communs
export const emailValidation = z
  .string()
  .email("Veuillez entrer une adresse email valide");

export const passwordValidation = z
  .string()
  .min(6, "Le mot de passe doit contenir au moins 6 caractères")
  .max(100, "Le mot de passe doit contenir moins de 100 caractères")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule et un chiffre"
  );

// Utilitaires de validation de date
export const dateValidation = z.string().refine((date) => {
  if (!date) return true; // Les dates optionnelles sont autorisées
  return !isNaN(Date.parse(date));
}, "Format de date invalide");

export const futureDateValidation = z.string().refine((date) => {
  if (!date) return true; // Les dates optionnelles sont autorisées
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Réinitialiser l'heure au début de la journée
  return inputDate >= today;
}, "La date doit être aujourd'hui ou dans le futur");
