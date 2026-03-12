#!/usr/bin/env python3
"""
Nano Banana Pro (Gemini 3 Pro Image) - AI Image Generator
Uses Google Gemini API to generate images from text prompts.
"""

import argparse
import base64
import json
import os
import sys
from pathlib import Path


def find_api_key():
    """Find GEMINIKEY from .env files or environment."""
    if os.environ.get("GEMINIKEY"):
        return os.environ["GEMINIKEY"]

    for search_dir in [Path.cwd(), Path.cwd().parent, Path(__file__).parent.parent.parent.parent]:
        env_file = search_dir / ".env"
        if env_file.exists():
            with open(env_file, "r") as f:
                for line in f:
                    line = line.strip()
                    if line.startswith("GEMINIKEY="):
                        return line.split("=", 1)[1].strip().strip('"').strip("'")
    return None


def generate_image(prompt, output_path, aspect_ratio="16:9", image_size="2K", model="gemini-3-pro-image-preview"):
    """Generate an image using Nano Banana Pro API."""
    import urllib.request
    import urllib.error

    api_key = find_api_key()
    if not api_key:
        print("Error: GEMINIKEY not found. Set it in .env or environment.", file=sys.stderr)
        sys.exit(1)

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseModalities": ["IMAGE"],
            "imageConfig": {
                "aspectRatio": aspect_ratio,
                "imageSize": image_size
            }
        }
    }

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})

    print(f"Generating image with {model}...")
    print(f"  Prompt: {prompt[:100]}{'...' if len(prompt) > 100 else ''}")
    print(f"  Aspect Ratio: {aspect_ratio}")
    print(f"  Size: {image_size}")

    try:
        with urllib.request.urlopen(req, timeout=120) as response:
            result = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        print(f"API Error {e.code}: {error_body}", file=sys.stderr)
        sys.exit(1)

    # Extract image from response
    candidates = result.get("candidates", [])
    if not candidates:
        print("Error: No candidates in response.", file=sys.stderr)
        print(json.dumps(result, indent=2, ensure_ascii=False), file=sys.stderr)
        sys.exit(1)

    parts = candidates[0].get("content", {}).get("parts", [])
    image_saved = False

    for part in parts:
        if "inlineData" in part:
            image_data = base64.b64decode(part["inlineData"]["data"])
            mime_type = part["inlineData"].get("mimeType", "image/png")

            # Determine extension
            ext_map = {"image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".webp"}
            ext = ext_map.get(mime_type, ".png")

            # Ensure output path has correct extension
            out = Path(output_path)
            if not out.suffix:
                out = out.with_suffix(ext)

            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_bytes(image_data)
            print(f"Image saved: {out} ({len(image_data)} bytes)")
            image_saved = True
            break
        elif "text" in part:
            print(f"Model text: {part['text']}")

    if not image_saved:
        print("Error: No image data in response.", file=sys.stderr)
        sys.exit(1)

    return str(out)


def main():
    parser = argparse.ArgumentParser(description="Generate images with Nano Banana Pro (Gemini 3 Pro Image)")
    parser.add_argument("--prompt", "-p", required=True, help="Text prompt for image generation")
    parser.add_argument("--output", "-o", required=True, help="Output file path")
    parser.add_argument("--aspect-ratio", "-a", default="16:9",
                        choices=["1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9"],
                        help="Aspect ratio (default: 16:9)")
    parser.add_argument("--size", "-s", default="2K", choices=["1K", "2K", "4K"],
                        help="Image resolution (default: 2K)")
    parser.add_argument("--model", "-m", default="gemini-3-pro-image-preview",
                        help="Model ID (default: gemini-3-pro-image-preview)")

    args = parser.parse_args()
    generate_image(args.prompt, args.output, args.aspect_ratio, args.size, args.model)


if __name__ == "__main__":
    main()
