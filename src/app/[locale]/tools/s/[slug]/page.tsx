import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/config';
import { seoPages } from '@/data/seo-pages';
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

  let metaTitle: string;
  let metaDescription: string;
  try {
    const t = await getTranslations({ locale, namespace: 'seoPages' });
    metaTitle = t(page.titleKey);
    metaDescription = t(page.descKey);
  } catch {
    try {
      const tEn = await getTranslations({ locale: 'en', namespace: 'seoPages' });
      metaTitle = tEn(page.titleKey);
      metaDescription = tEn(page.descKey);
    } catch {
      metaTitle = 'ToolPic - Free Online Image & Video Tools';
      metaDescription = 'Free browser-based image and video tools. No uploads, 100% private.';
    }
  }

  const url = locale === 'en'
    ? `${baseUrl}/tools/s/${slug}`
    : `${baseUrl}/${locale}/tools/s/${slug}`;

  // Build alternates for all locales
  const languages: Record<string, string> = {};
  for (const loc of locales) {
    languages[loc] = loc === 'en'
      ? `${baseUrl}/tools/s/${slug}`
      : `${baseUrl}/${loc}/tools/s/${slug}`;
  }
  languages['x-default'] = `${baseUrl}/tools/s/${slug}`;

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

  const t = await getTranslations({ locale, namespace: 'seoPages' });

  const url = locale === 'en'
    ? `${baseUrl}/tools/s/${slug}`
    : `${baseUrl}/${locale}/tools/s/${slug}`;

  // WebApplication JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: t(page.titleKey),
    description: t(page.descKey),
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
      const q = t(`${page.titleKey}Faq${i}Q`);
      const a = t(`${page.titleKey}Faq${i}A`);
      if (q && a) faqItems.push({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } });
    } catch { /* key missing */ }
  }
  const faqJsonLd = faqItems.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems,
  } : null;

  // BreadcrumbList JSON-LD
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ToolPic', item: `${baseUrl}/${locale}` },
      { '@type': 'ListItem', position: 2, name: t(page.titleKey), item: url },
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
        titleKey={page.titleKey}
        descKey={page.descKey}
      />
    </>
  );
}
