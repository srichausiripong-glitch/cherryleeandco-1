import { useEffect, useRef } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { listPublishedArticles, recordArticleEvent } from "@/lib/articles.functions";
import { buildArticleJsonLd, parseArticleBody } from "@/lib/articles";
import { SITE_URL, LINE_URL } from "@/content/business";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ExternalLink } from "@/components/ExternalLink";
import { LineIcon } from "@/components/icons";
import { LanguageProvider } from "@/i18n/LanguageProvider";

const articlesQuery = queryOptions({
  queryKey: ["published-articles"],
  queryFn: () => listPublishedArticles(),
});

export const Route = createFileRoute("/articles/$slug")({
  staticData: { sitemap: true },
  loader: async ({ params, context }) => {
    const articles = await context.queryClient.ensureQueryData(articlesQuery);
    const article = articles.find((a) => a.slug === params.slug) ?? null;
    if (!article) throw notFound();
    return article;
  },
  head: ({ params, loaderData }) => {
    const title = loaderData ? `${loaderData.title} | CherryLee & Co.` : "บทความ | CherryLee & Co.";
    const description = loaderData?.summary ?? "บทความสำหรับผู้ปกครองจาก CherryLee & Co.";
    const url = `${SITE_URL}/articles/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: loaderData
        ? buildArticleJsonLd(loaderData).map((schema) => ({
            type: "application/ld+json",
            children: JSON.stringify(schema),
          }))
        : [],
    };
  },
  component: ArticleDetailPage,
});

function ArticleDetailPage() {
  const { slug } = Route.useParams();
  const { data: articles } = useSuspenseQuery(articlesQuery);
  const trackEventFn = useServerFn(recordArticleEvent);
  const trackedSlugRef = useRef<string | null>(null);
  const article = articles.find((a) => a.slug === slug) ?? null;

  useEffect(() => {
    if (!article || trackedSlugRef.current === article.slug) return;
    trackedSlugRef.current = article.slug;
    void trackEventFn({ data: { slug: article.slug, event_type: "view" } }).catch(() => {});
  }, [article, trackEventFn]);

  if (!article) return null;
  const blocks = parseArticleBody(article.body);
  const otherArticles = articles.filter((a) => a.slug !== article.slug);
  const relatedArticles = [
    ...otherArticles.filter((a) => a.category === article.category),
    ...otherArticles.filter((a) => a.category !== article.category),
  ].slice(0, 3);

  return (
    <LanguageProvider>
    <div className="min-h-screen bg-cream text-ink">
      <Header />
      <main id="main" className="container-site py-12 sm:py-16">
        <article className="mx-auto max-w-3xl">
          <nav aria-label="เส้นทางหน้า" className="mb-6 text-sm text-ink-soft">
            <Link to="/" className="underline-offset-4 hover:underline">หน้าแรก</Link>
            <span aria-hidden="true" className="mx-2">/</span>
            <Link to="/articles" className="underline-offset-4 hover:underline">บทความ</Link>
            <span aria-hidden="true" className="mx-2">/</span>
            <span>{article.category}</span>
          </nav>

          <p className="text-sm font-semibold text-cherry">{article.category}</p>
          <h1 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-5xl">{article.title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">{article.summary}</p>

          {article.cover_image_url ? (
            <figure className="mt-8 overflow-hidden rounded-2xl border-2 border-peach-deep bg-paper">
              <img
                src={article.cover_image_url}
                alt={article.cover_image_alt || article.title}
                className="aspect-[16/10] w-full object-cover"
              />
              {article.cover_image_alt ? (
                <figcaption className="px-4 py-3 text-sm text-ink-soft">{article.cover_image_alt}</figcaption>
              ) : null}
            </figure>
          ) : null}

          {article.quick_answer ? (
            <section aria-labelledby="quick-answer-heading" className="mt-8 rounded-2xl border-2 border-peach-deep bg-paper p-6">
              <h2 id="quick-answer-heading" className="font-display text-xl font-bold">คำตอบสั้นสำหรับผู้ปกครอง</h2>
              <p className="mt-2 text-base leading-relaxed">{article.quick_answer}</p>
            </section>
          ) : null}

          <div className="mt-10 space-y-6 text-lg leading-relaxed">
            {blocks.map((block, idx) => {
              if (block.type === "heading") {
                return <h2 key={idx} className="pt-4 font-display text-2xl font-bold">{block.text}</h2>;
              }
              if (block.type === "list") {
                return (
                  <ul key={idx} role="list" className="list-disc space-y-2 pl-6">
                    {(block.items ?? []).map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                );
              }
              return <p key={idx}>{block.text}</p>;
            })}
          </div>

          {article.faq_items.length > 0 ? (
            <section aria-labelledby="article-faq-heading" className="mt-12 border-t-2 border-peach-deep pt-10">
              <h2 id="article-faq-heading" className="font-display text-2xl font-bold">คำถามที่พบบ่อย</h2>
              <dl className="mt-6 space-y-6">
                {article.faq_items.map((item, idx) => (
                  <div key={idx} className="rounded-2xl border-2 border-peach-deep bg-paper p-5">
                    <dt className="font-display text-lg font-bold">{item.question}</dt>
                    <dd className="mt-2 text-base leading-relaxed text-ink-soft">{item.answer}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          <section className="mt-12 rounded-2xl border-2 border-peach-deep bg-paper p-6 sm:p-8">
            <h2 className="font-display text-2xl font-bold">อยากสอบถามเพิ่มเติมเกี่ยวกับคลาสของลูก?</h2>
            <p className="mt-2 text-base text-ink-soft">
              ทักคุยกับครูเชอร์รี่และทีม CherryLee &amp; Co. ได้ทาง LINE @cherryleeandco ยินดีให้คำปรึกษาค่ะ
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <ExternalLink
                href={LINE_URL}
                className="btn btn-primary btn-sm"
                onClick={() => {
                  window.__lovableEvents?.track?.("project.article_contact_click", {
                    slug: article.slug,
                    category: article.category,
                    channel: "line",
                  });
                  void trackEventFn({ data: { slug: article.slug, event_type: "contact_line" } }).catch(() => {});
                }}
              >
                <LineIcon /> ทัก LINE @cherryleeandco
              </ExternalLink>
              <Link
                to="/"
                hash="programs"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  window.__lovableEvents?.track?.("project.article_contact_click", {
                    slug: article.slug,
                    category: article.category,
                    channel: "programs",
                  });
                  void trackEventFn({ data: { slug: article.slug, event_type: "contact_programs" } }).catch(() => {});
                }}
              >
                ดูตารางเรียนและสมัครคลาส
              </Link>
              <Link to="/articles" className="inline-flex min-h-11 items-center gap-2 font-semibold text-ink underline-offset-4 hover:underline">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> กลับไปหน้ารวมบทความ
              </Link>
            </div>
          </section>

          {relatedArticles.length > 0 ? (
            <section aria-labelledby="related-articles-heading" className="mt-12 border-t-2 border-peach-deep pt-10">
              <h2 id="related-articles-heading" className="font-display text-2xl font-bold">บทความที่เกี่ยวข้อง</h2>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {relatedArticles.map((related) => (
                  <Link
                    key={related.slug}
                    to="/articles/$slug"
                    params={{ slug: related.slug }}
                    className="flex flex-col rounded-2xl border-2 border-peach-deep bg-paper p-5 transition-colors hover:border-cherry"
                    onClick={() =>
                      window.__lovableEvents?.track?.("project.related_article_click", {
                        from_slug: article.slug,
                        to_slug: related.slug,
                        category: related.category,
                      })
                    }
                  >
                    <span className="text-xs font-semibold text-cherry">{related.category}</span>
                    <h3 className="mt-2 font-display text-lg font-bold leading-snug">{related.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-soft">{related.summary}</p>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </article>
      </main>
      <Footer />
    </div>
    </LanguageProvider>
  );
}