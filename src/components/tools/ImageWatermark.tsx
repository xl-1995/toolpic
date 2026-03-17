'use client';

import { useState, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import DropZone from '@/components/ui/DropZone';

type Position = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'tiled';

const POSITIONS: { value: Position; label: string }[] = [
  { value: 'center', label: 'Center' },
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'tiled', label: 'Tiled' },
];

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

export default function ImageWatermark() {
  const t = useTranslations('common');
  const [files, setFiles] = useState<File[]>([]);
  const [text, setText] = useState('ToolPic');
  const [fontSize, setFontSize] = useState(36);
  const [color, setColor] = useState('#ffffff');
  const [opacity, setOpacity] = useState(0.5);
  const [position, setPosition] = useState<Position>('bottom-right');
  const [results, setResults] = useState<(Blob | null)[]>([]);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFiles = useCallback((newFiles: File[]) => {
    setFiles(newFiles);
    setResults([]);
    setPreviewUrl('');
  }, []);

  const drawWatermark = (
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return { r, g, b };
    };

    const rgb = hexToRgb(color);
    ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    ctx.textBaseline = 'middle';

    const padding = fontSize;

    if (position === 'tiled') {
      ctx.textAlign = 'center';
      const spacingX = fontSize * 8;
      const spacingY = fontSize * 4;
      // Save and rotate for diagonal tiling
      ctx.save();
      ctx.rotate(-Math.PI / 6);
      for (let y = -height; y < height * 2; y += spacingY) {
        for (let x = -width; x < width * 2; x += spacingX) {
          ctx.fillText(text, x, y);
        }
      }
      ctx.restore();
    } else {
      let x: number, y: number;
      switch (position) {
        case 'center':
          ctx.textAlign = 'center';
          x = width / 2;
          y = height / 2;
          break;
        case 'top-left':
          ctx.textAlign = 'left';
          x = padding;
          y = padding + fontSize / 2;
          break;
        case 'top-right':
          ctx.textAlign = 'right';
          x = width - padding;
          y = padding + fontSize / 2;
          break;
        case 'bottom-left':
          ctx.textAlign = 'left';
          x = padding;
          y = height - padding - fontSize / 2;
          break;
        case 'bottom-right':
        default:
          ctx.textAlign = 'right';
          x = width - padding;
          y = height - padding - fontSize / 2;
          break;
      }
      ctx.fillText(text, x, y);
    }
  };

  const process = useCallback(async () => {
    if (files.length === 0 || !text.trim()) return;
    setIsProcessing(true);
    const output: (Blob | null)[] = [];

    for (const file of files) {
      try {
        const bitmap = await createImageBitmap(file);
        const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(bitmap, 0, 0);
        drawWatermark(ctx as unknown as CanvasRenderingContext2D, bitmap.width, bitmap.height);
        const blob = await canvas.convertToBlob({ type: 'image/png' });
        output.push(blob);
      } catch {
        output.push(null);
      }
    }

    setResults(output);

    // Generate preview of first result
    if (output[0]) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(output[0]));
    }

    setIsProcessing(false);
  }, [files, text, fontSize, color, opacity, position]);

  const generatePreview = useCallback(async () => {
    if (files.length === 0 || !text.trim()) return;
    try {
      const bitmap = await createImageBitmap(files[0]);
      // Use a smaller canvas for preview
      const scale = Math.min(1, 600 / Math.max(bitmap.width, bitmap.height));
      const w = bitmap.width * scale;
      const h = bitmap.height * scale;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(bitmap, 0, 0, w, h);
      // Scale font size for preview
      const scaledFontSize = fontSize * scale;
      const rgb = hexToRgb(color);
      ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
      ctx.font = `bold ${scaledFontSize}px Arial, sans-serif`;
      ctx.textBaseline = 'middle';
      const padding = scaledFontSize;

      if (position === 'tiled') {
        ctx.textAlign = 'center';
        const spacingX = scaledFontSize * 8;
        const spacingY = scaledFontSize * 4;
        ctx.save();
        ctx.rotate(-Math.PI / 6);
        for (let y = -h; y < h * 2; y += spacingY) {
          for (let x = -w; x < w * 2; x += spacingX) {
            ctx.fillText(text, x, y);
          }
        }
        ctx.restore();
      } else {
        let px: number, py: number;
        switch (position) {
          case 'center':
            ctx.textAlign = 'center'; px = w / 2; py = h / 2; break;
          case 'top-left':
            ctx.textAlign = 'left'; px = padding; py = padding + scaledFontSize / 2; break;
          case 'top-right':
            ctx.textAlign = 'right'; px = w - padding; py = padding + scaledFontSize / 2; break;
          case 'bottom-left':
            ctx.textAlign = 'left'; px = padding; py = h - padding - scaledFontSize / 2; break;
          default:
            ctx.textAlign = 'right'; px = w - padding; py = h - padding - scaledFontSize / 2; break;
        }
        ctx.fillText(text, px, py);
      }

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(canvas.toDataURL('image/png'));
    } catch {
      // ignore preview errors
    }
  }, [files, text, fontSize, color, opacity, position]);

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };

  const downloadOne = (blob: Blob, originalName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `watermarked-${originalName.replace(/\.[^/.]+$/, '')}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    results.forEach((blob, i) => {
      if (blob) downloadOne(blob, files[i].name);
    });
  };

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFiles([]);
    setResults([]);
    setPreviewUrl('');
  };

  if (files.length === 0) {
    return <DropZone accept="image/*" onFiles={handleFiles} />;
  }

  return (
    <div className="space-y-6">
      {/* Watermark Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="font-medium block mb-2">Watermark Text</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-black/30 border border-[var(--color-border-hover)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-purple)]"
            disabled={isProcessing}
          />
        </div>
        <div>
          <label className="font-medium block mb-2">Font Size: {fontSize}px</label>
          <input
            type="range"
            min="12"
            max="120"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
            disabled={isProcessing}
          />
        </div>
        <div>
          <label className="font-medium block mb-2">Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer bg-transparent border-none"
              disabled={isProcessing}
            />
            <span className="text-sm text-[var(--color-text-muted)]">{color}</span>
          </div>
        </div>
        <div>
          <label className="font-medium block mb-2">Opacity: {Math.round(opacity * 100)}%</label>
          <input
            type="range"
            min="0.05"
            max="1"
            step="0.05"
            value={opacity}
            onChange={(e) => setOpacity(parseFloat(e.target.value))}
            disabled={isProcessing}
          />
        </div>
      </div>

      {/* Position */}
      <div>
        <label className="font-medium block mb-3">Position</label>
        <div className="flex flex-wrap gap-2">
          {POSITIONS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPosition(p.value)}
              disabled={isProcessing}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                position === p.value
                  ? 'btn-primary'
                  : 'bg-black/20 text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-text)]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Preview button */}
      <div className="flex justify-center">
        <button
          onClick={generatePreview}
          className="px-6 py-2 rounded-lg border border-[var(--color-border-hover)] text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-white/5 transition-all"
        >
          <i className="fas fa-eye mr-2"></i>
          Preview
        </button>
      </div>

      {/* Preview */}
      {previewUrl && (
        <div>
          <p className="text-sm text-[var(--color-text-muted)] mb-2">Preview:</p>
          <img src={previewUrl} className="max-w-full max-h-[400px] rounded-lg mx-auto" alt="Watermark preview" />
        </div>
      )}

      {/* File list */}
      <div className="space-y-3">
        {files.map((f, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-black/20">
            <i className="fa-regular fa-file-image text-xl text-[var(--color-text-muted)]"></i>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{f.name}</p>
              <span className="text-sm text-[var(--color-text-muted)]">{formatSize(f.size)}</span>
            </div>
            {results[i] && (
              <button
                onClick={() => downloadOne(results[i]!, f.name)}
                className="px-3 py-1.5 rounded-lg border border-[var(--color-border-hover)] text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-white/5 transition-all"
              >
                <i className="fas fa-download"></i>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        {!isProcessing && results.length === 0 && (
          <button
            onClick={process}
            className="btn-primary px-8 py-3 rounded-xl font-semibold"
          >
            {t('start')}
          </button>
        )}
        {results.some((r) => r !== null) && (
          <button
            onClick={downloadAll}
            className="px-8 py-3 rounded-xl bg-[var(--color-success)] hover:bg-[#16a34a] text-white font-semibold transition-colors"
          >
            <i className="fas fa-download mr-2"></i>
            {t('downloadAll')}
          </button>
        )}
        <button
          onClick={reset}
          className="px-8 py-3 rounded-xl border border-[var(--color-border-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-white/5 font-semibold transition-all"
        >
          <i className="fas fa-arrow-rotate-left mr-2"></i>
          {t('reset')}
        </button>
      </div>
    </div>
  );
}
