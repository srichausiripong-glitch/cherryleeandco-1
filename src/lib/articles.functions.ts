import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { canGenerateClass } from "./class-descriptions";
import {
  articleInputSchema,
  classBookingInputSchema,
  parseFaqItems,
  type ArticleAnalyticsSummary,
  type ArticleRecord,
} from "./articles";
import { z } from "zod";

function createPublicSupabase() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("ไม่สามารถโหลดบทความได้ค่ะ");
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

function mapArticleRow(row: Database["public"]["Tables"]["articles"]["Row"]): ArticleRecord {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    quick_answer: row.quick_answer,
    body: row.body,
    cover_image_url: row.cover_image_url,
    cover_image_alt: row.cover_image_alt,
    faq_items: parseFaqItems(row.faq_items),
    category: row.category,
    status: row.status === "published" ? "published" : "draft",
    published_at: row.published_at,
    updated_at: row.updated_at,
    created_at: row.created_at,
  };
}

export const listPublishedArticles = createServerFn({ method: "GET" }).handler(async () => {
  const client = createPublicSupabase();
  const { data, error } = await client
    .from("articles")
    .select("id,slug,title,summary,quick_answer,body,cover_image_url,cover_image_alt,faq_items,category,status,published_at,updated_at,created_at,author_id")
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false });
  if (error) throw new Error("โหลดคลังบทความไม่สำเร็จค่ะ");
  return (data ?? []).map(mapArticleRow);
});

export const getPublishedArticleBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const client = createPublicSupabase();
    const { data: row, error } = await client
      .from("articles")
      .select("id,slug,title,summary,quick_answer,body,cover_image_url,cover_image_alt,faq_items,category,status,published_at,updated_at,created_at,author_id")
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw new Error("โหลดบทความไม่สำเร็จค่ะ");
    return row ? mapArticleRow(row) : null;
  });

export const listAdminArticles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: roles, error: roleError } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (roleError || !canGenerateClass((roles ?? []).map((r) => r.role))) {
      throw new Error("บัญชีนี้ยังไม่ได้รับสิทธิ์จัดการบทความค่ะ");
    }
    const { data, error } = await context.supabase
      .from("articles")
      .select("id,slug,title,summary,quick_answer,body,cover_image_url,cover_image_alt,faq_items,category,status,published_at,updated_at,created_at,author_id")
      .order("updated_at", { ascending: false });
    if (error) throw new Error("โหลดรายการบทความไม่สำเร็จค่ะ");
    return (data ?? []).map(mapArticleRow);
  });

export const saveArticle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => articleInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: roles, error: roleError } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (roleError || !canGenerateClass((roles ?? []).map((r) => r.role))) {
      return { ok: false as const, error: "บัญชีนี้ยังไม่ได้รับสิทธิ์จัดการบทความค่ะ" };
    }
    const now = new Date().toISOString();
    const payload = {
      slug: data.slug,
      title: data.title,
      summary: data.summary,
      quick_answer: data.quick_answer,
      body: data.body,
      cover_image_url: data.cover_image_url,
      cover_image_alt: data.cover_image_alt,
      faq_items: data.faq_items,
      category: data.category,
      status: data.status,
      updated_at: now,
      author_id: context.userId,
      ...(data.status === "published" ? { published_at: now } : {}),
    };
    const result = data.id
      ? await context.supabase.from("articles").update(payload).eq("id", data.id).select().single()
      : await context.supabase.from("articles").insert(payload).select().single();
    if (result.error || !result.data) {
      const dup = result.error?.code === "23505";
      return { ok: false as const, error: dup ? "ลิงก์บทความ (slug) นี้มีอยู่แล้ว กรุณาเปลี่ยนชื่อค่ะ" : "บันทึกบทความไม่สำเร็จค่ะ" };
    }
    return { ok: true as const, article: mapArticleRow(result.data) };
  });

export const deleteArticle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: roles, error: roleError } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (roleError || !canGenerateClass((roles ?? []).map((r) => r.role))) {
      return { ok: false as const, error: "บัญชีนี้ยังไม่ได้รับสิทธิ์ลบบทความค่ะ" };
    }
    const { error } = await context.supabase.from("articles").delete().eq("id", data.id);
    if (error) return { ok: false as const, error: "ลบบทความไม่สำเร็จค่ะ" };
    return { ok: true as const };
  });

const articleEventInputSchema = z.object({
  slug: z.string().trim().min(2).max(120),
  event_type: z.enum(["view", "contact_line", "contact_programs"]),
});

