import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function Footer() {
  const t = useTranslations();
  const footerT = t.raw('footer');
  const toolKeys = ['image-compressor', 'image-converter', 'video-compress', 'video-to-gif'] as const;

  return (
    <footer className="border-t border-[var(--color-border)] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center">
                <i className="fas fa-wand-magic-sparkles text-white text-sm"></i>
              </div>
              <span className="text-xl font-bold">Tool<span className="text-[var(--color-primary)]">Pic</span></span>
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">{footerT.tagline}</p>
          </div>

          {/* Tool Links */}
          <div>
            <h3 className="font-semibold mb-4">{footerT.tools}</h3>
            <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
              {toolKeys.map((key) => (
                <li key={key}>
                  <Link href={`/tools/${key}`} className="hover:text-white transition-colors">
                    {t(`tools.${key}.title`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">{footerT.legal}</h3>
            <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
              <li><span className="cursor-pointer hover:text-white transition-colors">{footerT.privacy}</span></li>
              <li><span className="cursor-pointer hover:text-white transition-colors">{footerT.terms}</span></li>
              <li><span className="cursor-pointer hover:text-white transition-colors">{footerT.contact}</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--color-border)] text-center text-sm text-[var(--color-text-muted)]">
          {footerT.copyright}
        </div>
      </div>
    </footer>
  );
}
