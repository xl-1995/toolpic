'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { tools, getToolSlug } from '@/data/tools';
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

function getRelatedTools(currentToolId: string) {
  const currentTool = tools.find(t => t.id === currentToolId);
  if (!currentTool) return tools.slice(0, 6);

  const sameCategory = tools.filter(t => t.id !== currentToolId && t.category === currentTool.category);
  const otherCategory = tools.filter(t => t.category !== currentTool.category);

  // Take all same-category tools, then fill with other-category tools up to 6
  const related = [...sameCategory, ...otherCategory.slice(0, 2)];
  return related.slice(0, 6);
}

export default function ToolPageClient({ toolId }: { toolId: string }) {
  const t = useTranslations();
  const locale = useLocale();
  const toolT = t.raw(`tools.${toolId}`);
  const ToolComponent = toolComponents[toolId] || PlaceholderTool;
  const relatedTools = getRelatedTools(toolId);

  return (
    <>
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 gradient-text tracking-tight">
          {toolT.h1}
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto leading-relaxed">
          {toolT.description}
        </p>
      </div>

      <div className="glass-card p-6 sm:p-8">
        <ToolComponent />
      </div>

      {/* Privacy notice */}
      <div className="mt-8 text-center">
        <p className="text-sm text-[var(--color-text-muted)] flex items-center justify-center gap-3">
          <i className="fas fa-shield-halved text-[var(--color-success)]"></i>
          {t('common.privacy')}
        </p>
      </div>
    </div>

    {/* SEO Content */}
    {toolT.howToUseTitle && (
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* How to Use */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 gradient-text">{toolT.howToUseTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="glass-card p-6 text-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-purple)] to-[var(--color-blue)] flex items-center justify-center mx-auto mb-4 text-white font-bold">
                  {step}
                </div>
                <h3 className="font-semibold mb-2">{toolT[`step${step}Title`]}</h3>
                <p className="text-sm text-[var(--color-text-muted)]">{toolT[`step${step}Desc`]}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        {toolT.featuresTitle && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8 gradient-text">{toolT.featuresTitle}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                toolT[`feature${i}Title`] ? (
                  <div key={i} className="glass-card p-6">
                    <h3 className="font-semibold mb-2">{toolT[`feature${i}Title`]}</h3>
                    <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{toolT[`feature${i}Desc`]}</p>
                  </div>
                ) : null
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        {toolT.faqTitle && (
          <section>
            <h2 className="text-2xl font-bold mb-8 gradient-text">{toolT.faqTitle}</h2>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                toolT[`faq${i}Q`] ? (
                  <details key={i} className="glass-card p-6 group">
                    <summary className="font-semibold cursor-pointer list-none flex items-center justify-between">
                      {toolT[`faq${i}Q`]}
                      <i className="fas fa-chevron-down text-sm text-[var(--color-text-muted)] group-open:rotate-180 transition-transform"></i>
                    </summary>
                    <p className="text-[var(--color-text-muted)] mt-3 leading-relaxed">{toolT[`faq${i}A`]}</p>
                  </details>
                ) : null
              ))}
            </div>
          </section>
        )}
      </div>
    )}

    {/* Related Tools */}
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <h2 className="text-2xl font-bold mb-8 gradient-text">{t('common.relatedToolsTitle')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatedTools.map((tool) => {
          const slug = getToolSlug(tool.id, locale);
          const relToolT = t.raw(`tools.${tool.id}`);
          return (
            <Link
              key={tool.id}
              href={`/tools/${slug}`}
              className="tool-card glass-card p-6 block"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-purple)]/10 to-[var(--color-blue)]/10 flex items-center justify-center mb-4">
                <i className={`fas fa-${tool.icon} text-lg text-[var(--color-text)]`}></i>
              </div>
              <h3 className="text-base font-semibold mb-1">{relToolT.title}</h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed line-clamp-2">{relToolT.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
    </>
  );
}
