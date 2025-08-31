import { z } from "zod";

// Auth validation schemas
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Full name is required")
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be less than 50 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password must be less than 100 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Project validation schemas
export const projectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .min(2, "Project name must be at least 2 characters")
    .max(100, "Project name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  status: z.enum(["active", "completed", "archived"]).optional(),
});

// Task validation schemas
export const taskSchema = z.object({
  title: z
    .string()
    .min(1, "Task title is required")
    .min(2, "Task title must be at least 2 characters")
    .max(200, "Task title must be less than 200 characters"),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .or(z.literal("")),
  status: z.enum(["todo", "in_progress", "done"]).default("todo"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  project_id: z.string().min(1, "Project is required"),
  assignee_id: z.string().optional().or(z.literal("")),
  due_date: z.string().optional().or(z.literal("")),
});

// Search and filter schemas
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

// Export types from schemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProjectFormData = z.infer<typeof projectSchema>;
export type TaskFormData = z.infer<typeof taskSchema>;
export type TaskFiltersData = z.infer<typeof taskFiltersSchema>;
export type ProjectFiltersData = z.infer<typeof projectFiltersSchema>;

// Common validation helpers
export const emailValidation = z
  .string()
  .email("Please enter a valid email address");

export const passwordValidation = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(100, "Password must be less than 100 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  );

// Date validation helpers
export const dateValidation = z.string().refine((date) => {
  if (!date) return true; // Optional dates are allowed
  return !isNaN(Date.parse(date));
}, "Invalid date format");

export const futureDateValidation = z.string().refine((date) => {
  if (!date) return true; // Optional dates are allowed
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day
  return inputDate >= today;
}, "Date must be today or in the future");
