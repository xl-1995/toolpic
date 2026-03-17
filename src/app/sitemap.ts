import { MetadataRoute } from 'next';
import { locales } from '@/i18n/config';
import { tools } from '@/data/tools';
import { seoPages } from '@/data/seo-pages';
import { blogPosts } from '@/data/blog';

const baseUrl = 'https://toolpic.me';

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Homepage - all 20 locales
  const homepageLanguages: Record<string, string> = {};
  for (const locale of locales) {
    homepageLanguages[locale] = `${baseUrl}/${locale}`;
  }
  homepageLanguages['x-default'] = `${baseUrl}/en`;

  for (const locale of locales) {
    entries.push({
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
      alternates: { languages: homepageLanguages },
    });
  }

  // Tool pages - all 10 tools × 20 locales = 200 entries
  for (const tool of tools) {
    const toolLanguages: Record<string, string> = {};
    for (const locale of locales) {
      const slug = tool.slugs[locale] || tool.slugs['en'];
      toolLanguages[locale] = `${baseUrl}/${locale}/tools/${slug}`;
    }
    toolLanguages['x-default'] = `${baseUrl}/en/tools/${tool.slugs['en']}`;

    for (const locale of locales) {
      const slug = tool.slugs[locale] || tool.slugs['en'];
      entries.push({
        url: `${baseUrl}/${locale}/tools/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: { languages: toolLanguages },
      });
    }
  }

  // SEO landing pages - all 24 pages × 20 locales = 480 entries
  for (const page of seoPages) {
    const seoLanguages: Record<string, string> = {};
    for (const locale of locales) {
      seoLanguages[locale] = `${baseUrl}/${locale}/tools/s/${page.slug}`;
    }
    seoLanguages['x-default'] = `${baseUrl}/en/tools/s/${page.slug}`;

    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}/${locale}/tools/s/${page.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
        alternates: { languages: seoLanguages },
      });
    }
  }

  // Blog listing page - all locales
  const blogLanguages: Record<string, string> = {};
  for (const locale of locales) {
    blogLanguages[locale] = `${baseUrl}/${locale}/blog`;
  }
  blogLanguages['x-default'] = `${baseUrl}/en/blog`;

  for (const locale of locales) {
    entries.push({
      url: `${baseUrl}/${locale}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
      alternates: { languages: blogLanguages },
    });
  }

  // Blog post entries - all locales
  for (const post of blogPosts) {
    const postLanguages: Record<string, string> = {};
    for (const locale of locales) {
      postLanguages[locale] = `${baseUrl}/${locale}/blog/${post.slug}`;
    }
    postLanguages['x-default'] = `${baseUrl}/en/blog/${post.slug}`;

    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}/${locale}/blog/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: { languages: postLanguages },
      });
    }
  }

  return entries;
}
