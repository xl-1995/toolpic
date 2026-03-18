import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function Footer() {
  const t = useTranslations();
  const footerT = t.raw('footer');
  const toolKeys = ['image-compressor', 'image-converter', 'image-crop', 'image-watermark', 'image-bg-remove', 'video-compress', 'video-convert', 'video-to-gif'] as const;

  return (
    <footer className="bg-[#040405] border-t border-[var(--color-border)] mt-20">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--color-purple)] to-[var(--color-blue)] flex items-center justify-center">
                <i className="fas fa-wand-magic-sparkles text-white text-base"></i>
              </span>
              <span className="text-2xl font-bold tracking-tight">ToolPic</span>
            </div>
            <p className="text-[var(--color-text-muted)] max-w-[300px] leading-relaxed">{footerT.tagline}</p>
          </div>

          {/* Tool Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{footerT.tools}</h3>
            <ul className="space-y-3">
              {toolKeys.map((key) => (
                <li key={key}>
                  <Link
                    href={`/tools/${key}`}
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors duration-300"
                  >
                    {t(`tools.${key}.title`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{footerT.resources || 'Resources'}</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/blog"
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors duration-300"
                >
                  {t('nav.blog')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{footerT.legal}</h3>
            <ul className="space-y-3">
              <li>
                <span className="cursor-pointer text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors duration-300">
                  {footerT.privacy}
                </span>
              </li>
              <li>
                <span className="cursor-pointer text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors duration-300">
                  {footerT.terms}
                </span>
              </li>
              <li>
                <span className="cursor-pointer text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors duration-300">
                  {footerT.contact}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[var(--color-border)] text-center text-sm text-[var(--color-text-dim)]">
          {footerT.copyright}
        </div>
      </div>
    </footer>
  );
}
