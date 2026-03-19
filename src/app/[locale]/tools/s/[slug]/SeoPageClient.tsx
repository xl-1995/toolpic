'use client';

import { useTranslations } from 'next-intl';
import ImageCompressor from '@/components/tools/ImageCompressor';
import ImageConverter from '@/components/tools/ImageConverter';
import ImageCrop from '@/components/tools/ImageCrop';
import ImageWatermark from '@/components/tools/ImageWatermark';
import ImageBgRemove from '@/components/tools/ImageBgRemove';
import ImageMerge from '@/components/tools/ImageMerge';
import VideoCompress from '@/components/tools/VideoCompress';
import VideoConvert from '@/components/tools/VideoConvert';
import VideoToGif from '@/components/tools/VideoToGif';
import VideoExtractAudio from '@/components/tools/VideoExtractAudio';
import PlaceholderTool from '@/components/tools/PlaceholderTool';

const toolComponents: Record<string, React.ComponentType> = {
  'image-compressor': ImageCompressor,
  'image-converter': ImageConverter,
  'image-crop': ImageCrop,
  'image-watermark': ImageWatermark,
  'image-bg-remove': ImageBgRemove,
  'image-merge': ImageMerge,
  'video-compress': VideoCompress,
  'video-convert': VideoConvert,
  'video-to-gif': VideoToGif,
  'video-extract-audio': VideoExtractAudio,
};

interface SeoPageClientProps {
  toolId: string;
  titleKey: string;
  descKey: string;
}

export default function SeoPageClient({ toolId, titleKey, descKey }: SeoPageClientProps) {
  const t = useTranslations('seoPages');
  const commonT = useTranslations('common');
  const ToolComponent = toolComponents[toolId] || PlaceholderTool;

  return (
    <>
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 gradient-text tracking-tight">
          {t(titleKey)}
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto leading-relaxed">
          {t(descKey)}
        </p>
      </div>

      <div className="glass-card p-6 sm:p-8">
        <ToolComponent />
      </div>

      {/* Privacy notice */}
      <div className="mt-8 text-center">
        <p className="text-sm text-[var(--color-text-muted)] flex items-center justify-center gap-3">
          <i className="fas fa-shield-halved text-[var(--color-success)]"></i>
          {commonT('privacy')}
        </p>
      </div>
    </div>

    {/* How to Use - 3 steps */}
    {t.has(`${titleKey}Step1`) && (
      <div className="max-w-[900px] mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8 gradient-text">{t(`${titleKey}HowTo`)}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="glass-card p-6 text-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-purple)] to-[var(--color-blue)] flex items-center justify-center mx-auto mb-4 text-white font-bold">{i}</div>
              <h3 className="font-semibold mb-2">{t(`${titleKey}Step${i}`)}</h3>
              <p className="text-sm text-[var(--color-text-muted)]">{t(`${titleKey}Step${i}Desc`)}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* FAQ - 3 questions */}
    {t.has(`${titleKey}Faq1Q`) && (
      <div className="max-w-[900px] mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold mb-8 gradient-text">{t(`${titleKey}FaqTitle`)}</h2>
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <details key={i} className="glass-card p-6 group">
              <summary className="font-semibold cursor-pointer list-none flex items-center justify-between">
                {t(`${titleKey}Faq${i}Q`)}
                <i className="fas fa-chevron-down text-sm text-[var(--color-text-muted)] group-open:rotate-180 transition-transform"></i>
              </summary>
              <p className="text-[var(--color-text-muted)] mt-3 leading-relaxed">{t(`${titleKey}Faq${i}A`)}</p>
            </details>
          ))}
        </div>
      </div>
    )}
    </>
  );
}
