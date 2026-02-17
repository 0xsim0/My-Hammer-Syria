import { z } from "zod";
import { GOVERNORATES } from "@/lib/constants";

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    role: z.enum(["CUSTOMER", "CRAFTSMAN"]),
    phone: z.string().optional(),
    governorate: z.enum(GOVERNORATES).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  nameAr: z.string().max(100).optional(),
  phone: z.string().optional(),
  governorate: z.enum(GOVERNORATES).optional(),
  image: z.string().url().optional(),
});

export const updateCraftsmanProfileSchema = z.object({
  businessName: z.string().max(200).optional(),
  businessNameAr: z.string().max(200).optional(),
  bio: z.string().max(2000).optional(),
  bioAr: z.string().max(2000).optional(),
  yearsExperience: z.number().int().min(0).max(50).optional(),
  isAvailable: z.boolean().optional(),
  categoryIds: z.array(z.string()).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
