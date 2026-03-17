'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import DropZone from '@/components/ui/DropZone';
import ProgressBar from '@/components/ui/ProgressBar';
import { getFFmpeg, formatSize } from '@/lib/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

export default function VideoToGif() {
  const t = useTranslations('common');
  const [file, setFile] = useState<File | null>(null);
  const [fps, setFps] = useState(10);
  const [width, setWidth] = useState(480);
  const [startTime, setStartTime] = useState(0);
  const [duration, setDuration] = useState(5);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');
  const [result, setResult] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');

  const handleFiles = useCallback((files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setResult(null);
      setPreviewUrl('');
      setError('');
      setProgress(0);
    }
  }, []);

  const convert = useCallback(async () => {
    if (!file) return;
    setIsProcessing(true);
    setStatusMsg('Loading FFmpeg...');
    setProgress(5);
    setError('');

    try {
      const ffmpeg = await getFFmpeg();
      setStatusMsg('Reading file...');
      setProgress(15);

      const inputExt = file.name.substring(file.name.lastIndexOf('.'));
      const inputName = 'input' + inputExt;
      const outputName = 'output.gif';

      await ffmpeg.writeFile(inputName, await fetchFile(file));

      setStatusMsg('Converting to GIF...');
      setProgress(25);

      ffmpeg.on('progress', ({ progress: p }) => {
        setProgress(25 + Math.round(p * 65));
      });

      // Two-pass for better quality: first generate palette, then use it
      const paletteFilter = `fps=${fps},scale=${width}:-1:flags=lanczos,palettegen=stats_mode=diff`;
      const gifFilter = `fps=${fps},scale=${width}:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5`;

      // Generate palette
      await ffmpeg.exec([
        '-ss', String(startTime),
        '-t', String(duration),
        '-i', inputName,
        '-vf', paletteFilter,
        '-y', 'palette.png',
      ]);

      setProgress(55);
      setStatusMsg('Creating GIF with palette...');

      // Generate GIF with palette
      await ffmpeg.exec([
        '-ss', String(startTime),
        '-t', String(duration),
        '-i', inputName,
        '-i', 'palette.png',
        '-lavfi', gifFilter,
        '-y', outputName,
      ]);

      setStatusMsg('Finalizing...');
      setProgress(95);

      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data as BlobPart], { type: 'image/gif' });
      setResult(blob);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(blob));
      setProgress(100);
      setStatusMsg('');

      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
      try { await ffmpeg.deleteFile('palette.png'); } catch { /* ok */ }
    } catch (e) {
      setError(t('error'));
      console.error(e);
    }

    setIsProcessing(false);
  }, [file, fps, width, startTime, duration, t, previewUrl]);

  const download = () => {
    if (!result || !file) return;
    const url = URL.createObjectURL(result);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.name.replace(/\.[^/.]+$/, '')}.gif`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setResult(null);
    setPreviewUrl('');
    setError('');
    setProgress(0);
    setStatusMsg('');
    setIsProcessing(false);
  };

  if (!file) {
    return <DropZone accept="video/*" multiple={false} maxSize={200} onFiles={handleFiles} />;
  }

  return (
    <div className="space-y-6">
      {/* File info */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-black/20">
        <i className="fa-regular fa-file-video text-xl text-[var(--color-text-muted)]"></i>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{file.name}</p>
          <span className="text-sm text-[var(--color-text-muted)]">{formatSize(file.size)}</span>
          {result && (
            <span className="text-sm text-[var(--color-text-muted)] ml-4">
              <i className="fas fa-arrow-right-long text-xs mr-1"></i>
              GIF: {formatSize(result.size)}
            </span>
          )}
        </div>
      </div>

      {/* Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="font-medium">FPS</label>
            <span className="text-[var(--color-text-muted)]">{fps}</span>
          </div>
          <input
            type="range"
            min="5"
            max="30"
            value={fps}
            onChange={(e) => setFps(parseInt(e.target.value))}
            disabled={isProcessing}
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="font-medium">{t('width')}</label>
            <span className="text-[var(--color-text-muted)]">{width}px</span>
          </div>
          <input
            type="range"
            min="160"
            max="1280"
            step="20"
            value={width}
            onChange={(e) => setWidth(parseInt(e.target.value))}
            disabled={isProcessing}
          />
        </div>
        <div>
          <label className="font-medium block mb-2">Start Time (seconds)</label>
          <input
            type="number"
            min="0"
            step="0.5"
            value={startTime}
            onChange={(e) => setStartTime(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-4 py-2 rounded-lg bg-black/30 border border-[var(--color-border-hover)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-purple)]"
            disabled={isProcessing}
          />
        </div>
        <div>
          <label className="font-medium block mb-2">Duration (seconds)</label>
          <input
            type="number"
            min="0.5"
            max="30"
            step="0.5"
            value={duration}
            onChange={(e) => setDuration(Math.max(0.5, Math.min(30, parseFloat(e.target.value) || 5)))}
            className="w-full px-4 py-2 rounded-lg bg-black/30 border border-[var(--color-border-hover)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-purple)]"
            disabled={isProcessing}
          />
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

      {error && <p className="text-sm text-[var(--color-error)] text-center">{error}</p>}

      {/* GIF Preview */}
      {previewUrl && (
        <div className="text-center">
          <p className="text-sm text-[var(--color-text-muted)] mb-2">Preview:</p>
          <img src={previewUrl} className="max-w-full max-h-[400px] rounded-lg mx-auto" alt="GIF preview" />
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        {!isProcessing && !result && (
          <button
            onClick={convert}
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
