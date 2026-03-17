'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import DropZone from '@/components/ui/DropZone';

interface CropArea {
  x: number;
  y: number;
  w: number;
  h: number;
}

const ASPECT_RATIOS = [
  { label: 'Free', value: 0 },
  { label: '1:1', value: 1 },
  { label: '16:9', value: 16 / 9 },
  { label: '4:3', value: 4 / 3 },
  { label: '9:16', value: 9 / 16 },
  { label: '3:4', value: 3 / 4 },
];

export default function ImageCrop() {
  const t = useTranslations('common');
  const [file, setFile] = useState<File | null>(null);
  const [imgSrc, setImgSrc] = useState<string>('');
  const [crop, setCrop] = useState<CropArea>({ x: 0, y: 0, w: 0, h: 0 });
  const [aspectRatio, setAspectRatio] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'move' | 'resize' | 'new'>('new');
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropStart, setCropStart] = useState<CropArea>({ x: 0, y: 0, w: 0, h: 0 });
  const [result, setResult] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [imgDims, setImgDims] = useState({ naturalW: 0, naturalH: 0, displayW: 0, displayH: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleFiles = useCallback((files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      const url = URL.createObjectURL(files[0]);
      setImgSrc(url);
      setResult(null);
      setPreviewUrl('');
      setCrop({ x: 0, y: 0, w: 0, h: 0 });
    }
  }, []);

  const onImageLoad = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    const naturalW = img.naturalWidth;
    const naturalH = img.naturalHeight;
    const displayW = img.clientWidth;
    const displayH = img.clientHeight;
    setImgDims({ naturalW, naturalH, displayW, displayH });
    // Set default crop to full image
    setCrop({ x: 0, y: 0, w: displayW, h: displayH });
  }, []);

  const getMousePos = (e: React.MouseEvent) => {
    const rect = imgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: Math.max(0, Math.min(e.clientX - rect.left, imgDims.displayW)),
      y: Math.max(0, Math.min(e.clientY - rect.top, imgDims.displayH)),
    };
  };

  const constrainCrop = (c: CropArea): CropArea => {
    let { x, y, w, h } = c;
    const maxW = imgDims.displayW;
    const maxH = imgDims.displayH;

    if (aspectRatio > 0 && w > 0 && h > 0) {
      h = w / aspectRatio;
      if (h > maxH) {
        h = maxH;
        w = h * aspectRatio;
      }
    }

    w = Math.max(10, Math.min(w, maxW));
    h = Math.max(10, Math.min(h, maxH));
    x = Math.max(0, Math.min(x, maxW - w));
    y = Math.max(0, Math.min(y, maxH - h));

    return { x, y, w, h };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const pos = getMousePos(e);
    setIsDragging(true);
    setDragStart(pos);

    // Check if inside existing crop
    if (
      crop.w > 20 &&
      crop.h > 20 &&
      pos.x >= crop.x &&
      pos.x <= crop.x + crop.w &&
      pos.y >= crop.y &&
      pos.y <= crop.y + crop.h
    ) {
      // Check if near bottom-right corner for resize
      const cornerThreshold = 20;
      if (
        pos.x >= crop.x + crop.w - cornerThreshold &&
        pos.y >= crop.y + crop.h - cornerThreshold
      ) {
        setDragMode('resize');
      } else {
        setDragMode('move');
      }
      setCropStart({ ...crop });
    } else {
      setDragMode('new');
      setCrop({ x: pos.x, y: pos.y, w: 0, h: 0 });
      setCropStart({ x: pos.x, y: pos.y, w: 0, h: 0 });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const pos = getMousePos(e);
    const dx = pos.x - dragStart.x;
    const dy = pos.y - dragStart.y;

    if (dragMode === 'new') {
      let w = pos.x - cropStart.x;
      let h = pos.y - cropStart.y;
      let x = cropStart.x;
      let y = cropStart.y;
      if (w < 0) { x = pos.x; w = -w; }
      if (h < 0) { y = pos.y; h = -h; }
      if (aspectRatio > 0) {
        h = w / aspectRatio;
      }
      setCrop(constrainCrop({ x, y, w, h }));
    } else if (dragMode === 'move') {
      setCrop(constrainCrop({
        x: cropStart.x + dx,
        y: cropStart.y + dy,
        w: cropStart.w,
        h: cropStart.h,
      }));
    } else if (dragMode === 'resize') {
      const newW = Math.max(20, cropStart.w + dx);
      let newH = aspectRatio > 0 ? newW / aspectRatio : Math.max(20, cropStart.h + dy);
      setCrop(constrainCrop({
        x: cropStart.x,
        y: cropStart.y,
        w: newW,
        h: newH,
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const doCrop = useCallback(() => {
    if (!imgRef.current || crop.w < 10 || crop.h < 10) return;

    const scaleX = imgDims.naturalW / imgDims.displayW;
    const scaleY = imgDims.naturalH / imgDims.displayH;

    const sx = crop.x * scaleX;
    const sy = crop.y * scaleY;
    const sw = crop.w * scaleX;
    const sh = crop.h * scaleY;

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(sw);
    canvas.height = Math.round(sh);
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(imgRef.current, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        setResult(blob);
        setPreviewUrl(URL.createObjectURL(blob));
      }
    }, 'image/png');
  }, [crop, imgDims]);

  const download = () => {
    if (!result || !file) return;
    const url = URL.createObjectURL(result);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cropped-${file.name.replace(/\.[^/.]+$/, '')}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    if (imgSrc) URL.revokeObjectURL(imgSrc);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setImgSrc('');
    setCrop({ x: 0, y: 0, w: 0, h: 0 });
    setResult(null);
    setPreviewUrl('');
  };

  if (!file) {
    return <DropZone accept="image/*" multiple={false} onFiles={handleFiles} />;
  }

  return (
    <div className="space-y-6">
      {/* Aspect Ratio */}
      <div>
        <label className="font-medium block mb-3">Aspect Ratio</label>
        <div className="flex flex-wrap gap-2">
          {ASPECT_RATIOS.map((ar) => (
            <button
              key={ar.label}
              onClick={() => {
                setAspectRatio(ar.value);
                if (ar.value > 0 && crop.w > 0) {
                  setCrop(constrainCrop({ ...crop, h: crop.w / ar.value }));
                }
              }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                aspectRatio === ar.value
                  ? 'btn-primary'
                  : 'bg-black/20 text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-text)]'
              }`}
            >
              {ar.label}
            </button>
          ))}
        </div>
      </div>

      {/* Crop size info */}
      {crop.w > 0 && crop.h > 0 && (
        <div className="text-sm text-[var(--color-text-muted)]">
          Crop: {Math.round(crop.w * imgDims.naturalW / imgDims.displayW)} x {Math.round(crop.h * imgDims.naturalH / imgDims.displayH)} px
        </div>
      )}

      {/* Image with crop overlay */}
      {!result ? (
        <div
          ref={containerRef}
          className="relative inline-block w-full select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            ref={imgRef}
            src={imgSrc}
            onLoad={onImageLoad}
            className="max-w-full max-h-[500px] rounded-lg"
            draggable={false}
            alt="Source"
          />
          {/* Dark overlay outside crop */}
          {crop.w > 10 && crop.h > 10 && (
            <>
              <div
                className="absolute bg-black/60 pointer-events-none"
                style={{ top: 0, left: 0, width: '100%', height: crop.y }}
              />
              <div
                className="absolute bg-black/60 pointer-events-none"
                style={{ top: crop.y, left: 0, width: crop.x, height: crop.h }}
              />
              <div
                className="absolute bg-black/60 pointer-events-none"
                style={{ top: crop.y, left: crop.x + crop.w, width: `calc(100% - ${crop.x + crop.w}px)`, height: crop.h }}
              />
              <div
                className="absolute bg-black/60 pointer-events-none"
                style={{ top: crop.y + crop.h, left: 0, width: '100%', height: `calc(100% - ${crop.y + crop.h}px)` }}
              />
              {/* Crop border */}
              <div
                className="absolute border-2 border-white/80 pointer-events-none"
                style={{ top: crop.y, left: crop.x, width: crop.w, height: crop.h }}
              >
                {/* Grid lines */}
                <div className="absolute w-full h-px bg-white/30 top-1/3" />
                <div className="absolute w-full h-px bg-white/30 top-2/3" />
                <div className="absolute h-full w-px bg-white/30 left-1/3" />
                <div className="absolute h-full w-px bg-white/30 left-2/3" />
                {/* Resize handle */}
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-white border-2 border-[var(--color-purple)] cursor-se-resize" />
              </div>
            </>
          )}
        </div>
      ) : (
        <div>
          <p className="text-sm text-[var(--color-text-muted)] mb-2">Preview:</p>
          <img src={previewUrl} className="max-w-full max-h-[500px] rounded-lg" alt="Cropped result" />
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        {!result && (
          <button
            onClick={doCrop}
            disabled={crop.w < 10 || crop.h < 10}
            className="btn-primary px-8 py-3 rounded-xl font-semibold disabled:opacity-40"
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
