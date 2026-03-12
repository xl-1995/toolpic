---
name: gemini-webdev
description: >
  Generate frontend web pages using Google Gemini API (default: gemini-2.5-pro, supports gemini-2.5-pro).
  Gemini excels at UI/UX design and produces high-quality, responsive, modern web pages. Use when the user asks to "build a web page",
  "create a landing page", "design a website", "make an HTML page", "write frontend code",
  "generate a UI", "build a dashboard", "create a form page", or any request involving frontend
  web page creation, HTML/CSS/JS generation, or UI design. Also triggers on: "use Gemini to build",
  "let Gemini design", "gemini webdev", "gemini web", "gemini frontend", "gemini page".
---

# Gemini WebDev

Generate production-quality frontend web pages by calling Google Gemini 3.1 Pro API via the bundled script.

## Workflow

### 1. Clarify Requirements

Before generating, understand what the user needs:
- Page type (landing page, dashboard, form, portfolio, e-commerce, etc.)
- Style preferences (modern, minimal, colorful, dark theme, etc.)
- Key sections or features
- Any specific libraries (Tailwind, Bootstrap, Chart.js, etc.)

### 2. Generate the Page

Run the bundled script to call Gemini and produce the web page files:

```bash
python <skill-dir>/scripts/gemini_webdev.py --prompt "<user requirements>" --output <output-dir>
```

**Options:**
- `--prompt "..."` — Describe the page to generate
- `--prompt-file <file>` — Read prompt from a file (for complex requirements)
- `--output <dir>` — Output directory (default: current directory)
- `--multi` — Generate separate HTML, CSS, JS files instead of a single HTML
- `--model <name>` — Override model (default: `gemini-2.5-pro`)
- `--raw` — Print raw Gemini response without extracting files

**API Key:** The script reads `GEMINIKEY` from `.env` file (searches current and parent dirs) or environment variable.

### 3. Review and Refine

After generation:
1. Read the generated files to verify quality
2. Open `index.html` in browser to preview
3. If the user wants changes, either:
   - Re-run with an updated prompt that includes the change requests
   - Manually edit the generated files using Edit tool

### 4. Iterate

For iterative refinement, build on the previous output:
- Read the current generated code
- Include it in a new prompt asking Gemini to modify specific parts
- Or edit directly for small tweaks

## Prompt Engineering Tips

Write detailed prompts for best results. Include:
- **Page purpose:** "A SaaS landing page for a project management tool"
- **Sections:** "Hero with CTA, features grid, pricing cards, testimonials, footer"
- **Style:** "Dark theme, glassmorphism effects, gradient accents in purple/blue"
- **Interactions:** "Smooth scroll, animated counters, hover effects on cards"
- **Libraries:** "Use Tailwind CSS via CDN, Font Awesome icons, AOS for scroll animations"

Example prompt:
```
Create a modern portfolio website for a photographer. Include:
- Full-screen hero with background image and overlay text
- Masonry grid gallery with lightbox
- About section with timeline
- Contact form with validation
- Dark theme with gold accents
- Use Tailwind CSS and vanilla JS
- Smooth scroll and fade-in animations
```

## Single vs Multi-File

- **Default (single file):** All HTML/CSS/JS in one `index.html` — best for quick prototypes, demos, single-page sites
- **`--multi` flag:** Separate `index.html`, `styles.css`, `script.js` — best for larger projects that need organized code structure
