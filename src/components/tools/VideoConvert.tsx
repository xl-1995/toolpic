'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import DropZone from '@/components/ui/DropZone';
import ProgressBar from '@/components/ui/ProgressBar';
import { getFFmpeg, formatSize } from '@/lib/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

const OUTPUT_FORMATS = [
  { value: 'mp4', label: 'MP4', mime: 'video/mp4' },
  { value: 'webm', label: 'WebM', mime: 'video/webm' },
  { value: 'avi', label: 'AVI', mime: 'video/x-msvideo' },
];

export default function VideoConvert() {
  const t = useTranslations('common');
  const [file, setFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState('mp4');
  const [isProcessing, setIsProcessing] = useState(false);
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
      const outputName = `output.${outputFormat}`;

      await ffmpeg.writeFile(inputName, await fetchFile(file));

      setStatusMsg('Converting video...');
      setProgress(25);

      ffmpeg.on('progress', ({ progress: p }) => {
        setProgress(25 + Math.round(p * 65));
      });

      let args: string[];
      if (outputFormat === 'webm') {
        args = ['-i', inputName, '-c:v', 'libvpx', '-crf', '30', '-b:v', '0', '-c:a', 'libvorbis', outputName];
      } else if (outputFormat === 'avi') {
        args = ['-i', inputName, '-c:v', 'mpeg4', '-q:v', '6', '-c:a', 'mp3', outputName];
      } else {
        args = ['-i', inputName, '-c:v', 'libx264', '-crf', '23', '-preset', 'fast', '-c:a', 'aac', '-movflags', '+faststart', outputName];
      }

      await ffmpeg.exec(args);

      setStatusMsg('Finalizing...');
      setProgress(95);

      const data = await ffmpeg.readFile(outputName);
      const fmt = OUTPUT_FORMATS.find((f) => f.value === outputFormat)!;
      const blob = new Blob([data as BlobPart], { type: fmt.mime });
      setResult(blob);
      setProgress(100);
      setStatusMsg('');

      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
    } catch (e) {
      setError(t('error'));
      console.error(e);
    }

    setIsProcessing(false);
  }, [file, outputFormat, t]);

  const download = () => {
    if (!result || !file) return;
    const url = URL.createObjectURL(result);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.name.replace(/\.[^/.]+$/, '')}.${outputFormat}`;
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
            <span>{formatSize(file.size)}</span>
            {result && (
              <span className="flex items-center gap-1">
                <i className="fas fa-arrow-right-long text-xs"></i>
                {formatSize(result.size)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Output Format */}
      <div>
        <label className="font-medium block mb-3">{t('format')}</label>
        <div className="flex gap-2">
          {OUTPUT_FORMATS.map((f) => (
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
