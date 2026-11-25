import { beforeEach, describe, expect, it, vi } from "vitest";
import { template } from "@/lib/email-templates/booking-notification";
const send = vi.hoisted(() => vi.fn());
vi.mock("@/lib/email-templates/send-email", () => ({ sendTemplateEmail: send }));
import { notifyBookingOwner } from "@/lib/booking-notification.server";

const data = { parent_name: "Example parent", contact: "example-line", child_age: "8", preferred_day: "เสาร์" as const, package_interest: "รายครั้ง", note: "", source_path: "/" };
describe("booking notifications", () => {
  beforeEach(() => { send.mockReset(); });
  it("notifies only the owner's Gmail", () => expect(template.to).toBe("srichausiripong@gmail.com"));
  it("uses the saved booking ID to prevent duplicate notifications", async () => {
    send.mockResolvedValue({ sent: true });
    await notifyBookingOwner("booking-123", data, "2026-11-25T06:00:00Z");
    expect(send).toHaveBeenCalledWith("booking-notification", "", expect.objectContaining({ idempotencyKey: "booking-notification-booking-123" }));
  });
  it("does not fail a saved booking when sending is unavailable", async () => {
    send.mockRejectedValue(new Error("unavailable"));
    expect(await notifyBookingOwner("booking-123", data, "2026-11-25T06:00:00Z")).toEqual({ sent: false, reason: "notification_unavailable" });
  });
  it("does not retry a suppressed recipient", async () => {
    send.mockResolvedValue({ sent: false, reason: "recipient_suppressed" });
    expect(await notifyBookingOwner("booking-123", data, "2026-11-25T06:00:00Z")).toEqual({ sent: false, reason: "recipient_suppressed" });
    expect(send).toHaveBeenCalledTimes(1);
  });
});