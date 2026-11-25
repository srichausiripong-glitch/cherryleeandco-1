import { EmailAPIError } from "@lovable.dev/email-js";
import { sendTemplateEmail } from "./email-templates/send-email";
import type { classBookingInputSchema } from "./articles";
import type { z } from "zod";

export async function notifyBookingOwner(id: string, data: z.infer<typeof classBookingInputSchema>, submittedAt: string) {
  try {
    return await sendTemplateEmail("booking-notification", "", {
      idempotencyKey: `booking-notification-${id}`,
      templateData: { ...data, submitted_at: new Date(submittedAt).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" }) },
    });
  } catch (error) {
    // The saved booking stays successful; never log parent details or tokens.
    console.warn("Booking notification unavailable", { code: error instanceof EmailAPIError ? error.code : "notification_failed" });
    return { sent: false as const, reason: "notification_unavailable" as const };
  }
}