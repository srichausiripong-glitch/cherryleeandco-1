import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export const bookingStatuses = ["new", "contacted", "confirmed", "closed"] as const;
export const bookingStatusSchema = z.enum(bookingStatuses);
export type BookingStatus = z.infer<typeof bookingStatusSchema>;
export type BookingRequest = Database["public"]["Tables"]["class_booking_requests"]["Row"];
export const bookingPageSize = 25;
export const bookingListSchema = z.object({
  page: z.number().int().min(0).max(100000).default(0),
  status: z.union([bookingStatusSchema, z.literal("all")]).default("all"),
}).strict();
export const bookingStatusUpdateSchema = z.object({
  id: z.string().uuid(),
  status: bookingStatusSchema,
  previousStatus: bookingStatusSchema,
}).strict();
export function canManageBookings(roles: readonly string[]) {
  return roles.some((role) => ["teacher", "admin", "super_admin"].includes(role));
}