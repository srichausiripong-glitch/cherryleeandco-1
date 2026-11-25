import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { listPublishedArticles } from "@/lib/articles.functions";
import { SITE_URL } from "@/content/business";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LanguageProvider } from "@/i18n/LanguageProvider";

const articlesQuery = queryOptions({
  queryKey: ["published-articles"],
  queryFn: () => listPublishedArticles(),
});

export const Route = createFileRoute("/articles/")({
  staticData: { sitemap: true },
  loader: ({ context }) => context.queryClient.ensureQueryData(articlesQuery),
  head: () => ({
    meta: [
      { title: "บทความสำหรับผู้ปกครอง | CherryLee & Co." },
      { name: "description", content: "รวมบทความและคำถามที่พบบ่อยเกี่ยวกับละครสร้างสรรค์ ภาษาอังกฤษในชีวิตจริง บอร์ดเกมการเงิน และทักษะชีวิตสำหรับเด็กโดย CherryLee & Co." },
      { property: "og:title", content: "บทความสำหรับผู้ปกครอง | CherryLee & Co." },
      { property: "og:description", content: "แนวทางการเรียนรู้ทักษะชีวิต ละครสร้างสรรค์ และคลาสวันเสาร์-อาทิตย์สำหรับเด็กและครอบครัว" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/articles` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/articles` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "หน้าแรก", item: `${SITE_URL}/` },
            { "@type": "ListItem", position: 2, name: "บทความ", item: `${SITE_URL}/articles` },
          ],
        }),
      },
    ],
  }),
  component: ArticlesIndexPage,
});

function ArticlesIndexPage() {
  const { data: articles } = useSuspenseQuery(articlesQuery);
  return (
    <LanguageProvider>
    <div className="min-h-screen bg-cream text-ink">
      <Header />
      <main id="main" className="container-site py-12 sm:py-16">
        <nav aria-label="เส้นทางหน้า" className="mb-6 text-sm text-ink-soft">
          <Link to="/" className="underline-offset-4 hover:underline">หน้าแรก</Link>
          <span aria-hidden="true" className="mx-2">/</span>
          <span>บทความ</span>
        </nav>
        <p className="mb-2 text-sm font-semibold text-cherry">คลังความรู้ CherryLee &amp; Co.</p>
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">บทความสำหรับผู้ปกครอง</h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-soft">
          รวมคำตอบและแนวคิดจากห้องเรียนจริงของครูเชอร์รี่และอังเคิลลี เรื่องละครสร้างสรรค์ ภาษาอังกฤษในชีวิตจริง บอร์ดเกมการเงิน และทักษะชีวิตสำหรับเด็กค่ะ
        </p>
        {articles.length === 0 ? (
          <p className="mt-10 text-ink-soft">ยังไม่มีบทความที่เผยแพร่ในขณะนี้ค่ะ</p>
        ) : (
          <ul role="list" className="mt-10 grid gap-6 md:grid-cols-2">
            {articles.map((article) => (
              <li key={article.id} className="flex flex-col justify-between rounded-2xl border-2 border-peach-deep bg-paper p-6">
                <div>
                  <p className="text-sm font-semibold text-cherry">{article.category}</p>
                  <h2 className="mt-2 font-display text-2xl font-bold leading-snug">
                    <Link to="/articles/$slug" params={{ slug: article.slug }} className="no-underline hover:underline">
                      {article.title}
                    </Link>
                  </h2>
                  <p className="mt-3 text-base leading-relaxed text-ink-soft">{article.summary}</p>
                </div>
                <div className="mt-6">
                  <Link to="/articles/$slug" params={{ slug: article.slug }} className="inline-flex min-h-11 items-center gap-2 font-semibold text-ink underline-offset-4 hover:underline">
                    อ่านบทความ <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </div>
    </LanguageProvider>
  );
}