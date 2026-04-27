import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { tools, getToolBySlug } from '@/data/tools';
import { getBlogPostsForTool } from '@/data/blog';
import { locales } from '@/i18n/config';
import { loadBlogMetaWithFallback } from '@/lib/blog-meta';
import ToolPageClient from './ToolPageClient';

const baseUrl = 'https://toolpic.me';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of locales) {
    for (const tool of tools) {
      params.push({ locale, slug: tool.slugs[locale] || tool.slugs['en'] });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const tool = getToolBySlug(slug, locale);
  if (!tool) return {};

  const t = await getTranslations({ locale, namespace: `tools.${tool.id}` });

  const localizedSlug = tool.slugs[locale] || tool.slugs['en'];
  const url = `${baseUrl}/${locale}/tools/${localizedSlug}`;

  // Build alternates for all locales
  const languages: Record<string, string> = {};
  for (const loc of locales) {
    const locSlug = tool.slugs[loc] || tool.slugs['en'];
    languages[loc] = `${baseUrl}/${loc}/tools/${locSlug}`;
  }
  languages['x-default'] = `${baseUrl}/en/tools/${tool.slugs['en']}`;

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: {
      canonical: url,
      languages,
    },
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
      url,
      siteName: 'ToolPic',
      type: 'website',
      locale: locale,
      images: [
        {
          url: 'https://toolpic.me/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'ToolPic - Free Online Image & Video Tools',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: t('metaTitle'),
      description: t('metaDescription'),
      images: ['https://toolpic.me/og-image.jpg'],
    },
  };
}

export default async function ToolPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const tool = getToolBySlug(slug, locale);
  if (!tool) notFound();

  const t = await getTranslations({ locale, namespace: `tools.${tool.id}` });

  const { meta: blogMeta, enMeta } = await loadBlogMetaWithFallback(locale);
  const relatedBlogData = getBlogPostsForTool(tool.id).map((post) => {
    const entry = blogMeta[post.slug] || enMeta[post.slug];
    return {
      slug: post.slug,
      heroImage: post.heroImage,
      title: entry?.title || post.slug.replace(/-/g, ' '),
      excerpt: entry?.excerpt || '',
    };
  });

  const localizedSlug = tool.slugs[locale] || tool.slugs['en'];
  const url = `${baseUrl}/${locale}/tools/${localizedSlug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: t('metaTitle'),
    description: t('metaDescription'),
    url,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  // FAQPage structured data for rich results
  const faqItems = [];
  for (let i = 1; i <= 3; i++) {
    try {
      const q = t(`faq${i}Q`);
      const a = t(`faq${i}A`);
      if (q && a) faqItems.push({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } });
    } catch { /* key missing */ }
  }
  const faqJsonLd = faqItems.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems,
  } : null;

  // BreadcrumbList structured data
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ToolPic', item: `${baseUrl}/${locale}` },
      { '@type': 'ListItem', position: 2, name: t('metaTitle'), item: url },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ToolPageClient toolId={tool.id} relatedBlogPosts={relatedBlogData} />
    </>
  );
}