export const recordArticleEvent = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => articleEventInputSchema.parse(input))
  .handler(async ({ data }) => {
    const client = createPublicSupabase();
    await client.from("article_events").insert({ slug: data.slug, event_type: data.event_type });
    return { ok: true as const };
  });

export const submitClassBookingRequest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => classBookingInputSchema.parse(input))
  .handler(async ({ data }) => {
    const client = createPublicSupabase();
    const { error } = await client.from("class_booking_requests").insert({
      parent_name: data.parent_name,
      contact: data.contact,
      child_age: data.child_age,
      preferred_day: data.preferred_day,
      package_interest: data.package_interest,
      note: data.note,
      source_path: data.source_path,
    });
    if (error) return { ok: false as const, error: "ส่งคำขอจองคลาสไม่สำเร็จ กรุณาลองใหม่อีกครั้งค่ะ" };
    return { ok: true as const };
  });

const analyticsRangeSchema = z
  .object({
    from: z.string().trim().optional(),
    to: z.string().trim().optional(),
  })
  .optional();

export const getArticleAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => analyticsRangeSchema.parse(input))
  .handler(async ({ data, context }): Promise<ArticleAnalyticsSummary> => {
    const { data: roles, error: roleError } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (roleError || !canGenerateClass((roles ?? []).map((r) => r.role))) {
      throw new Error("บัญชีนี้ยังไม่ได้รับสิทธิ์ดูสถิติบทความค่ะ");
    }

    let eventsQuery = context.supabase.from("article_events").select("slug,event_type,created_at");
    let bookingsQuery = context.supabase.from("class_booking_requests").select("created_at");
    if (data?.from) {
      const fromIso = `${data.from}T00:00:00.000Z`;
      eventsQuery = eventsQuery.gte("created_at", fromIso);
      bookingsQuery = bookingsQuery.gte("created_at", fromIso);
    }
    if (data?.to) {
      const toIso = `${data.to}T23:59:59.999Z`;
      eventsQuery = eventsQuery.lte("created_at", toIso);
      bookingsQuery = bookingsQuery.lte("created_at", toIso);
    }

    const [
      { data: articles, error: articlesError },
      { data: events, error: eventsError },
      { data: bookings, error: bookingsError },
    ] = await Promise.all([
      context.supabase.from("articles").select("slug,title,category,status").order("created_at", { ascending: true }),
      eventsQuery,
      bookingsQuery,
    ]);
    if (articlesError || eventsError || bookingsError) throw new Error("โหลดข้อมูลสถิติบทความไม่สำเร็จค่ะ");

    const counts = new Map<string, { views: number; contact_line: number; contact_programs: number }>();
    for (const ev of events ?? []) {
      const cur = counts.get(ev.slug) ?? { views: 0, contact_line: 0, contact_programs: 0 };
      if (ev.event_type === "view") cur.views += 1;
      else if (ev.event_type === "contact_line") cur.contact_line += 1;
      else if (ev.event_type === "contact_programs") cur.contact_programs += 1;
      counts.set(ev.slug, cur);
    }

    const rows = (articles ?? [])
      .map((a) => {
        const c = counts.get(a.slug) ?? { views: 0, contact_line: 0, contact_programs: 0 };
        const total_clicks = c.contact_line + c.contact_programs;
        const conversion_rate = c.views > 0 ? Math.round((total_clicks / c.views) * 1000) / 10 : 0;
        return {
          slug: a.slug,
          title: a.title,
          category: a.category,
          status: (a.status === "published" ? "published" : "draft") as ArticleRecord["status"],
          views: c.views,
          contact_line: c.contact_line,
          contact_programs: c.contact_programs,
          total_clicks,
          conversion_rate,
        };
      })
      .sort((a, b) => b.total_clicks - a.total_clicks || b.views - a.views);

    const monthMap = new Map<string, number>();
    for (const b of bookings ?? []) {
      const month = b.created_at.slice(0, 7);
      monthMap.set(month, (monthMap.get(month) ?? 0) + 1);
    }
    const monthlyBookings = Array.from(monthMap.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => b.month.localeCompare(a.month));
    const currentMonth = new Date().toISOString().slice(0, 7);

    return {
      rows,
      totalBookings: (bookings ?? []).length,
      currentMonthBookings: monthMap.get(currentMonth) ?? 0,
      monthlyBookings,
    };
  });