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
  title: string;
  description: string;
  howToTitle: string;
  steps: Array<{ title: string; desc: string }> | null;
  faqTitle: string;
  faqs: Array<{ q: string; a: string }> | null;
}

export default function SeoPageClient({
  toolId,
  title,
  description,
  howToTitle,
  steps,
  faqTitle,
  faqs,
}: SeoPageClientProps) {
  const commonT = useTranslations('common');
  const ToolComponent = toolComponents[toolId] || PlaceholderTool;

  return (
    <>
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 gradient-text tracking-tight">
          {title}
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto leading-relaxed">
          {description}
        </p>
      </div>

      <div className="glass-card p-6 sm:p-8">
        <ToolComponent />
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-[var(--color-text-muted)] flex items-center justify-center gap-3">
          <i className="fas fa-shield-halved text-[var(--color-success)]"></i>
          {commonT('privacy')}
        </p>
      </div>
    </div>

    {steps && (
      <div className="max-w-[900px] mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8 gradient-text">{howToTitle}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="glass-card p-6 text-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-purple)] to-[var(--color-blue)] flex items-center justify-center mx-auto mb-4 text-white font-bold">{i + 1}</div>
              <h3 className="font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-[var(--color-text-muted)]">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    {faqs && (
      <div className="max-w-[900px] mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold mb-8 gradient-text">{faqTitle}</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details key={i} className="glass-card p-6 group">
              <summary className="font-semibold cursor-pointer list-none flex items-center justify-between">
                {faq.q}
                <i className="fas fa-chevron-down text-sm text-[var(--color-text-muted)] group-open:rotate-180 transition-transform"></i>
              </summary>
              <p className="text-[var(--color-text-muted)] mt-3 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    )}
    </>
  );
}
