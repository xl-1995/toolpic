import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { locales } from '@/i18n/config';
import { blogPosts } from '@/data/blog';
import { tools, getToolSlug } from '@/data/tools';

const baseUrl = 'https://toolpic.me';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of locales) {
    for (const post of blogPosts) {
      params.push({ locale, slug: post.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return {};

  let metaTitle: string;
  let metaDescription: string;
  try {
    const t = await getTranslations({ locale, namespace: 'blog' });
    metaTitle = t(`posts.${slug}.metaTitle`);
    metaDescription = t(`posts.${slug}.metaDescription`);
  } catch {
    try {
      const tEn = await getTranslations({ locale: 'en', namespace: 'blog' });
      metaTitle = tEn(`posts.${slug}.metaTitle`);
      metaDescription = tEn(`posts.${slug}.metaDescription`);
    } catch {
      metaTitle = 'ToolPic Blog - Image & Video Tips';
      metaDescription = 'Tips and guides for working with images and videos online.';
    }
  }

  const url = `${baseUrl}/${locale}/blog/${slug}`;

  const languages: Record<string, string> = {};
  for (const loc of locales) {
    languages[loc] = `${baseUrl}/${loc}/blog/${slug}`;
  }
  languages['x-default'] = `${baseUrl}/en/blog/${slug}`;

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: {
      canonical: url,
      languages,
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url,
      siteName: 'ToolPic',
      type: 'article',
      locale,
      publishedTime: post.date,
      images: [{ url: `${baseUrl}${post.heroImage}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: metaTitle,
      description: metaDescription,
      images: [`${baseUrl}${post.heroImage}`],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  const t = await getTranslations({ locale, namespace: 'blog' });
  const toolsT = await getTranslations({ locale, namespace: 'tools' });
  const commonT = await getTranslations({ locale, namespace: 'common' });

  let title: string;
  let contentSections: Array<{ heading: string; text: string }>;
  let relatedToolIds: string;
  try {
    title = t(`posts.${slug}.title`);
    contentSections = t.raw(`posts.${slug}.content`) as Array<{ heading: string; text: string }>;
    relatedToolIds = t(`posts.${slug}.relatedToolIds`);
  } catch {
    notFound();
  }

  const url = `${baseUrl}/${locale}/blog/${slug}`;

  const formattedDate = new Date(post.date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // JSON-LD Article schema
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Organization',
      name: 'ToolPic',
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'ToolPic',
      url: baseUrl,
    },
    url,
    mainEntityOfPage: url,
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ToolPic', item: `${baseUrl}/${locale}` },
      { '@type': 'ListItem', position: 2, name: t('title'), item: `${baseUrl}/${locale}/blog` },
      { '@type': 'ListItem', position: 3, name: title, item: url },
    ],
  };

  // Parse related tool IDs
  const relatedIds = relatedToolIds.split(',').map((id) => id.trim());
  const relatedTools = tools.filter((tool) => relatedIds.includes(tool.id));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="background-grid" />

      <article className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-24">
        {/* Back to blog */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors duration-300 mb-8"
        >
          <i className="fas fa-arrow-left text-xs"></i>
          {t('title')}
        </Link>

        {/* Header */}
        <header className="mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight mb-4 gradient-text">
            {title}
          </h1>
          <div className="flex items-center gap-3 text-sm text-[var(--color-text-muted)]">
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
        </header>

        {/* Hero image */}
        {post.heroImage && (
          <div className="mb-12 rounded-2xl overflow-hidden">
            <img src={post.heroImage} alt={title} className="w-full h-auto" width={1200} height={630} loading="eager" fetchPriority="high" />
          </div>
        )}

        {/* Content sections */}
        <div className="space-y-10">
          {contentSections.map((section, index) => (
            <section key={index}>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-[var(--color-text)]">
                {section.heading}
              </h2>
              <div className="text-[var(--color-text-muted)] leading-[1.8] text-[1.05rem] whitespace-pre-line">
                {section.text}
              </div>
            </section>
          ))}
        </div>

        {/* Related Tools */}
        {relatedTools.length > 0 && (
          <div className="mt-16 pt-10 border-t border-[var(--color-border)]">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <i className="fas fa-wrench text-[var(--color-purple)]"></i>
              {t('relatedTools')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedTools.map((tool) => {
                const toolSlug = getToolSlug(tool.id, locale);
                let toolTitle: string;
                let toolDesc: string;
                try {
                  toolTitle = toolsT(`${tool.id}.title`);
                  toolDesc = toolsT(`${tool.id}.description`);
                } catch {
                  toolTitle = tool.id;
                  toolDesc = '';
                }
                return (
                  <Link
                    key={tool.id}
                    href={`/tools/${toolSlug}`}
                    className="glass-card p-5 block hover:border-[var(--color-border-hover)] transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-purple)]/10 to-[var(--color-blue)]/10 flex items-center justify-center">
                        <i className={`fas fa-${tool.icon} text-sm text-[var(--color-text)]`}></i>
                      </div>
                      <h4 className="font-semibold group-hover:text-[var(--color-purple)] transition-colors">
                        {toolTitle}
                      </h4>
                    </div>
                    <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                      {toolDesc}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* More Articles */}
        {(() => {
          const otherPosts = blogPosts.filter((p) => p.slug !== slug).slice(0, 3);
          if (otherPosts.length === 0) return null;
          return (
            <div className="mt-12 pt-10 border-t border-[var(--color-border)]">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <i className="fas fa-newspaper text-[var(--color-purple)]"></i>
                {commonT('relatedArticlesTitle')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {otherPosts.map((otherPost) => {
                  let otherTitle: string;
                  try {
                    otherTitle = t(`posts.${otherPost.slug}.title`);
                  } catch {
                    otherTitle = otherPost.slug.replace(/-/g, ' ');
                  }
                  const otherDate = new Date(otherPost.date).toLocaleDateString(locale, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });
                  return (
                    <Link
                      key={otherPost.slug}
                      href={`/blog/${otherPost.slug}`}
                      className="glass-card p-4 block hover:border-[var(--color-border-hover)] transition-all duration-300 group"
                    >
                      {otherPost.heroImage && (
                        <div className="rounded-lg overflow-hidden mb-3 aspect-[16/9]">
                          <img
                            src={otherPost.heroImage}
                            alt={otherTitle}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            width={400}
                            height={225}
                            loading="lazy"
                          />
                        </div>
                      )}
                      <h4 className="font-semibold text-sm mb-1.5 line-clamp-2 group-hover:text-[var(--color-purple)] transition-colors">
                        {otherTitle}
                      </h4>
                      <span className="text-xs text-[var(--color-text-muted)]">{otherDate}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </article>
    </>
  );
}
