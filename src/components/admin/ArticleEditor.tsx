import { useState } from "react";
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Plus, Trash2, ExternalLink as ExternalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { listAdminArticles, saveArticle, deleteArticle } from "@/lib/articles.functions";
import { slugifyArticle, type ArticleRecord, type FaqItem } from "@/lib/articles";

const adminArticlesQuery = queryOptions({
  queryKey: ["admin-articles"],
  queryFn: () => listAdminArticles(),
});

interface DraftForm {
  id?: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  quick_answer: string;
  body: string;
  faq_items: FaqItem[];
}

const emptyForm: DraftForm = {
  title: "",
  slug: "",
  category: "คำแนะนำผู้ปกครอง",
  summary: "",
  quick_answer: "",
  body: "",
  faq_items: [{ question: "", answer: "" }],
};

export function ArticleEditor() {
  const { data: articles } = useSuspenseQuery(adminArticlesQuery);
  const queryClient = useQueryClient();
  const saveFn = useServerFn(saveArticle);
  const deleteFn = useServerFn(deleteArticle);

  const [form, setForm] = useState<DraftForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadArticle = (article: ArticleRecord) => {
    setForm({
      id: article.id,
      title: article.title,
      slug: article.slug,
      category: article.category,
      summary: article.summary,
      quick_answer: article.quick_answer,
      body: article.body,
      faq_items: article.faq_items.length > 0 ? article.faq_items : [{ question: "", answer: "" }],
    });
    setMessage(null);
    setError(null);
  };

  const handleSave = async (status: "draft" | "published") => {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const cleanFaq = form.faq_items.filter((i) => i.question.trim() && i.answer.trim());
      const res = await saveFn({
        data: {
          ...(form.id ? { id: form.id } : {}),
          title: form.title,
          slug: form.slug || slugifyArticle(form.title),
          category: form.category,
          summary: form.summary,
          quick_answer: form.quick_answer,
          body: form.body,
          faq_items: cleanFaq,
          status,
        },
      });
      if (!res.ok) {
        setError(res.error);
      } else {
        setForm((prev) => ({ ...prev, id: res.article.id, slug: res.article.slug }));
        setMessage(status === "published" ? "เผยแพร่บทความเรียบร้อยแล้วค่ะ" : "บันทึกฉบับร่างเรียบร้อยแล้วค่ะ");
        await queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
        await queryClient.invalidateQueries({ queryKey: ["published-articles"] });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "กรุณาตรวจสอบข้อมูลให้ครบถ้วนค่ะ");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    setMessage(null);
    const res = await deleteFn({ data: { id } });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    if (form.id === id) setForm(emptyForm);
    setMessage("ลบบทความเรียบร้อยแล้วค่ะ");
    await queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
    await queryClient.invalidateQueries({ queryKey: ["published-articles"] });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
      <aside className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-xl font-semibold">บทความทั้งหมด ({articles.length})</h2>
          <Button type="button" variant="outline" className="min-h-11" onClick={() => { setForm(emptyForm); setMessage(null); setError(null); }}>
            <Plus className="h-4 w-4" /> เขียนใหม่
          </Button>
        </div>
        <ul role="list" className="space-y-2">
          {articles.map((article) => (
            <li key={article.id} className={`rounded-xl border p-3 ${form.id === article.id ? "border-foreground bg-muted/40" : "border-border bg-card"}`}>
              <div className="flex items-start justify-between gap-2">
                <button type="button" onClick={() => loadArticle(article)} className="min-h-11 flex-1 text-left">
                  <p className="text-xs font-medium text-muted-foreground">
                    {article.status === "published" ? "เผยแพร่แล้ว" : "ฉบับร่าง"} · {article.category}
                  </p>
                  <p className="mt-1 font-medium leading-snug">{article.title}</p>
                </button>
                <Button type="button" variant="ghost" size="icon" aria-label={`ลบบทความ ${article.title}`} className="min-h-11 min-w-11 shrink-0" onClick={() => handleDelete(article.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              {article.status === "published" ? (
                <Link to="/articles/$slug" params={{ slug: article.slug }} className="mt-2 inline-flex items-center gap-1 text-xs underline">
                  เปิดดูหน้าจริง <ExternalIcon className="h-3 w-3" />
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      </aside>

      <section className="space-y-5 rounded-xl border border-border bg-card p-6">
        <h2 className="font-display text-xl font-semibold">{form.id ? "แก้ไขบทความ" : "สร้างบทความใหม่"}</h2>
        {message ? <p role="status" className="rounded-lg bg-muted p-3 text-sm font-medium">{message}</p> : null}
        {error ? <p role="alert" className="rounded-lg border border-destructive p-3 text-sm text-destructive">{error}</p> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="article-title">หัวข้อบทความ</Label>
            <Input id="article-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="เช่น ลูกขี้อาย ละครสร้างสรรค์ช่วยได้อย่างไร?" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="article-slug">ลิงก์บทความ (ภาษาอังกฤษตัวเล็กและขีดกลาง)</Label>
            <Input id="article-slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="creative-drama-for-shy-kids" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="article-category">หมวดหมู่</Label>
            <Input id="article-category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="ละครสร้างสรรค์" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="article-summary">คำอธิบายย่อ (แสดงบน Google และหน้ารวมบทความ)</Label>
            <Textarea id="article-summary" rows={2} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="article-quick">คำตอบสั้นสำหรับผู้ปกครอง (โครงสร้าง AEO)</Label>
            <Textarea id="article-quick" rows={3} value={form.quick_answer} onChange={(e) => setForm({ ...form, quick_answer: e.target.value })} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="article-body">เนื้อหาบทความ (ขึ้นหัวข้อย่อยด้วย ## ตามด้วยเว้นวรรค)</Label>
            <Textarea id="article-body" rows={10} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          </div>
        </div>

        <div className="space-y-3 border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">คำถามที่พบบ่อยในบทความ (FAQ Schema)</h3>
            <Button type="button" variant="outline" className="min-h-11" onClick={() => setForm({ ...form, faq_items: [...form.faq_items, { question: "", answer: "" }] })}>
              <Plus className="h-4 w-4" /> เพิ่มคำถาม
            </Button>
          </div>
          {form.faq_items.map((item, index) => (
            <div key={index} className="space-y-2 rounded-lg border border-border p-3">
              <Input value={item.question} onChange={(e) => { const next = [...form.faq_items]; next[index] = { ...item, question: e.target.value }; setForm({ ...form, faq_items: next }); }} placeholder={`คำถามข้อที่ ${index + 1}`} />
              <Textarea rows={2} value={item.answer} onChange={(e) => { const next = [...form.faq_items]; next[index] = { ...item, answer: e.target.value }; setForm({ ...form, faq_items: next }); }} placeholder="คำตอบที่ชัดเจนและกระชับค่ะ" />
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button type="button" variant="outline" className="min-h-11" disabled={saving} onClick={() => handleSave("draft")}>บันทึกฉบับร่าง</Button>
          <Button type="button" className="min-h-11" disabled={saving} onClick={() => handleSave("published")}>เผยแพร่บทความ</Button>
        </div>
      </section>
    </div>
  );
}