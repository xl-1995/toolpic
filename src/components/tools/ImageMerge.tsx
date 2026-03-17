'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import DropZone from '@/components/ui/DropZone';
import ProgressBar from '@/components/ui/ProgressBar';

type Direction = 'horizontal' | 'vertical';

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

export default function ImageMerge() {
  const t = useTranslations('common');
  const [files, setFiles] = useState<File[]>([]);
  const [direction, setDirection] = useState<Direction>('horizontal');
  const [gap, setGap] = useState(0);
  const [bgColor, setBgColor] = useState('#000000');
  const [result, setResult] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFiles = useCallback((newFiles: File[]) => {
    setFiles(newFiles);
    setResult(null);
    setPreviewUrl('');
    setProgress(0);
  }, []);

  const moveUp = (index: number) => {
    if (index <= 0) return;
    const newFiles = [...files];
    [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
    setFiles(newFiles);
  };

  const moveDown = (index: number) => {
    if (index >= files.length - 1) return;
    const newFiles = [...files];
    [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
    setFiles(newFiles);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const merge = useCallback(async () => {
    if (files.length < 2) return;
    setIsProcessing(true);
    setProgress(10);

    try {
      // Load all images
      const bitmaps = await Promise.all(files.map((f) => createImageBitmap(f)));
      setProgress(40);

      let totalWidth: number, totalHeight: number;

      if (direction === 'horizontal') {
        totalWidth = bitmaps.reduce((sum, bm) => sum + bm.width, 0) + gap * (bitmaps.length - 1);
        totalHeight = Math.max(...bitmaps.map((bm) => bm.height));
      } else {
        totalWidth = Math.max(...bitmaps.map((bm) => bm.width));
        totalHeight = bitmaps.reduce((sum, bm) => sum + bm.height, 0) + gap * (bitmaps.length - 1);
      }

      const canvas = new OffscreenCanvas(totalWidth, totalHeight);
      const ctx = canvas.getContext('2d')!;

      // Fill background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, totalWidth, totalHeight);

      setProgress(60);

      // Draw images
      let offset = 0;
      for (const bm of bitmaps) {
        if (direction === 'horizontal') {
          // Center vertically
          const y = (totalHeight - bm.height) / 2;
          ctx.drawImage(bm, offset, y);
          offset += bm.width + gap;
        } else {
          // Center horizontally
          const x = (totalWidth - bm.width) / 2;
          ctx.drawImage(bm, x, offset);
          offset += bm.height + gap;
        }
      }

      setProgress(80);

      const blob = await canvas.convertToBlob({ type: 'image/png' });
      setResult(blob);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(blob));
      setProgress(100);
    } catch {
      // error
    }

    setIsProcessing(false);
  }, [files, direction, gap, bgColor, previewUrl]);

  const download = () => {
    if (!result) return;
    const url = URL.createObjectURL(result);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'merged-image.png';
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFiles([]);
    setResult(null);
    setPreviewUrl('');
    setProgress(0);
  };

  if (files.length === 0) {
    return <DropZone accept="image/*" onFiles={handleFiles} />;
  }

  return (
    <div className="space-y-6">
      {/* Layout Options */}
      <div className="flex flex-wrap items-center gap-6">
        <div>
          <label className="font-medium block mb-3">Layout</label>
          <div className="flex gap-2">
            {(['horizontal', 'vertical'] as Direction[]).map((d) => (
              <button
                key={d}
                onClick={() => setDirection(d)}
                disabled={isProcessing}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  direction === d
                    ? 'btn-primary'
                    : 'bg-black/20 text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-text)]'
                }`}
              >
                <i className={`fas fa-${d === 'horizontal' ? 'arrows-left-right' : 'arrows-up-down'} mr-2`}></i>
                {d === 'horizontal' ? 'Horizontal' : 'Vertical'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="font-medium block mb-2">Gap: {gap}px</label>
          <input
            type="range"
            min="0"
            max="100"
            value={gap}
            onChange={(e) => setGap(parseInt(e.target.value))}
            className="w-40"
            disabled={isProcessing}
          />
        </div>
        <div>
          <label className="font-medium block mb-2">Background</label>
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="w-10 h-10 rounded cursor-pointer bg-transparent border-none"
            disabled={isProcessing}
          />
        </div>
      </div>

      {/* File list with reorder */}
      <div className="space-y-2">
        <p className="text-sm text-[var(--color-text-muted)]">{t('fileCount', { count: files.length })}</p>
        {files.map((f, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-black/20">
            <div className="flex flex-col gap-1">
              <button
                onClick={() => moveUp(i)}
                disabled={i === 0 || isProcessing}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] disabled:opacity-30"
              >
                <i className="fas fa-chevron-up"></i>
              </button>
              <button
                onClick={() => moveDown(i)}
                disabled={i === files.length - 1 || isProcessing}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] disabled:opacity-30"
              >
                <i className="fas fa-chevron-down"></i>
              </button>
            </div>
            <span className="text-sm text-[var(--color-text-dim)] w-6 text-center">{i + 1}</span>
            <i className="fa-regular fa-file-image text-[var(--color-text-muted)]"></i>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{f.name}</p>
              <span className="text-xs text-[var(--color-text-muted)]">{formatSize(f.size)}</span>
            </div>
            <button
              onClick={() => removeFile(i)}
              disabled={isProcessing}
              className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors"
            >
              <i className="fas fa-xmark"></i>
            </button>
          </div>
        ))}
      </div>

      {/* Progress */}
      {isProcessing && (
        <ProgressBar progress={progress} />
      )}

      {/* Preview */}
      {previewUrl && (
        <div>
          <p className="text-sm text-[var(--color-text-muted)] mb-2">Preview:</p>
          <img src={previewUrl} className="max-w-full max-h-[400px] rounded-lg mx-auto" alt="Merged result" />
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        {!isProcessing && !result && files.length >= 2 && (
          <button
            onClick={merge}
            className="btn-primary px-8 py-3 rounded-xl font-semibold"
          >
            {t('start')}
          </button>
        )}
        {result && (
          <button
            onClick={download}
            className="px-8 py-3 rounded-xl bg-[var(--color-success)] hover:bg-[#16a34a] text-white font-semibold transition-colors"
          >
            <i className="fas fa-download mr-2"></i>
            {t('download')}
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
