import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/config';
import { seoPages } from '@/data/seo-pages';
import { loadSeoPagesMeta, resolveKey } from '@/lib/seo-pages-meta';
import SeoPageClient from './SeoPageClient';

const baseUrl = 'https://toolpic.me';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of locales) {
    for (const page of seoPages) {
      params.push({ locale, slug: page.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const page = seoPages.find((p) => p.slug === slug);
  if (!page) return {};

  const { meta, enMeta } = await loadSeoPagesMeta(locale);

  const metaTitle =
    resolveKey(meta, enMeta, page.titleKey) ||
    'ToolPic - Free Online Image & Video Tools';
  const metaDescription =
    resolveKey(meta, enMeta, page.descKey) ||
    'Free browser-based image and video tools. No uploads, 100% private.';

  const url = `${baseUrl}/${locale}/tools/s/${slug}`;

  const languages: Record<string, string> = {};
  for (const loc of locales) {
    languages[loc] = `${baseUrl}/${loc}/tools/s/${slug}`;
  }
  languages['x-default'] = `${baseUrl}/en/tools/s/${slug}`;

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
      title: metaTitle,
      description: metaDescription,
      images: ['https://toolpic.me/og-image.jpg'],
    },
  };
}

export default async function SeoLandingPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const page = seoPages.find((p) => p.slug === slug);
  if (!page) notFound();

  const { meta, enMeta } = await loadSeoPagesMeta(locale);
  const r = (k: string) => resolveKey(meta, enMeta, k);

  const title = r(page.titleKey);
  const description = r(page.descKey);

  // Resolve How To steps
  const howToTitle = r(`${page.titleKey}HowTo`);
  const steps = [1, 2, 3].map((i) => ({
    title: r(`${page.titleKey}Step${i}`),
    desc: r(`${page.titleKey}Step${i}Desc`),
  }));
  const hasSteps = !!steps[0].title;

  // Resolve FAQ
  const faqTitle = r(`${page.titleKey}FaqTitle`);
  const faqs = [1, 2, 3]
    .map((i) => ({
      q: r(`${page.titleKey}Faq${i}Q`),
      a: r(`${page.titleKey}Faq${i}A`),
    }))
    .filter((f) => f.q && f.a);
  const hasFaqs = faqs.length > 0;

  const url = `${baseUrl}/${locale}/tools/s/${slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: title,
    description,
    url,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  const faqJsonLd = hasFaqs
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }
    : null;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ToolPic', item: `${baseUrl}/${locale}` },
      { '@type': 'ListItem', position: 2, name: title, item: url },
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
      <SeoPageClient
        toolId={page.toolId}
        title={title}
        description={description}
        howToTitle={howToTitle}
        steps={hasSteps ? steps : null}
        faqTitle={faqTitle}
        faqs={hasFaqs ? faqs : null}
      />
    </>
  );
}
