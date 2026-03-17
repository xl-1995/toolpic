'use client';

import { useState, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import DropZone from '@/components/ui/DropZone';
import ProgressBar from '@/components/ui/ProgressBar';
import { getFFmpeg, formatSize } from '@/lib/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

type Preset = 'light' | 'medium' | 'heavy';

const PRESETS: { value: Preset; label: string; crf: number; scale: string }[] = [
  { value: 'light', label: 'Light (Better Quality)', crf: 28, scale: '' },
  { value: 'medium', label: 'Medium (Balanced)', crf: 32, scale: '1280:-2' },
  { value: 'heavy', label: 'Heavy (Smaller Size)', crf: 36, scale: '854:-2' },
];

export default function VideoCompress() {
  const t = useTranslations('common');
  const [file, setFile] = useState<File | null>(null);
  const [preset, setPreset] = useState<Preset>('medium');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState('');

  const handleFiles = useCallback((files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setResult(null);
      setError('');
      setProgress(0);
    }
  }, []);

  const compress = useCallback(async () => {
    if (!file) return;
    setIsProcessing(true);
    setIsLoading(true);
    setStatusMsg('Loading FFmpeg...');
    setProgress(5);
    setError('');

    try {
      const ffmpeg = await getFFmpeg((msg) => {
        // Try to parse progress from FFmpeg log
        const timeMatch = msg.match(/time=(\d{2}):(\d{2}):(\d{2})/);
        if (timeMatch) {
          setStatusMsg(`Encoding: ${timeMatch[0]}`);
        }
      });

      setIsLoading(false);
      setStatusMsg('Reading file...');
      setProgress(15);

      const inputName = 'input' + file.name.substring(file.name.lastIndexOf('.'));
      const outputName = 'output.mp4';

      await ffmpeg.writeFile(inputName, await fetchFile(file));

      setStatusMsg('Compressing video...');
      setProgress(25);

      const p = PRESETS.find((pr) => pr.value === preset)!;
      const args = ['-i', inputName, '-c:v', 'libx264', '-crf', String(p.crf), '-preset', 'fast'];

      if (p.scale) {
        args.push('-vf', `scale=${p.scale}`);
      }

      args.push('-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', outputName);

      // Set up progress callback
      ffmpeg.on('progress', ({ progress: p }) => {
        setProgress(25 + Math.round(p * 65));
      });

      await ffmpeg.exec(args);

      setStatusMsg('Finalizing...');
      setProgress(95);

      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data as BlobPart], { type: 'video/mp4' });
      setResult(blob);
      setProgress(100);
      setStatusMsg('');

      // Cleanup
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
    } catch (e) {
      setError(t('error'));
      console.error(e);
    }

    setIsProcessing(false);
  }, [file, preset, t]);

  const download = () => {
    if (!result || !file) return;
    const url = URL.createObjectURL(result);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compressed-${file.name.replace(/\.[^/.]+$/, '')}.mp4`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError('');
    setProgress(0);
    setStatusMsg('');
    setIsProcessing(false);
  };

  if (!file) {
    return <DropZone accept="video/*" multiple={false} maxSize={500} onFiles={handleFiles} />;
  }

  return (
    <div className="space-y-6">
      {/* File info */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-black/20">
        <i className="fa-regular fa-file-video text-xl text-[var(--color-text-muted)]"></i>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{file.name}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--color-text-muted)] mt-1">
            <span>{t('originalSize', { size: formatSize(file.size) })}</span>
            {result && (
              <>
                <span className="flex items-center gap-1">
                  <i className="fas fa-arrow-right-long text-xs"></i>
                  {t('newSize', { size: formatSize(result.size) })}
                </span>
                <span className="text-[var(--color-success)] font-semibold">
                  {t('savedPercent', {
                    percent: Math.round((1 - result.size / file.size) * 100),
                  })}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Compression Preset */}
      <div>
        <label className="font-medium block mb-3">Compression Level</label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPreset(p.value)}
              disabled={isProcessing}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                preset === p.value
                  ? 'btn-primary'
                  : 'bg-black/20 text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-text)]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Progress */}
      {isProcessing && (
        <div className="space-y-2">
          <ProgressBar progress={progress} />
          {statusMsg && (
            <p className="text-sm text-[var(--color-text-muted)] text-center">{statusMsg}</p>
          )}
        </div>
      )}

      {/* Error */}
      {error && <p className="text-sm text-[var(--color-error)] text-center">{error}</p>}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        {!isProcessing && !result && (
          <button
            onClick={compress}
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
          disabled={isProcessing}
          className="px-8 py-3 rounded-xl border border-[var(--color-border-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-white/5 font-semibold transition-all disabled:opacity-40"
        >
          <i className="fas fa-arrow-rotate-left mr-2"></i>
          {t('reset')}
        </button>
      </div>
    </div>
  );
}
