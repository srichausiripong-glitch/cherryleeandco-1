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
  q: z.string().trim().max(80).default(""),
  from: z.string().trim().max(10).default(""),
  to: z.string().trim().max(10).default(""),
}).strict();
export type BookingFilters = { status: BookingStatus | "all"; q: string; from: string; to: string };

// Thailand keeps a constant UTC+7 offset, so a studio day has fixed boundaries.
const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;
const BOOKING_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isBookingDateString(value: string) {
  if (!BOOKING_DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (year === undefined || month === undefined || day === undefined) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  // JavaScript rolls impossible days over, so the calendar date has to read back identical.
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

/** Turns the two YYYY-MM-DD inputs into instant boundaries for the studio's day. */
export function bookingDateBounds(from: string, to: string): { from?: string; to?: string } {
  const bounds: { from?: string; to?: string } = {};
  if (isBookingDateString(from)) bounds.from = new Date(Date.parse(`${from}T00:00:00Z`) - BANGKOK_OFFSET_MS).toISOString();
  if (isBookingDateString(to)) bounds.to = new Date(Date.parse(`${to}T23:59:59.999Z`) - BANGKOK_OFFSET_MS).toISOString();
  return bounds;
}

/** Keeps a name search literal: wildcards and separators have no meaning in a name. */
export function sanitizeBookingSearch(value: string) {
  return value.replace(/[%_*]/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);
}

export function hasBookingFilter(filters: BookingFilters) {
  return filters.status !== "all" || sanitizeBookingSearch(filters.q) !== "" || isBookingDateString(filters.from) || isBookingDateString(filters.to);
}
export const bookingStatusUpdateSchema = z.object({
  id: z.string().uuid(),
  status: bookingStatusSchema,
  previousStatus: bookingStatusSchema,
}).strict();
export function canManageBookings(roles: readonly string[]) {
  return roles.some((role) => ["teacher", "admin", "super_admin"].includes(role));
}