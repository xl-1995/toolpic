#!/usr/bin/env node
/**
 * One-off SEO fixer for GPT Image 2 content across all 20 locales.
 *
 * Fixes:
 *  1. Strip " | ToolPic" / " — ToolPic" brand suffix from blog metaTitle
 *     (Google auto-appends siteName; hardcoding wastes title-tag pixels)
 *  2. Trim blog metaDescription to <=158 chars at sentence/clause boundary
 *  3. Shorten resizeAiImage SEO page title: "...Free for GPT Image 2, Midjourney & DALL-E" → "...for GPT Image 2 & More"
 *  4. Trim compressGptImage2Desc / resizeAiImageDesc / convertGptImageToJpgDesc to <=158
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const locales = ['en','zh','ja','ko','es','fr','de','pt','ru','ar','hi','it','tr','vi','th','id','nl','pl','uk','ms'];
const blogSlugs = [
  'gpt-image-2-everything-we-know-2026-guide',
  'best-gpt-image-2-prompts-viral-examples',
];

// Match both em-dash and pipe variants, any whitespace around them
const BRAND_SUFFIX_RE = /\s*[|—–-]\s*ToolPic\s*$/u;

// CJK scripts — narrower effective width in SERP
const CJK = new Set(['zh','ja','ko','th']);

// Maximum meta description length (Google typically truncates ~155-160)
const MAX_DESC = 158;

// Trim a description at last sentence/clause boundary ≤max chars
function trimDesc(desc, max = MAX_DESC) {
  if (!desc || desc.length <= max) return desc;
  const slice = desc.slice(0, max);
  // Prefer sentence boundary
  const sentenceEnders = [/。[^。]*$/u, /\.[^\.]*$/, /!\s[^!]*$/, /!\s*$/];
  for (const re of sentenceEnders) {
    const m = slice.match(re);
    if (m && m.index > max * 0.6) {
      return slice.slice(0, m.index + 1).trim();
    }
  }
  // Fallback: cut at last comma/space
  const cutAt = Math.max(slice.lastIndexOf('，'), slice.lastIndexOf(','), slice.lastIndexOf(' '));
  return (cutAt > max * 0.6 ? slice.slice(0, cutAt) : slice).trim();
}

// Shorter "resize AI image" SEO-page title per locale — all ≤60 chars
const RESIZE_TITLE_OVERRIDES = {
  en: 'Resize AI Image Online — GPT Image 2, Midjourney, DALL-E',
  zh: '在线调整 AI 图片尺寸 — GPT Image 2 / Midjourney / DALL-E',
  ja: 'AI画像のリサイズ — GPT Image 2 / Midjourney / DALL-E対応',
  ko: 'AI 이미지 리사이즈 — GPT Image 2 / Midjourney / DALL-E',
  es: 'Redimensionar imagen IA — GPT Image 2, Midjourney, DALL-E',
  fr: 'Redimensionner image IA — GPT Image 2, Midjourney, DALL-E',
  de: 'KI-Bild skalieren — GPT Image 2, Midjourney, DALL-E',
  pt: 'Redimensionar imagem IA — GPT Image 2, Midjourney, DALL-E',
  ru: 'Изменить размер AI-изображения — GPT Image 2, Midjourney',
  ar: 'تغيير حجم صورة AI — GPT Image 2 وMidjourney وDALL-E',
  hi: 'AI इमेज रीसाइज़ — GPT Image 2, Midjourney, DALL-E',
  it: 'Ridimensiona immagine IA — GPT Image 2, Midjourney, DALL-E',
  tr: 'AI Görseli Yeniden Boyutlandır — GPT Image 2 & Midjourney',
  vi: 'Đổi cỡ ảnh AI — GPT Image 2, Midjourney, DALL-E',
  th: 'ปรับขนาดภาพ AI — GPT Image 2 / Midjourney / DALL-E',
  id: 'Ubah Ukuran Gambar AI — GPT Image 2, Midjourney, DALL-E',
  nl: 'AI-afbeelding resizen — GPT Image 2, Midjourney, DALL-E',
  pl: 'Zmień rozmiar obrazu AI — GPT Image 2, Midjourney, DALL-E',
  uk: 'Змінити розмір AI-зображення — GPT Image 2, Midjourney',
  ms: 'Saiz Semula Imej AI — GPT Image 2, Midjourney, DALL-E',
};

const report = [];
let filesChanged = 0;

for (const loc of locales) {
  const path = join('src/messages', `${loc}.json`);
  const raw = readFileSync(path, 'utf-8');
  const data = JSON.parse(raw);
  let changed = false;

  // 1 + 2: Blog metaTitle suffix strip + metaDescription trim
  for (const slug of blogSlugs) {
    const post = data?.blog?.posts?.[slug];
    if (!post) continue;

    const origTitle = post.metaTitle;
    if (origTitle && BRAND_SUFFIX_RE.test(origTitle)) {
      const newTitle = origTitle.replace(BRAND_SUFFIX_RE, '');
      post.metaTitle = newTitle;
      changed = true;
      report.push(`[${loc}][${slug}] metaTitle: ${origTitle.length} → ${newTitle.length}`);
    }

    const origDesc = post.metaDescription;
    if (origDesc && origDesc.length > MAX_DESC) {
      const newDesc = trimDesc(origDesc);
      if (newDesc && newDesc !== origDesc) {
        post.metaDescription = newDesc;
        changed = true;
        report.push(`[${loc}][${slug}] metaDesc: ${origDesc.length} → ${newDesc.length}`);
      }
    }
  }

  // 3: resizeAiImage SEO page title override
  const seo = data?.seoPages;
  if (seo && RESIZE_TITLE_OVERRIDES[loc] && seo.resizeAiImage !== RESIZE_TITLE_OVERRIDES[loc]) {
    const oldT = seo.resizeAiImage;
    seo.resizeAiImage = RESIZE_TITLE_OVERRIDES[loc];
    changed = true;
    report.push(`[${loc}][resizeAiImage] title: ${oldT?.length || 0} → ${seo.resizeAiImage.length}`);
  }

  // 4: Trim 3 SEO page descriptions
  for (const key of ['compressGptImage2Desc', 'resizeAiImageDesc', 'convertGptImageToJpgDesc']) {
    const v = seo?.[key];
    if (v && v.length > MAX_DESC) {
      const newV = trimDesc(v);
      if (newV && newV !== v) {
        seo[key] = newV;
        changed = true;
        report.push(`[${loc}][${key}]: ${v.length} → ${newV.length}`);
      }
    }
  }

  if (changed) {
    writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf-8');
    filesChanged++;
  }
}

console.log(report.join('\n'));
console.log(`\n=== ${filesChanged} files changed, ${report.length} edits ===`);
