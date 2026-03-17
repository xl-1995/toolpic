'use client';

import { useCallback, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';

interface DropZoneProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // MB
  onFiles: (files: File[]) => void;
}

export default function DropZone({ accept, multiple = true, maxSize = 50, onFiles }: DropZoneProps) {
  const t = useTranslations('common');
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      const valid = files.filter((f) => f.size <= maxSize * 1024 * 1024);
      if (valid.length > 0) {
        onFiles(multiple ? valid : [valid[0]]);
      }
    },
    [maxSize, multiple, onFiles]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        onFiles(files);
      }
      e.target.value = '';
    },
    [onFiles]
  );

  return (
    <div
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`drop-zone p-16 text-center cursor-pointer ${isDragging ? 'active' : ''}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />
      <div className="flex flex-col items-center gap-5">
        <div className="text-5xl text-[var(--color-purple)]">
          <i className="fas fa-cloud-arrow-up"></i>
        </div>
        <div>
          <p className="text-lg font-semibold">{t('upload')}</p>
          <p className="text-[var(--color-text-muted)] mt-1">{t('uploadHint')}</p>
        </div>
        <p className="text-sm text-[var(--color-text-dim)]">
          {t('maxFileSize', { size: maxSize })}
        </p>
      </div>
    </div>
  );
}
