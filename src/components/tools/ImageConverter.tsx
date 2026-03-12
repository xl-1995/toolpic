'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import DropZone from '@/components/ui/DropZone';
import ProgressBar from '@/components/ui/ProgressBar';

type OutputFormat = 'image/jpeg' | 'image/png' | 'image/webp';

const formats: { value: OutputFormat; label: string; ext: string }[] = [
  { value: 'image/jpeg', label: 'JPEG', ext: 'jpg' },
  { value: 'image/png', label: 'PNG', ext: 'png' },
  { value: 'image/webp', label: 'WebP', ext: 'webp' },
];

interface FileResult {
  original: File;
  converted: Blob | null;
  progress: number;
  error?: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

export default function ImageConverter() {
  const t = useTranslations('common');
  const [files, setFiles] = useState<FileResult[]>([]);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('image/png');
  const [quality, setQuality] = useState(0.92);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFiles = useCallback((newFiles: File[]) => {
    setFiles(newFiles.map((f) => ({ original: f, converted: null, progress: 0 })));
  }, []);

  const convert = useCallback(async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    const updated = [...files];
    for (let i = 0; i < updated.length; i++) {
      try {
        updated[i] = { ...updated[i], progress: 30 };
        setFiles([...updated]);

        const bitmap = await createImageBitmap(updated[i].original);
        const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(bitmap, 0, 0);

        updated[i] = { ...updated[i], progress: 60 };
        setFiles([...updated]);

        const blob = await canvas.convertToBlob({ type: outputFormat, quality });
        updated[i] = { ...updated[i], converted: blob, progress: 100 };
        setFiles([...updated]);
      } catch {
        updated[i] = { ...updated[i], error: 'Conversion failed', progress: 0 };
        setFiles([...updated]);
      }
    }
    setIsProcessing(false);
  }, [files, outputFormat, quality]);

  const downloadOne = (result: FileResult) => {
    if (!result.converted) return;
    const ext = formats.find((f) => f.value === outputFormat)?.ext || 'png';
    const name = result.original.name.replace(/\.[^/.]+$/, '') + '.' + ext;
    const url = URL.createObjectURL(result.converted);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => files.forEach((f) => f.converted && downloadOne(f));

  const reset = () => {
    setFiles([]);
    setIsProcessing(false);
  };

  if (files.length === 0) {
    return <DropZone accept="image/*" onFiles={handleFiles} />;
  }

  return (
    <div className="space-y-6">
      {/* Format and Quality */}
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">{t('format')}:</label>
          <div className="flex gap-2">
            {formats.map((f) => (
              <button
                key={f.value}
                onClick={() => setOutputFormat(f.value)}
                disabled={isProcessing}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  outputFormat === f.value
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-white/5 text-[var(--color-text-muted)] hover:bg-white/10'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        {outputFormat !== 'image/png' && (
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">{t('quality')}: {Math.round(quality * 100)}%</label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={quality}
              onChange={(e) => setQuality(parseFloat(e.target.value))}
              className="w-32 accent-[var(--color-primary)]"
              disabled={isProcessing}
            />
          </div>
        )}
      </div>

      {/* File list */}
      <div className="space-y-3">
        {files.map((f, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
            <i className="fas fa-image text-[var(--color-primary)]"></i>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{f.original.name}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                {formatSize(f.original.size)}
                {f.converted && ` → ${formatSize(f.converted.size)}`}
              </p>
              {f.progress > 0 && f.progress < 100 && <ProgressBar progress={f.progress} />}
              {f.error && <p className="text-xs text-[var(--color-error)] mt-1">{f.error}</p>}
            </div>
            {f.converted && (
              <button onClick={() => downloadOne(f)} className="text-[var(--color-primary)]">
                <i className="fas fa-download"></i>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        {!isProcessing && files.some((f) => !f.converted) && (
          <button onClick={convert} className="px-6 py-2.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium transition-colors">
            {t('start')}
          </button>
        )}
        {files.some((f) => f.converted) && (
          <button onClick={downloadAll} className="px-6 py-2.5 rounded-xl bg-[var(--color-success)] hover:opacity-90 text-white font-medium transition-colors">
            {t('downloadAll')}
          </button>
        )}
        <button onClick={reset} className="px-6 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-white font-medium transition-colors">
          {t('reset')}
        </button>
      </div>
    </div>
  );
}
