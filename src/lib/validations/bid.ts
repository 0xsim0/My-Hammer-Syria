import { z } from "zod";
import { CURRENCIES } from "@/lib/constants";

export const createBidSchema = z.object({
  price: z.number().positive("Price must be positive"),
  currency: z.enum(CURRENCIES).default("SYP"),
  estimatedDays: z.number().int().positive("Estimated days must be positive").max(365),
  message: z.string().min(20, "Message must be at least 20 characters").max(2000),
});

export const updateBidStatusSchema = z.object({
  status: z.enum(["ACCEPTED", "REJECTED", "WITHDRAWN"]),
});

export type CreateBidInput = z.infer<typeof createBidSchema>;
export type UpdateBidStatusInput = z.infer<typeof updateBidStatusSchema>;
