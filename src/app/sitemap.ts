import { MetadataRoute } from 'next';
import { locales } from '@/i18n/config';
import { tools } from '@/data/tools';
import { seoPages } from '@/data/seo-pages';
import { blogPosts } from '@/data/blog';

const baseUrl = 'https://toolpic.me';

// Split sitemap into multiple files to avoid Cloudflare Workers response size truncation
// Next.js will auto-generate a sitemap index at /sitemap.xml pointing to /sitemap/0.xml, /sitemap/1.xml, etc.
export async function generateSitemaps() {
  return [
    { id: 0 }, // homepage (20 entries)
    { id: 1 }, // tool pages (200 entries)
    { id: 2 }, // SEO landing pages (480 entries)
    { id: 3 }, // blog listing + blog posts (720 entries)
  ];
}

export default function sitemap({ id }: { id: number }): MetadataRoute.Sitemap {
  const now = new Date();
  const numId = Number(id);

  switch (numId) {
    case 0:
      return generateHomepageSitemap(now);
    case 1:
      return generateToolsSitemap(now);
    case 2:
      return generateSeoPagesSitemap(now);
    case 3:
      return generateBlogSitemap(now);
    default:
      return [];
  }
}

function generateHomepageSitemap(now: Date): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = `${baseUrl}/${locale}`;
  }
  languages['x-default'] = `${baseUrl}/en`;

  for (const locale of locales) {
    entries.push({
      url: `${baseUrl}/${locale}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
      alternates: { languages },
    });
  }
  return entries;
}

function generateToolsSitemap(now: Date): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  for (const tool of tools) {
    const languages: Record<string, string> = {};
    for (const locale of locales) {
      const slug = tool.slugs[locale] || tool.slugs['en'];
      languages[locale] = `${baseUrl}/${locale}/tools/${slug}`;
    }
    languages['x-default'] = `${baseUrl}/en/tools/${tool.slugs['en']}`;

    for (const locale of locales) {
      const slug = tool.slugs[locale] || tool.slugs['en'];
      entries.push({
        url: `${baseUrl}/${locale}/tools/${slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: locale === 'en' ? 0.9 : 0.8,
        alternates: { languages },
      });
    }
  }
  return entries;
}

function generateSeoPagesSitemap(now: Date): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  for (const page of seoPages) {
    const languages: Record<string, string> = {};
    for (const locale of locales) {
      languages[locale] = `${baseUrl}/${locale}/tools/s/${page.slug}`;
    }
    languages['x-default'] = `${baseUrl}/en/tools/s/${page.slug}`;

    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}/${locale}/tools/s/${page.slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: locale === 'en' ? 0.7 : 0.6,
        alternates: { languages },
      });
    }
  }
  return entries;
}

function generateBlogSitemap(now: Date): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Blog listing pages
  const blogLanguages: Record<string, string> = {};
  for (const locale of locales) {
    blogLanguages[locale] = `${baseUrl}/${locale}/blog`;
  }
  blogLanguages['x-default'] = `${baseUrl}/en/blog`;

  for (const locale of locales) {
    entries.push({
      url: `${baseUrl}/${locale}/blog`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: locale === 'en' ? 0.7 : 0.5,
      alternates: { languages: blogLanguages },
    });
  }

  // Blog post pages
  for (const post of blogPosts) {
    const postLanguages: Record<string, string> = {};
    for (const locale of locales) {
      postLanguages[locale] = `${baseUrl}/${locale}/blog/${post.slug}`;
    }
    postLanguages['x-default'] = `${baseUrl}/en/blog/${post.slug}`;

    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}/${locale}/blog/${post.slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: locale === 'en' ? 0.7 : 0.5,
        alternates: { languages: postLanguages },
      });
    }
  }

  return entries;
}
