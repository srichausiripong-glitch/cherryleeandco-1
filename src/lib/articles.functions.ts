import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { canGenerateClass } from "./class-descriptions";
import { articleInputSchema, parseFaqItems, type ArticleRecord } from "./articles";
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
    .select("id,slug,title,summary,quick_answer,body,faq_items,category,status,published_at,updated_at,created_at,author_id")
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
      .select("id,slug,title,summary,quick_answer,body,faq_items,category,status,published_at,updated_at,created_at,author_id")
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
      .select("id,slug,title,summary,quick_answer,body,faq_items,category,status,published_at,updated_at,created_at,author_id")
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