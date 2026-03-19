import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200).trim(),
  description: z.string().max(2000).trim().optional(),
  status: z.enum(["pending", "in_progress", "completed"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  dueDate: z
    .union([z.string(), z.date()])
    .optional()
    .transform((val) => (val != null && val !== "" ? new Date(val) : undefined)),
});

export const updateTaskSchema = createTaskSchema.partial();

export const taskQuerySchema = z.object({
  status: z.enum(["pending", "in_progress", "completed"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "dueDate", "priority"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
