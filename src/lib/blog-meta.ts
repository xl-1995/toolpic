export type BlogPostMeta = {
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  relatedToolIds: string;
};

export type BlogMetaMap = Record<string, BlogPostMeta>;

export async function loadBlogMeta(locale: string): Promise<BlogMetaMap> {
  try {
    return (await import(`@/content/blog/${locale}/_meta.json`)).default as BlogMetaMap;
  } catch {
    return (await import(`@/content/blog/en/_meta.json`)).default as BlogMetaMap;
  }
}

export async function loadBlogMetaWithFallback(locale: string): Promise<{
  meta: BlogMetaMap;
  enMeta: BlogMetaMap;
}> {
  const enMeta = (await import(`@/content/blog/en/_meta.json`)).default as BlogMetaMap;
  let meta = enMeta;
  if (locale !== 'en') {
    try {
      meta = (await import(`@/content/blog/${locale}/_meta.json`)).default as BlogMetaMap;
    } catch {
      meta = enMeta;
    }
  }
  return { meta, enMeta };
}
