import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { tools, getToolBySlug } from '@/data/tools';
import { locales } from '@/i18n/config';
import ToolPageClient from './ToolPageClient';

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
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default async function ToolPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const tool = getToolBySlug(slug, locale);
  if (!tool) notFound();

  return <ToolPageClient toolId={tool.id} />;
}
