# ToolPic - Online Image & Video Tools

## Project Overview
- **Site**: toolpic.me
- **Tech**: Next.js 15 (App Router) + TypeScript + Tailwind CSS 4 + next-intl
- **Deploy**: Cloudflare Pages (static export)
- **Processing**: 100% browser-based (no server uploads)

## Key Architecture
- `src/app/[locale]/` — Locale-based routing (20 languages)
- `src/messages/{locale}.json` — Translation files
- `src/data/tools.ts` — Tool registry with localized slugs
- `src/components/tools/` — Individual tool components
- `src/i18n/` — next-intl configuration

## Languages (20)
Default: **en** (no URL prefix)
Others: zh, ja, ko, es, fr, de, pt, ru, ar, hi, it, tr, vi, th, id, nl, pl, uk, ms

## URL Structure
- English (default): `toolpic.me/tools/image-compressor`
- Other languages: `toolpic.me/{locale}/tools/{localized-slug}`
- Localized slugs defined in `src/data/tools.ts`

## Important Rules
1. **No .html in URLs** — Cloudflare Pages Pretty URLs
2. **All processing client-side** — Never upload files to server
3. **Static export** — `output: 'export'` in next.config.ts
4. **hreflang on all pages** — next-intl handles this via locale routing
5. **Arabic RTL** — Layout uses `dir="rtl"` for ar locale

## Build & Deploy
```bash
pnpm install
pnpm build        # Static export to /out
```

## Tools (10)
Image: compressor, converter, crop, watermark, bg-remove, merge
Video: compressor, converter, to-gif, extract-audio

## Core Libraries
- `browser-image-compression` — Image compression
- `@ffmpeg/ffmpeg` + `@ffmpeg/util` — Video processing via WASM
