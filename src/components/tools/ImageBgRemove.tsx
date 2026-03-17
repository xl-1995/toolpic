'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import DropZone from '@/components/ui/DropZone';

export default function ImageBgRemove() {
  const t = useTranslations('common');
  const [file, setFile] = useState<File | null>(null);
  const [imgSrc, setImgSrc] = useState('');
  const [tolerance, setTolerance] = useState(30);
  const [result, setResult] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [instruction, setInstruction] = useState('Click on the background color you want to remove.');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const imageDataRef = useRef<ImageData | null>(null);

  const handleFiles = useCallback((files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      const url = URL.createObjectURL(files[0]);
      setImgSrc(url);
      setResult(null);
      setPreviewUrl('');
      setInstruction('Click on the background color you want to remove.');
    }
  }, []);

  const onImageLoad = useCallback(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.drawImage(img, 0, 0);
    imageDataRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
  }, []);

  const floodFill = useCallback((startX: number, startY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !imageDataRef.current) return;

    setIsProcessing(true);
    setInstruction('Processing...');

    // Work on a copy of the image data
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const width = canvas.width;
    const height = canvas.height;

    // Get the target color
    const idx = (startY * width + startX) * 4;
    const targetR = data[idx];
    const targetG = data[idx + 1];
    const targetB = data[idx + 2];

    const visited = new Uint8Array(width * height);
    const stack: number[] = [startX, startY];

    const colorMatch = (i: number) => {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const dist = Math.sqrt(
        (r - targetR) ** 2 + (g - targetG) ** 2 + (b - targetB) ** 2
      );
      return dist <= tolerance;
    };

    // Use requestAnimationFrame-based chunked processing to avoid blocking
    const processChunk = () => {
      let iterations = 0;
      const maxIterations = 100000;

      while (stack.length > 0 && iterations < maxIterations) {
        const y = stack.pop()!;
        const x = stack.pop()!;

        if (x < 0 || x >= width || y < 0 || y >= height) continue;

        const pixelIdx = y * width + x;
        if (visited[pixelIdx]) continue;
        visited[pixelIdx] = 1;

        const dataIdx = pixelIdx * 4;
        if (!colorMatch(dataIdx)) continue;

        // Make transparent
        data[dataIdx + 3] = 0;

        stack.push(x + 1, y);
        stack.push(x - 1, y);
        stack.push(x, y + 1);
        stack.push(x, y - 1);

        iterations++;
      }

      if (stack.length > 0) {
        requestAnimationFrame(processChunk);
      } else {
        // Done
        ctx.putImageData(imgData, 0, 0);
        imageDataRef.current = ctx.getImageData(0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            setResult(blob);
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(URL.createObjectURL(blob));
          }
          setIsProcessing(false);
          setInstruction('Click another area to remove more, or download the result.');
        }, 'image/png');
      }
    };

    requestAnimationFrame(processChunk);
  }, [tolerance, previewUrl]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isProcessing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    floodFill(x, y);
  }, [isProcessing, floodFill]);

  const download = () => {
    if (!result || !file) return;
    const url = URL.createObjectURL(result);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nobg-${file.name.replace(/\.[^/.]+$/, '')}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    if (imgSrc) URL.revokeObjectURL(imgSrc);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setImgSrc('');
    setResult(null);
    setPreviewUrl('');
    imageDataRef.current = null;
  };

  if (!file) {
    return <DropZone accept="image/*" multiple={false} onFiles={handleFiles} />;
  }

  return (
    <div className="space-y-6">
      {/* Tolerance slider */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="font-medium">Color Tolerance</label>
          <span className="text-[var(--color-text-muted)]">{tolerance}</span>
        </div>
        <input
          type="range"
          min="1"
          max="100"
          value={tolerance}
          onChange={(e) => setTolerance(parseInt(e.target.value))}
          disabled={isProcessing}
        />
      </div>

      {/* Instruction */}
      <p className="text-sm text-[var(--color-text-muted)] text-center">
        <i className="fas fa-info-circle mr-2"></i>
        {instruction}
      </p>

      {/* Hidden image for loading */}
      <img
        ref={imgRef}
        src={imgSrc}
        onLoad={onImageLoad}
        className="hidden"
        alt=""
      />

      {/* Canvas */}
      <div className="flex justify-center" style={{ background: 'repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 20px 20px', borderRadius: '0.75rem', overflow: 'hidden' }}>
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="max-w-full max-h-[500px] cursor-crosshair"
          style={{ imageRendering: 'auto' }}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
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
