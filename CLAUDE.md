# ToolPic - Online Image & Video Tools

## Project Overview
- **Site**: toolpic.me
- **Tech**: Next.js 15 (App Router) + TypeScript + Tailwind CSS 4 + next-intl
- **Deploy**: Cloudflare Workers (OpenNext)
- **Processing**: 100% browser-based (no server uploads)
- **Domain**: toolpic.me (Cloudflare DNS + Workers custom domain)

## Key Architecture
- `src/app/[locale]/` — Locale-based routing (20 languages)
- `src/app/[locale]/tools/[slug]/` — Tool pages (10 tools)
- `src/app/[locale]/tools/s/[slug]/` — Programmatic SEO landing pages (24 pages)
- `src/app/[locale]/blog/` — Blog listing + articles (8 posts)
- `src/messages/{locale}.json` — Translation files (20 languages)
- `src/data/tools.ts` — Tool registry with localized slugs
- `src/data/seo-pages.ts` — SEO landing page registry
- `src/data/blog.ts` — Blog post registry
- `src/components/tools/` — Individual tool components
- `src/lib/ffmpeg.ts` — Shared FFmpeg WASM helper
- `src/i18n/` — next-intl configuration

## Languages (20)
All languages use URL prefix: `/{locale}/...`
- en, zh, ja, ko, es, fr, de, pt, ru, ar, hi, it, tr, vi, th, id, nl, pl, uk, ms

## URL Structure (localePrefix: 'always')
- Homepage: `toolpic.me/{locale}`
- Tools: `toolpic.me/{locale}/tools/{localized-slug}`
- SEO pages: `toolpic.me/{locale}/tools/s/{slug}`
- Blog: `toolpic.me/{locale}/blog/{slug}`

**CRITICAL: Do NOT use `localePrefix: 'as-needed'` — it breaks on OpenNext/Cloudflare Workers. Always use `'always'`.**

## Important Rules

### 多语言铁律
**每次新增任何内容（工具、博客、SEO页面、导航项），必须同时完成所有 20 种语言的翻译。**
- 绝不只做英文版然后"后续翻译" — 会导致构建失败
- 用并行 Agent 分组翻译（4-5组 × 4-5语言）提高效率

### SEO 规则
1. **每个页面必须有**: title, meta description, canonical, hreflang(21个), OG tags, Twitter Card
2. **工具页 JSON-LD**: WebApplication + FAQPage + BreadcrumbList
3. **博客页 JSON-LD**: Article + BreadcrumbList
4. **首页 JSON-LD**: WebSite
5. **SEO 内容**: 每个工具页必须有 How to Use + Features + FAQ 三个板块
6. **Sitemap**: 动态生成，覆盖所有语言所有页面

### 图片规则
1. **OG 图片**: JPEG 格式, 1200x630, < 100KB
2. **生成工具**: nano-banana-pro skill (`--size 1K --aspect-ratio 16:9`)
3. **压缩**: 生成后用 sharp 压缩 `sharp(input).jpeg({quality:85,mozjpeg:true})`
4. **Favicon**: SVG + PNG 512px (< 120KB)
5. **Apple Touch Icon**: 180x180px (< 50KB)
6. **博客配图**: 每篇文章需要 hero 图片和独立 OG 图片

### 代码规则
1. **All processing client-side** — Never upload files to server
2. **Arabic RTL** — Layout uses `dir="rtl"` for ar locale
3. **语言切换器**: 用原生 `<select>` 而非 React 自定义下拉菜单（OpenNext 水合问题）
4. **工具组件**: `'use client'` + DropZone + useTranslations('common')

## Build & Deploy
```bash
rm -rf .next .open-next
npx opennextjs-cloudflare build    # Build for Cloudflare Workers
npx wrangler deploy                # Deploy to Cloudflare
```
**wrangler.toml 必须包含 `account_id`**

## Post-Deploy Checklist
1. 验证关键页面返回 200
2. 检查 JSON-LD 结构化数据
3. 去 Google Search Console 重新提交 sitemap
4. 请求索引新页面

## Page Count
- Homepage: 20 (1 × 20 locales)
- Tool pages: 200 (10 × 20)
- SEO pages: 480 (24 × 20)
- Blog: 180 (9 pages × 20)
- **Total: 885 static pages**

## Tools (10)
Image: compressor, converter, crop, watermark, bg-remove, merge
Video: compressor, converter, to-gif, extract-audio

## Core Libraries
- `browser-image-compression` — Image compression
- `@ffmpeg/ffmpeg` + `@ffmpeg/util` — Video processing via WASM
- `sharp` — Server-side image optimization (build time)
- `next-intl` — Internationalization (20 languages)

## Adding New Content

### New Tool
1. Create component `src/components/tools/NewTool.tsx`
2. Add to `src/data/tools.ts` (with 20 localized slugs)
3. Register in `ToolPageClient.tsx`
4. Add translations to ALL 20 `src/messages/{locale}.json` (title, description, h1, metaTitle, metaDescription, SEO content keys)
5. Generate tool preview image + compress with sharp
6. Build, deploy, submit GSC

### New Blog Post
1. Add to `src/data/blog.ts`
2. Write content in ALL 20 `src/messages/{locale}.json` `blog.posts` section
3. Generate hero image + OG image with nano-banana-pro, compress with sharp
4. Build, deploy, submit GSC

### New SEO Landing Page
1. Add to `src/data/seo-pages.ts`
2. Add translations to ALL 20 `src/messages/{locale}.json` `seoPages` section
3. Build, deploy, submit GSC
