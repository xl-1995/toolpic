#!/usr/bin/env python3
"""
Gemini WebDev - Generate web pages using Gemini 3.1 Pro API.

Usage:
    python gemini_webdev.py --prompt "Create a landing page for a coffee shop" --output ./output
    python gemini_webdev.py --prompt "Build a dashboard with charts" --output ./output --multi
    python gemini_webdev.py --prompt-file requirements.txt --output ./output
"""

import argparse
import json
import os
import sys
import re
import urllib.request
import urllib.error
from pathlib import Path

DEFAULT_MODEL = "gemini-2.5-pro"
API_BASE = "https://generativelanguage.googleapis.com/v1beta/models"


def load_api_key():
    """Load Gemini API key from .env file or environment."""
    # Try environment variable first
    key = os.getenv("GEMINIKEY")
    if key:
        return key

    # Try .env file in current directory and parent directories
    search_dir = Path.cwd()
    for _ in range(5):
        env_file = search_dir / ".env"
        if env_file.exists():
            with open(env_file, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line.startswith("GEMINIKEY="):
                        return line.split("=", 1)[1].strip().strip('"').strip("'")
        search_dir = search_dir.parent

    return None


def call_gemini(api_key, prompt, model=DEFAULT_MODEL):
    """Call Gemini API using streaming to handle long responses."""
    url = f"{API_BASE}/{model}:streamGenerateContent?alt=sse&key={api_key}"

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 65536,
        },
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        full_text = []
        with urllib.request.urlopen(req, timeout=300) as resp:
            buffer = ""
            byte_buffer = b""
            while True:
                chunk = resp.read(4096)
                if not chunk:
                    # Decode any remaining bytes
                    if byte_buffer:
                        buffer += byte_buffer.decode("utf-8", errors="replace")
                    break
                byte_buffer += chunk
                # Try to decode as much as possible, keeping incomplete chars
                try:
                    decoded = byte_buffer.decode("utf-8")
                    byte_buffer = b""
                except UnicodeDecodeError:
                    # Find the last complete UTF-8 sequence
                    for i in range(1, 4):
                        try:
                            decoded = byte_buffer[:-i].decode("utf-8")
                            byte_buffer = byte_buffer[-i:]
                            break
                        except UnicodeDecodeError:
                            continue
                    else:
                        decoded = byte_buffer.decode("utf-8", errors="replace")
                        byte_buffer = b""
                buffer += decoded
                # Process SSE lines
                while "\n" in buffer:
                    line, buffer = buffer.split("\n", 1)
                    line = line.strip()
                    if line.startswith("data: "):
                        data_str = line[6:]
                        if data_str.strip() == "[DONE]":
                            break
                        try:
                            data = json.loads(data_str)
                            parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
                            for part in parts:
                                if "text" in part:
                                    full_text.append(part["text"])
                                    print(".", end="", file=sys.stderr, flush=True)
                        except (json.JSONDecodeError, IndexError, KeyError):
                            pass
        print("", file=sys.stderr)
        return "".join(full_text)
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        print(f"Gemini API Error {e.code}: {body}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error calling Gemini: {e}", file=sys.stderr)
        sys.exit(1)


def extract_code_blocks(response_text):
    """Extract code blocks from Gemini response. Returns dict of filename -> content."""
    files = {}

    # Pattern: ```filename or ```language:filename
    pattern = r'```(\S+?)?\s*\n(.*?)```'
    matches = re.findall(pattern, response_text, re.DOTALL)

    if not matches:
        # If no code blocks, treat entire response as HTML
        files["index.html"] = response_text
        return files

    html_count = 0
    css_count = 0
    js_count = 0

    for lang, content in matches:
        lang = lang.lower().strip() if lang else ""
        content = content.strip()

        if lang in ("html", "htm") or "<!DOCTYPE" in content or "<html" in content:
            filename = "index.html" if html_count == 0 else f"page_{html_count}.html"
            html_count += 1
            files[filename] = content
        elif lang == "css" or lang.endswith(".css"):
            filename = "styles.css" if css_count == 0 else f"styles_{css_count}.css"
            css_count += 1
            files[filename] = content
        elif lang in ("javascript", "js") or lang.endswith(".js"):
            filename = "script.js" if js_count == 0 else f"script_{js_count}.js"
            js_count += 1
            files[filename] = content
        elif "." in lang:
            # lang contains filename like "index.html"
            files[lang] = content
        else:
            # Default: treat as HTML if contains tags, else as JS
            if "<" in content and ">" in content:
                filename = "index.html" if html_count == 0 else f"page_{html_count}.html"
                html_count += 1
            else:
                filename = "script.js" if js_count == 0 else f"script_{js_count}.js"
                js_count += 1
            files[filename] = content

    return files


