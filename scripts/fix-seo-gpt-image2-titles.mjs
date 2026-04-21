#!/usr/bin/env node
/**
 * Second pass — rewrite remaining long metaTitles (>60 chars) per locale.
 * Principle: keep "GPT Image 2" (brand) + one differentiator + year tag for freshness.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const GUIDE = 'gpt-image-2-everything-we-know-2026-guide';
const PROMPTS = 'best-gpt-image-2-prompts-viral-examples';

const overrides = {
  en: {
    [GUIDE]:   "GPT Image 2 Guide: OpenAI's New Image Model (April 2026)",
    [PROMPTS]: "Best GPT Image 2 Prompts — Viral Examples & Templates (2026)",
  },
  es: {
    [GUIDE]:   "Guía de GPT Image 2: nuevo modelo de imagen de OpenAI (2026)",
    [PROMPTS]: "Mejores prompts de GPT Image 2: ejemplos virales (2026)",
  },
  fr: {
    [GUIDE]:   "Guide GPT Image 2 : nouveau modèle d'image OpenAI (2026)",
    [PROMPTS]: "Meilleurs prompts GPT Image 2 : exemples viraux (2026)",
  },
  de: {
    [GUIDE]:   "GPT Image 2 Guide: OpenAIs neues Bildmodell (April 2026)",
    [PROMPTS]: "Beste GPT Image 2 Prompts: virale Beispiele (2026)",
  },
  pt: {
    [GUIDE]:   "Guia GPT Image 2: novo modelo de imagem da OpenAI (2026)",
    [PROMPTS]: "Melhores prompts GPT Image 2: exemplos virais (2026)",
  },
  ru: {
    [GUIDE]:   "Гайд по GPT Image 2: новая модель OpenAI (апрель 2026)",
    [PROMPTS]: "Лучшие промпты GPT Image 2: вирусные примеры (2026)",
  },
  hi: {
    [GUIDE]:   "GPT Image 2 गाइड: OpenAI का नया इमेज मॉडल (2026)",
    [PROMPTS]: "बेस्ट GPT Image 2 प्रॉम्प्ट: वायरल उदाहरण (2026)",
  },
  it: {
    [GUIDE]:   "Guida GPT Image 2: nuovo modello immagini OpenAI (2026)",
    [PROMPTS]: "Migliori prompt GPT Image 2: esempi virali (2026)",
  },
  tr: {
    [PROMPTS]: "En İyi GPT Image 2 Promptları: Viral Örnekler (2026)",
  },
  vi: {
    [GUIDE]:   "Hướng dẫn GPT Image 2: mô hình ảnh mới của OpenAI (2026)",
  },
  th: {
    [PROMPTS]: "Prompt GPT Image 2 ยอดเยี่ยม: ตัวอย่างไวรัล (2026)",
  },
  id: {
    [GUIDE]:   "Panduan GPT Image 2: Model Gambar Baru OpenAI (2026)",
  },
  nl: {
    [GUIDE]:   "GPT Image 2-gids: OpenAI's nieuwe beeldmodel (2026)",
    [PROMPTS]: "Beste GPT Image 2-prompts: virale voorbeelden (2026)",
  },
  pl: {
    [GUIDE]:   "Przewodnik GPT Image 2: nowy model OpenAI (2026)",
    [PROMPTS]: "Najlepsze prompty GPT Image 2: wiralowe przykłady (2026)",
  },
  uk: {
    [GUIDE]:   "Гайд GPT Image 2: нова модель OpenAI (квітень 2026)",
    [PROMPTS]: "Найкращі промпти GPT Image 2: вірусні приклади (2026)",
  },
  ms: {
    [GUIDE]:   "Panduan GPT Image 2: Model Imej Baharu OpenAI (2026)",
  },
};

let files = 0, edits = 0;
for (const [loc, slugMap] of Object.entries(overrides)) {
  const path = join('src/messages', `${loc}.json`);
  const data = JSON.parse(readFileSync(path, 'utf-8'));
  let changed = false;
  for (const [slug, newTitle] of Object.entries(slugMap)) {
    const post = data.blog?.posts?.[slug];
    if (!post) continue;
    const old = post.metaTitle;
    if (old !== newTitle) {
      post.metaTitle = newTitle;
      changed = true;
      edits++;
      console.log(`[${loc}][${slug.slice(0,40)}] ${old.length} → ${newTitle.length}  ${newTitle}`);
    }
  }
  if (changed) {
    writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf-8');
    files++;
  }
}
console.log(`\n=== ${files} files, ${edits} edits ===`);
