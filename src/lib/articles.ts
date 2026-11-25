import { z } from "zod";
import { SITE_URL } from "@/content/business";

export const faqItemSchema = z.object({
  question: z.string().trim().min(1, "กรุณากรอกคำถามค่ะ").max(300),
  answer: z.string().trim().min(1, "กรุณากรอกคำตอบค่ะ").max(1500),
});

export type FaqItem = z.infer<typeof faqItemSchema>;

export const articleStatusSchema = z.enum(["draft", "published"]);
export type ArticleStatus = z.infer<typeof articleStatusSchema>;

export const articleInputSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(2, "กรุณากรอกลิงก์บทความ (slug) ค่ะ").max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "ใช้ตัวอักษรภาษาอังกฤษพิมพ์เล็ก ตัวเลข และขีดกลาง (-) เท่านั้นค่ะ"),
  title: z.string().trim().min(4, "กรุณากรอกหัวข้อบทความค่ะ").max(200),
  summary: z.string().trim().min(10, "กรุณากรอกคำอธิบายย่อสำหรับ SEO ค่ะ").max(320),
  quick_answer: z.string().trim().max(800).default(""),
  body: z.string().trim().min(20, "กรุณากรอกเนื้อหาบทความค่ะ").max(20000),
  cover_image_url: z.string().trim().max(500).default(""),
  cover_image_alt: z.string().trim().max(300).default(""),
  faq_items: z.array(faqItemSchema).max(12).default([]),
  category: z.string().trim().min(1, "กรุณากรอกหมวดหมู่ค่ะ").max(80),
  status: articleStatusSchema,
});

export type ArticleInput = z.infer<typeof articleInputSchema>;

export interface ArticleRecord {
  id: string;
  slug: string;
  title: string;
  summary: string;
  quick_answer: string;
  body: string;
  cover_image_url: string;
  cover_image_alt: string;
  faq_items: FaqItem[];
  category: string;
  status: ArticleStatus;
  published_at: string | null;
  updated_at: string;
  created_at: string;
}

export interface ArticleAnalyticsRow {
  slug: string;
  title: string;
  category: string;
  status: ArticleStatus;
  views: number;
  contact_line: number;
  contact_programs: number;
  total_clicks: number;
  conversion_rate: number;
}

export function parseFaqItems(raw: unknown): FaqItem[] {
  const parsed = z.array(faqItemSchema).safeParse(raw);
  return parsed.success ? parsed.data : [];
}

export function slugifyArticle(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

export interface BodyBlock {
  type: "heading" | "paragraph" | "list";
  text?: string;
  items?: string[];
}

export function parseArticleBody(body: string): BodyBlock[] {
  const chunks = body.split(/\n\s*\n/).map((c) => c.trim()).filter(Boolean);
  const blocks: BodyBlock[] = [];
  for (const chunk of chunks) {
    const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;
    const first = lines[0] ?? "";
    if (first.startsWith("## ")) {
      blocks.push({ type: "heading", text: first.slice(3).trim() });
      const rest = lines.slice(1);
      if (rest.length > 0) {
        if (rest.every((l) => /^(-|\d+\.)\s+/.test(l))) {
          blocks.push({ type: "list", items: rest.map((l) => l.replace(/^(-|\d+\.)\s+/, "").trim()) });
        } else {
          blocks.push({ type: "paragraph", text: rest.join(" ") });
        }
      }
    } else if (lines.every((l) => /^(-|\d+\.)\s+/.test(l))) {
      blocks.push({ type: "list", items: lines.map((l) => l.replace(/^(-|\d+\.)\s+/, "").trim()) });
    } else {
      blocks.push({ type: "paragraph", text: lines.join(" ") });
    }
  }
  return blocks;
}

export function buildArticleJsonLd(article: ArticleRecord) {
  const url = `${SITE_URL}/articles/${article.slug}`;
  const imageUrl = article.cover_image_url
    ? article.cover_image_url.startsWith("http")
      ? article.cover_image_url
      : `${SITE_URL}${article.cover_image_url.startsWith("/") ? "" : "/"}${article.cover_image_url}`
    : undefined;
  const schemas: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: article.summary,
      ...(imageUrl ? { image: imageUrl } : {}),
      url,
      inLanguage: "th",
      datePublished: article.published_at ?? article.created_at,
      dateModified: article.updated_at,
      author: { "@type": "Organization", name: "CherryLee & Co.", url: `${SITE_URL}/` },
      publisher: {
        "@type": "Organization",
        name: "CherryLee & Co.",
        url: `${SITE_URL}/`,
        logo: { "@type": "ImageObject", url: `${SITE_URL}/images/icon-512.png` },
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "หน้าแรก", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "บทความ", item: `${SITE_URL}/articles` },
        { "@type": "ListItem", position: 3, name: article.title, item: url },
      ],
    },
  ];
  if (article.faq_items.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: article.faq_items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    });
  }
  return schemas;
}