import { describe, expect, it } from "vitest";
import { bookingStatusUpdateSchema, bookingStatusSchema, canManageBookings } from "@/lib/bookings";

describe("booking request management", () => {
  it("permits teachers, admins and super admins but not ordinary accounts", () => {
    for (const role of ["teacher", "admin", "super_admin"]) expect(canManageBookings([role])).toBe(true);
    expect(canManageBookings([])).toBe(false);
    expect(canManageBookings(["parent"])).toBe(false);
  });
  it("supports new, contacted, confirmed and closed statuses only", () => {
    for (const status of ["new", "contacted", "confirmed", "closed"]) expect(bookingStatusSchema.parse(status)).toBe(status);
    expect(bookingStatusSchema.safeParse("paid").success).toBe(false);
  });
  it("allows changing status without changing the parent details", () => {
    const input = { id: "00000000-0000-0000-0000-000000000001", status: "contacted", previousStatus: "new" };
    expect(bookingStatusUpdateSchema.safeParse(input).success).toBe(true);
    expect(bookingStatusUpdateSchema.safeParse({ ...input, contact: "changed" }).success).toBe(false);
  });
});