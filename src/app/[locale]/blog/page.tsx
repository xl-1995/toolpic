import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { locales } from '@/i18n/config';
import { blogPosts } from '@/data/blog';

const baseUrl = 'https://toolpic.me';

type Props = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });

  const url = `${baseUrl}/${locale}/blog`;

  const languages: Record<string, string> = {};
  for (const loc of locales) {
    languages[loc] = `${baseUrl}/${loc}/blog`;
  }
  languages['x-default'] = `${baseUrl}/en/blog`;

  return {
    title: `${t('title')} | ToolPic`,
    description: t('subtitle'),
    alternates: {
      canonical: url,
      languages,
    },
    openGraph: {
      title: `${t('title')} | ToolPic`,
      description: t('subtitle'),
      url,
      siteName: 'ToolPic',
      type: 'website',
      locale,
      images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
    },
  };
}

export default async function BlogListPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'blog' });

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ToolPic', item: `${baseUrl}/${locale}` },
      { '@type': 'ListItem', position: 2, name: t('title'), item: `${baseUrl}/${locale}/blog` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="background-grid" />

      <section className="relative text-center pt-24 pb-12 sm:pt-32 sm:pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight mb-4 gradient-text">
            {t('title')}
          </h1>
          <p className="text-lg sm:text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>
      </section>

      <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="flex flex-col gap-6">
          {blogPosts.map((post) => {
            let postTitle: string;
            let postExcerpt: string;
            try {
              postTitle = t(`posts.${post.slug}.title`);
              postExcerpt = t(`posts.${post.slug}.excerpt`);
            } catch {
              return null;
            }

            const formattedDate = new Date(post.date).toLocaleDateString(locale, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="glass-card overflow-hidden block hover:border-[var(--color-border-hover)] transition-all duration-300 group"
              >
                {post.heroImage && (
                  <div className="w-full h-48 sm:h-56 overflow-hidden">
                    <img src={post.heroImage} alt={postTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" width={600} height={315} loading="lazy" />
                  </div>
                )}
                <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3 text-sm text-[var(--color-text-muted)] mb-3">
                  <span className="flex items-center gap-1.5">
                    <i className="fas fa-calendar-alt text-xs"></i>
                    {formattedDate}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-[var(--color-text-muted)]"></span>
                  <span className="flex items-center gap-1.5">
                    <i className="fas fa-clock text-xs"></i>
                    {t('readTime', { minutes: post.readTime })}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold mb-2 group-hover:text-[var(--color-purple)] transition-colors duration-300">
                  {postTitle}
                </h2>
                <p className="text-[var(--color-text-muted)] leading-relaxed">
                  {postExcerpt}
                </p>
                <span className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-[var(--color-purple)] group-hover:gap-2.5 transition-all duration-300">
                  {t('readMore')} <i className="fas fa-arrow-right text-xs"></i>
                </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
