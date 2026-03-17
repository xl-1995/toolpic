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
    <div className="space-y-8">
      {/* Format and Quality */}
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-3">
          <label className="font-medium">{t('format')}:</label>
          <div className="flex gap-2">
            {formats.map((f) => (
              <button
                key={f.value}
                onClick={() => setOutputFormat(f.value)}
                disabled={isProcessing}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  outputFormat === f.value
                    ? 'btn-primary'
                    : 'bg-black/20 text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-text)]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        {outputFormat !== 'image/png' && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-medium">{t('quality')}</label>
              <span className="text-[var(--color-text-muted)]">{Math.round(quality * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={quality}
              onChange={(e) => setQuality(parseFloat(e.target.value))}
              className="w-40"
              disabled={isProcessing}
            />
          </div>
        )}
      </div>

      {/* File list */}
      <div className="space-y-3">
        {files.map((f, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-black/20">
            <i className="fa-regular fa-file-image text-xl text-[var(--color-text-muted)]"></i>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{f.original.name}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--color-text-muted)] mt-1">
                <span>{formatSize(f.original.size)}</span>
                {f.converted && (
                  <span className="flex items-center gap-1">
                    <i className="fas fa-arrow-right-long text-xs"></i>
                    {formatSize(f.converted.size)}
                  </span>
                )}
              </div>
              {f.progress > 0 && f.progress < 100 && (
                <div className="mt-2">
                  <ProgressBar progress={f.progress} />
                </div>
              )}
              {f.error && <p className="text-sm text-[var(--color-error)] mt-1">{f.error}</p>}
            </div>
            {f.converted && (
              <button
                onClick={() => downloadOne(f)}
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
        {!isProcessing && files.some((f) => !f.converted) && (
          <button
            onClick={convert}
            className="btn-primary px-8 py-3 rounded-xl font-semibold"
          >
            {t('start')}
          </button>
        )}
        {files.some((f) => f.converted) && (
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
