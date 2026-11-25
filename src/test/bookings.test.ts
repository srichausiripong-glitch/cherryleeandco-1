import { describe, expect, it } from "vitest";
import { bookingListSchema, bookingStatusUpdateSchema, bookingStatusSchema, bookingDateBounds, canManageBookings, hasBookingFilter, isBookingDateString, sanitizeBookingSearch } from "@/lib/bookings";

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
  it("accepts the search box and date pickers but nothing else", () => {
    const parsed = bookingListSchema.parse({ page: 2, status: "new", q: "  มาลี  ", from: "2026-11-01", to: "2026-11-30" });
    expect(parsed).toEqual({ page: 2, status: "new", q: "มาลี", from: "2026-11-01", to: "2026-11-30" });
    expect(bookingListSchema.parse({})).toEqual({ page: 0, status: "all", q: "", from: "", to: "" });
    expect(bookingListSchema.safeParse({ q: "มาลี", sort: "name" }).success).toBe(false);
  });
  it("keeps a name search literal instead of a wildcard pattern", () => {
    expect(sanitizeBookingSearch("  มา*ลี%  \n  ๑๒ ")).toBe("มา ลี ๑๒");
    expect(sanitizeBookingSearch("%_*")).toBe("");
    expect(sanitizeBookingSearch("ก".repeat(90))).toHaveLength(60);
  });
  it("reads studio days in Thailand time, not server time", () => {
    expect(bookingDateBounds("2026-11-25", "2026-11-25")).toEqual({ from: "2026-11-24T17:00:00.000Z", to: "2026-11-25T16:59:59.999Z" });
    expect(bookingDateBounds("", "")).toEqual({});
    expect(isBookingDateString("2026-02-30")).toBe(false);
    expect(isBookingDateString("25/11/2026")).toBe(false);
    expect(bookingDateBounds("25/11/2026", "2026-02-30")).toEqual({});
  });
  it("knows when the list is narrowed by a filter", () => {
    expect(hasBookingFilter({ status: "all", q: "", from: "", to: "" })).toBe(false);
    expect(hasBookingFilter({ status: "all", q: "   ", from: "", to: "" })).toBe(false);
    expect(hasBookingFilter({ status: "all", q: "   ", from: "", to: "2026-02-30" })).toBe(false);
    expect(hasBookingFilter({ status: "new", q: "", from: "", to: "" })).toBe(true);
    expect(hasBookingFilter({ status: "all", q: "มาลี", from: "", to: "" })).toBe(true);
    expect(hasBookingFilter({ status: "all", q: "", from: "2026-11-01", to: "" })).toBe(true);
  });
});