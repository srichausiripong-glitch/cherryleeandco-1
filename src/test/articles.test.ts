import { describe, expect, it } from "vitest";
import { articleInputSchema, buildArticleJsonLd, parseArticleBody, type ArticleRecord } from "@/lib/articles";

describe("articles schema and SEO/AEO helpers", () => {
  it("accepts valid draft and published article input", () => {
    const parsed = articleInputSchema.safeParse({
      slug: "creative-drama-for-shy-kids",
      title: "ลูกขี้อาย ละครสร้างสรรค์ช่วยได้อย่างไร?",
      summary: "ทำความเข้าใจวิธีที่กระบวนการละครสร้างสรรค์ช่วยเด็กสื่อสารอย่างมั่นใจ",
      quick_answer: "ละครสร้างสรรค์ใช้บทบาทสมมติเป็นพื้นที่ปลอดภัยให้เด็กค่อย ๆ สื่อสารค่ะ",
      body: "## หัวข้อแรก\nรายละเอียดบทความสำหรับผู้ปกครองที่ต้องการข้อมูลจริงค่ะ",
      faq_items: [{ question: "ต้องมีพื้นฐานไหมคะ?", answer: "ไม่ต้องมีพื้นฐานค่ะ" }],
      category: "ละครสร้างสรรค์",
      status: "published",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid slugs with uppercase or spaces", () => {
    const parsed = articleInputSchema.safeParse({
      slug: "Bad Slug!",
      title: "หัวข้อบทความตัวอย่าง",
      summary: "คำอธิบายย่อสำหรับบทความตัวอย่าง",
      body: "เนื้อหาบทความตัวอย่างที่ยาวพอสมควรสำหรับทดสอบค่ะ",
      category: "บทความ",
      status: "draft",
    });
    expect(parsed.success).toBe(false);
  });

  it("builds Article, BreadcrumbList, and FAQPage JSON-LD for articles with FAQs", () => {
    const sample: ArticleRecord = {
      id: "00000000-0000-0000-0000-000000000001",
      slug: "witty-english-weekends-overview",
      title: "Witty English Weekends เรียนอะไรบ้าง?",
      summary: "ภาพรวมคลาสวันเสาร์-อาทิตย์ที่ CherryLee & Co.",
      quick_answer: "เรียนภาษาอังกฤษผ่านละครและการทำอาหารค่ะ",
      body: "## ภาพรวม\nเรียนวันเสาร์-อาทิตย์ 09:00–15:00 น.",
      faq_items: [{ question: "เปิดวันไหนคะ?", answer: "วันเสาร์และอาทิตย์ค่ะ" }],
      category: "โปรแกรมเรียน",
      status: "published",
      published_at: "2026-11-25T00:00:00.000Z",
      updated_at: "2026-11-25T00:00:00.000Z",
      created_at: "2026-11-25T00:00:00.000Z",
    };
    const schemas = buildArticleJsonLd(sample);
    expect(schemas.map((s) => s["@type"])).toEqual(["Article", "BreadcrumbList", "FAQPage"]);
  });

  it("parses headings, lists, and paragraphs from article body", () => {
    const blocks = parseArticleBody("## หัวข้อ\nย่อหน้าแรก\n\n- ข้อหนึ่ง\n- ข้อสอง");
    expect(blocks).toEqual([
      { type: "heading", text: "หัวข้อ" },
      { type: "paragraph", text: "ย่อหน้าแรก" },
      { type: "list", items: ["ข้อหนึ่ง", "ข้อสอง"] },
    ]);
  });
});