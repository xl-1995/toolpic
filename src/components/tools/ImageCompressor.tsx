'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import DropZone from '@/components/ui/DropZone';
import ProgressBar from '@/components/ui/ProgressBar';

interface FileResult {
  original: File;
  compressed: Blob | null;
  progress: number;
  error?: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

export default function ImageCompressor() {
  const t = useTranslations('common');
  const [files, setFiles] = useState<FileResult[]>([]);
  const [quality, setQuality] = useState(0.8);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFiles = useCallback((newFiles: File[]) => {
    setFiles(newFiles.map((f) => ({ original: f, compressed: null, progress: 0 })));
  }, []);

  const compress = useCallback(async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    const imageCompression = (await import('browser-image-compression')).default;

    const updated = [...files];
    for (let i = 0; i < updated.length; i++) {
      try {
        updated[i] = { ...updated[i], progress: 10 };
        setFiles([...updated]);

        const compressed = await imageCompression(updated[i].original, {
          maxSizeMB: updated[i].original.size / (1024 * 1024) * quality,
          maxWidthOrHeight: 4096,
          useWebWorker: true,
          onProgress: (p: number) => {
            updated[i] = { ...updated[i], progress: p };
            setFiles([...updated]);
          },
        });

        updated[i] = { ...updated[i], compressed, progress: 100 };
        setFiles([...updated]);
      } catch {
        updated[i] = { ...updated[i], error: 'Failed to compress', progress: 0 };
        setFiles([...updated]);
      }
    }
    setIsProcessing(false);
  }, [files, quality]);

  const downloadOne = (result: FileResult) => {
    if (!result.compressed) return;
    const url = URL.createObjectURL(result.compressed);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compressed-${result.original.name}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    files.forEach((f) => {
      if (f.compressed) downloadOne(f);
    });
  };

  const reset = () => {
    setFiles([]);
    setIsProcessing(false);
  };

  if (files.length === 0) {
    return <DropZone accept="image/*" onFiles={handleFiles} />;
  }

  return (
    <div className="space-y-8">
      {/* Quality Slider */}
      <div>
        <div className="flex justify-between items-center mb-3">
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
          disabled={isProcessing}
        />
      </div>

      {/* File List */}
      <div className="space-y-3">
        {files.map((f, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-black/20">
            <i className="fa-regular fa-file-image text-xl text-[var(--color-text-muted)]"></i>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{f.original.name}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--color-text-muted)] mt-1">
                <span>{t('originalSize', { size: formatSize(f.original.size) })}</span>
                {f.compressed && (
                  <>
                    <span className="flex items-center gap-1">
                      <i className="fas fa-arrow-right-long text-xs"></i>
                      {t('newSize', { size: formatSize(f.compressed.size) })}
                    </span>
                    <span className="text-[var(--color-success)] font-semibold">
                      {t('savedPercent', {
                        percent: Math.round((1 - f.compressed.size / f.original.size) * 100),
                      })}
                    </span>
                  </>
                )}
              </div>
              {f.progress > 0 && f.progress < 100 && (
                <div className="mt-2">
                  <ProgressBar progress={f.progress} />
                </div>
              )}
              {f.error && <p className="text-sm text-[var(--color-error)] mt-1">{f.error}</p>}
            </div>
            {f.compressed && (
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
        {!isProcessing && files.some((f) => !f.compressed) && (
          <button
            onClick={compress}
            className="btn-primary px-8 py-3 rounded-xl font-semibold"
          >
            {t('start')}
          </button>
        )}
        {files.some((f) => f.compressed) && (
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
