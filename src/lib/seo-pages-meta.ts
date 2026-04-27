export type SeoPageStrings = Record<string, string>;

export async function loadSeoPagesMeta(locale: string): Promise<{
  meta: SeoPageStrings;
  enMeta: SeoPageStrings;
}> {
  const enMeta = (await import(`@/content/seo-pages/en.json`)).default as SeoPageStrings;
  let meta = enMeta;
  if (locale !== 'en') {
    try {
      meta = (await import(`@/content/seo-pages/${locale}.json`)).default as SeoPageStrings;
    } catch {
      meta = enMeta;
    }
  }
  return { meta, enMeta };
}

export function resolveKey(meta: SeoPageStrings, enMeta: SeoPageStrings, key: string): string {
  return meta[key] ?? enMeta[key] ?? '';
}
