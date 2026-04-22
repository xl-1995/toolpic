#!/usr/bin/env node
/**
 * Extract blog post `content` arrays from src/messages/*.json into
 * src/content/blog/{locale}/{slug}.json — keeps message files tiny so
 * next-intl doesn't bundle ~1.2 MiB of article bodies into the CF Worker.
 *
 * messages[locale].blog.posts[slug].{title, metaTitle, metaDescription, excerpt, relatedToolIds}  ← stays
 * messages[locale].blog.posts[slug].content  ← moved out
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const CONTENT_DIR = 'src/content/blog';
const MESSAGES_DIR = 'src/messages';

const locales = readdirSync(MESSAGES_DIR)
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.slice(0, -5));

let filesWritten = 0;
let postsProcessed = 0;
const perLocale = {};

for (const locale of locales) {
  const msgPath = join(MESSAGES_DIR, `${locale}.json`);
  const data = JSON.parse(readFileSync(msgPath, 'utf-8'));
  const posts = data?.blog?.posts ?? {};

  const localeDir = join(CONTENT_DIR, locale);
  if (!existsSync(localeDir)) mkdirSync(localeDir, { recursive: true });

  let n = 0;
  for (const [slug, post] of Object.entries(posts)) {
    if (Array.isArray(post.content) && post.content.length > 0) {
      const outPath = join(localeDir, `${slug}.json`);
      writeFileSync(outPath, JSON.stringify(post.content, null, 2) + '\n', 'utf-8');
      delete post.content;
      filesWritten++;
      n++;
    }
  }

  writeFileSync(msgPath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  perLocale[locale] = n;
  postsProcessed += n;
}

console.log(`Locales processed: ${locales.length}`);
console.log(`Posts per locale:`, perLocale);
console.log(`Total content files written: ${filesWritten}`);
console.log(`Total posts processed: ${postsProcessed}`);
