import { z } from "zod";
import { GOVERNORATES, CURRENCIES } from "@/lib/constants";

export const createJobSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  categoryId: z.string().min(1, "Category is required"),
  description: z.string().min(20, "Description must be at least 20 characters").max(5000),
  governorate: z.enum(GOVERNORATES, { required_error: "Governorate is required" }),
  address: z.string().optional(),
  budgetMin: z.number().positive().optional(),
  budgetMax: z.number().positive().optional(),
  currency: z.enum(CURRENCIES).default("SYP"),
  deadline: z.string().optional(),
  images: z.array(z.string().url()).max(5).default([]),
}).refine(
  (data) => {
    if (data.budgetMin && data.budgetMax) {
      return data.budgetMin <= data.budgetMax;
    }
    return true;
  },
  { message: "Minimum budget cannot exceed maximum budget", path: ["budgetMin"] }
);

// updateJobSchema: partial version without the refine constraint
export const updateJobSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  categoryId: z.string().min(1).optional(),
  description: z.string().min(20).max(5000).optional(),
  governorate: z.enum(GOVERNORATES).optional(),
  address: z.string().optional(),
  budgetMin: z.number().positive().optional(),
  budgetMax: z.number().positive().optional(),
  currency: z.enum(CURRENCIES).optional(),
  deadline: z.string().optional(),
});

export const filterJobsSchema = z.object({
  categoryId: z.string().optional(),
  governorate: z.string().optional(),
  currency: z.enum(CURRENCIES).optional(),
  status: z.enum(["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  search: z.string().optional(),
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(50).default(12),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type FilterJobsInput = z.infer<typeof filterJobsSchema>;
