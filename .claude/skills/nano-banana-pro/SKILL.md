---
name: nano-banana-pro
description: Generate images using Google's Nano Banana Pro (Gemini 3 Pro Image) model. Use when the user asks to "generate an image", "create a picture", "make an illustration", "生成图片", "生图", "AI绘图", "配图", or needs OG images, hero backgrounds, icons, or any visual assets. Also triggers on mentions of "Nano Banana", "nano banana pro", or "Gemini image".
---

# Nano Banana Pro Image Generator

Generate high-quality images using Google's Nano Banana Pro (Gemini 3 Pro Image) API.

## Quick Start

```bash
python <skill-dir>/scripts/generate_image.py --prompt "your prompt" --output output.png
```

## Options

| Flag | Default | Description |
|------|---------|-------------|
| `--prompt`, `-p` | (required) | Text prompt describing the image |
| `--output`, `-o` | (required) | Output file path |
| `--aspect-ratio`, `-a` | `16:9` | Aspect ratio: 1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9 |
| `--size`, `-s` | `2K` | Resolution: 1K, 2K, 4K |
| `--model`, `-m` | `gemini-3-pro-image-preview` | Model ID |

## API Key

Reads `GEMINIKEY` from `.env` file (searches current dir and parents) or environment variable.

## Prompt Tips

- Be specific and detailed about style, colors, composition
- For OG/social images: use `--aspect-ratio 16:9 --size 2K`
- For square icons: use `--aspect-ratio 1:1`
- For portrait/mobile: use `--aspect-ratio 9:16`
- Include style keywords: "flat design", "photorealistic", "illustration", "minimalist", "dark theme"
- For website assets, specify background color and brand colors in the prompt

## Examples

```bash
# OG image for a website
python generate_image.py -p "A mystical dark background with golden Chinese calligraphy and constellation patterns, elegant fortune-telling theme" -o og-image.jpg -a 16:9

# Square social media image
python generate_image.py -p "Minimalist yin-yang symbol with gold gradient on dark background" -o icon.png -a 1:1

# Hero background
python generate_image.py -p "Abstract dark cosmic background with subtle golden light rays and Chinese mystical symbols, 8K quality" -o hero-bg.jpg -a 21:9
```
