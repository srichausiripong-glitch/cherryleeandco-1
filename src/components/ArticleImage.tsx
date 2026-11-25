import { useLanguage } from "@/i18n/LanguageProvider";
import { illustrationCredit, type ArticleIllustration } from "@/content/article-artwork";

export function ArticleThumbnail({ image }: { image: ArticleIllustration }) {
  const { lang } = useLanguage();
  return <img src={image.url} alt={image.alt[lang]} width={1024} height={768} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-300 motion-safe:hover:scale-[1.02]" />;
}

export function ArticleImage({ image, cover = false }: { image: ArticleIllustration; cover?: boolean }) {
  const { lang } = useLanguage();
  return (
    <figure className="my-8 overflow-hidden rounded-lg border border-peach-deep bg-paper">
      <img
        src={image.url}
        alt={image.alt[lang]}
        width={1024}
        height={768}
        loading={cover ? "eager" : "lazy"}
        decoding="async"
        className="block aspect-[4/3] w-full object-cover"
      />
      <figcaption className="space-y-1 border-t border-peach-deep px-4 py-3 text-sm leading-relaxed text-ink-soft sm:px-5">
        {image.caption ? <p>{image.caption[lang]}</p> : null}
        {image.url.startsWith("/__l5e/assets-v1/") ? <p className="text-xs">{illustrationCredit[lang]}</p> : null}
      </figcaption>
    </figure>
  );
}