'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import DropZone from '@/components/ui/DropZone';
import ProgressBar from '@/components/ui/ProgressBar';
import { getFFmpeg, formatSize } from '@/lib/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

const AUDIO_FORMATS = [
  { value: 'mp3', label: 'MP3', mime: 'audio/mpeg', codec: 'libmp3lame', ext: 'mp3' },
  { value: 'wav', label: 'WAV', mime: 'audio/wav', codec: 'pcm_s16le', ext: 'wav' },
  { value: 'aac', label: 'AAC', mime: 'audio/aac', codec: 'aac', ext: 'aac' },
];

export default function VideoExtractAudio() {
  const t = useTranslations('common');
  const [file, setFile] = useState<File | null>(null);
  const [audioFormat, setAudioFormat] = useState('mp3');
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

  const extract = useCallback(async () => {
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
      const fmt = AUDIO_FORMATS.find((f) => f.value === audioFormat)!;
      const outputName = `output.${fmt.ext}`;

      await ffmpeg.writeFile(inputName, await fetchFile(file));

      setStatusMsg('Extracting audio...');
      setProgress(25);

      ffmpeg.on('progress', ({ progress: p }) => {
        setProgress(25 + Math.round(p * 65));
      });

      const args = ['-i', inputName, '-vn', '-c:a', fmt.codec];
      if (fmt.value === 'mp3') {
        args.push('-b:a', '192k');
      } else if (fmt.value === 'aac') {
        args.push('-b:a', '192k');
      }
      args.push(outputName);

      await ffmpeg.exec(args);

      setStatusMsg('Finalizing...');
      setProgress(95);

      const data = await ffmpeg.readFile(outputName);
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
  }, [file, audioFormat, t]);

  const download = () => {
    if (!result || !file) return;
    const fmt = AUDIO_FORMATS.find((f) => f.value === audioFormat)!;
    const url = URL.createObjectURL(result);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.name.replace(/\.[^/.]+$/, '')}.${fmt.ext}`;
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
                Audio: {formatSize(result.size)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Audio Format */}
      <div>
        <label className="font-medium block mb-3">{t('format')}</label>
        <div className="flex gap-2">
          {AUDIO_FORMATS.map((f) => (
            <button
              key={f.value}
              onClick={() => setAudioFormat(f.value)}
              disabled={isProcessing}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                audioFormat === f.value
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

      {/* Audio player for result */}
      {result && (
        <div className="flex justify-center">
          <audio controls src={URL.createObjectURL(result)} className="w-full max-w-md" />
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        {!isProcessing && !result && (
          <button
            onClick={extract}
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