def build_system_prompt(multi_file=False):
    """Build the system prompt for Gemini."""
    if multi_file:
        return """You are an expert frontend web developer and UI/UX designer.
Generate a complete, production-quality web page based on the user's requirements.

Output separate code blocks for HTML, CSS, and JavaScript files:
- Use ```html for HTML code
- Use ```css for CSS code
- Use ```javascript for JavaScript code

Requirements:
- Modern, responsive design with clean aesthetics
- Mobile-first approach with proper media queries
- Semantic HTML5 structure
- Well-organized CSS with CSS variables for theming
- Vanilla JavaScript (no frameworks unless specifically requested)
- Smooth animations and transitions where appropriate
- Accessibility best practices (ARIA labels, keyboard navigation)
- Cross-browser compatibility

Do NOT include any explanatory text outside the code blocks. Only output code."""
    else:
        return """You are an expert frontend web developer and UI/UX designer.
Generate a complete, production-quality web page as a SINGLE HTML file based on the user's requirements.

Requirements:
- All CSS must be in <style> tags within the HTML
- All JavaScript must be in <script> tags within the HTML
- Modern, responsive design with clean aesthetics
- Mobile-first approach with proper media queries
- Semantic HTML5 structure
- CSS variables for theming
- Smooth animations and transitions where appropriate
- Accessibility best practices (ARIA labels, keyboard navigation)
- Cross-browser compatibility
- Use CDN links for any external libraries if needed (Tailwind, Font Awesome, etc.)

Output ONLY the complete HTML file wrapped in ```html code block. No explanatory text."""


def main():
    parser = argparse.ArgumentParser(description="Generate web pages using Gemini 3.1 Pro")
    parser.add_argument("--prompt", type=str, help="Description of the web page to generate")
    parser.add_argument("--prompt-file", type=str, help="File containing the prompt")
    parser.add_argument("--output", type=str, default=".", help="Output directory (default: current dir)")
    parser.add_argument("--multi", action="store_true", help="Generate separate HTML/CSS/JS files")
    parser.add_argument("--model", type=str, default=DEFAULT_MODEL, help=f"Gemini model (default: {DEFAULT_MODEL})")
    parser.add_argument("--raw", action="store_true", help="Print raw Gemini response without extracting files")

    args = parser.parse_args()

    # Get prompt
    if args.prompt_file:
        with open(args.prompt_file, "r", encoding="utf-8") as f:
            user_prompt = f.read().strip()
    elif args.prompt:
        user_prompt = args.prompt
    else:
        print("Error: Provide --prompt or --prompt-file", file=sys.stderr)
        sys.exit(1)

    # Load API key
    api_key = load_api_key()
    if not api_key:
        print("Error: GEMINIKEY not found. Set it in .env or environment.", file=sys.stderr)
        sys.exit(1)

    # Build full prompt
    system_prompt = build_system_prompt(args.multi)
    full_prompt = f"{system_prompt}\n\nUser request:\n{user_prompt}"

    print(f"Calling Gemini ({args.model})...", file=sys.stderr)
    response = call_gemini(api_key, full_prompt, args.model)

    if args.raw:
        print(response)
        return

    # Extract and save files
    files = extract_code_blocks(response)
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    for filename, content in files.items():
        filepath = output_dir / filename
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Created: {filepath}", file=sys.stderr)

    print(f"\nGenerated {len(files)} file(s) in {output_dir}", file=sys.stderr)

    # Print the main HTML file path for easy opening
    if "index.html" in files:
        print(str(output_dir / "index.html"))


if __name__ == "__main__":
    main()
