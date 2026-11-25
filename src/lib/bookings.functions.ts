import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { bookingListSchema, bookingStatusUpdateSchema, bookingPageSize, canManageBookings } from "./bookings";

export const listBookingRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => bookingListSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: roles, error: roleError } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId);
    if (roleError || !canManageBookings((roles ?? []).map((r) => r.role))) {
      throw new Error("บัญชีนี้ยังไม่ได้รับสิทธิ์ดูคำขอจองค่ะ");
    }
    let query = context.supabase.from("class_booking_requests")
      .select("id,parent_name,contact,child_age,preferred_day,package_interest,note,source_path,created_at,status", { count: "exact" })
      .order("created_at", { ascending: false }).order("id", { ascending: false });
    if (data.status !== "all") query = query.eq("status", data.status);
    const { data: requests, count, error } = await query.range(data.page * bookingPageSize, (data.page + 1) * bookingPageSize - 1);
    if (error) throw new Error("โหลดคำขอจองไม่สำเร็จค่ะ");
    return { requests: requests ?? [], total: count ?? 0 };
  });

export const updateBookingStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => bookingStatusUpdateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: roles, error: roleError } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId);
    if (roleError || !canManageBookings((roles ?? []).map((r) => r.role))) {
      return { ok: false as const, error: "บัญชีนี้ยังไม่ได้รับสิทธิ์เปลี่ยนสถานะคำขอจองค่ะ" };
    }
    const { data: request, error } = await context.supabase.from("class_booking_requests")
      .update({ status: data.status }).eq("id", data.id).eq("status", data.previousStatus).select("id,status").maybeSingle();
    if (error) return { ok: false as const, error: "บันทึกสถานะไม่สำเร็จค่ะ" };
    if (!request) return { ok: false as const, error: "คำขอนี้มีการเปลี่ยนแปลงแล้ว กรุณารีเฟรชรายการก่อนค่ะ" };
    return { ok: true as const, request };
  });