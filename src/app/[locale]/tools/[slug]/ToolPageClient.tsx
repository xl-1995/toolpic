'use client';

import { useTranslations } from 'next-intl';
import ImageCompressor from '@/components/tools/ImageCompressor';
import ImageConverter from '@/components/tools/ImageConverter';
import PlaceholderTool from '@/components/tools/PlaceholderTool';

const toolComponents: Record<string, React.ComponentType> = {
  'image-compressor': ImageCompressor,
  'image-converter': ImageConverter,
};

export default function ToolPageClient({ toolId }: { toolId: string }) {
  const t = useTranslations();
  const toolT = t.raw(`tools.${toolId}`);
  const ToolComponent = toolComponents[toolId] || PlaceholderTool;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 gradient-text">
          {toolT.h1}
        </h1>
        <p className="text-[var(--color-text-muted)] max-w-2xl mx-auto">
          {toolT.description}
        </p>
      </div>

      <div className="glass-card p-8">
        <ToolComponent />
      </div>

      {/* Privacy notice */}
      <div className="mt-8 text-center">
        <p className="text-sm text-[var(--color-text-muted)] flex items-center justify-center gap-2">
          <i className="fas fa-shield-halved text-[var(--color-success)]"></i>
          {t('common.privacy')}
        </p>
      </div>
    </div>
  );
}
