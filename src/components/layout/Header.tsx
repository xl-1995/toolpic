'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { locales, localeNames } from '@/i18n/config';
import { getToolBySlug } from '@/data/tools';

export default function Header() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function handleLocaleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newLocale = e.target.value;

    // For tool pages, translate the slug to the target locale
    const toolMatch = pathname.match(/^\/tools\/([^/]+)$/);
    if (toolMatch) {
      const currentSlug = toolMatch[1];
      const tool = getToolBySlug(currentSlug, locale);
      if (tool) {
        const newSlug = tool.slugs[newLocale] || tool.slugs['en'];
        window.location.href = `/${newLocale}/tools/${newSlug}`;
        return;
      }
    }

    window.location.href = `/${newLocale}${pathname}`;
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[var(--color-bg)]/70 backdrop-blur-xl shadow-[0_2px_10px_rgba(0,0,0,0.2)]'
          : ''
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--color-purple)] to-[var(--color-blue)] flex items-center justify-center">
              <i className="fas fa-wand-magic-sparkles text-white text-base"></i>
            </span>
            <span className="text-2xl font-bold tracking-tight">ToolPic</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] font-medium transition-colors duration-300">
              {t('home')}
            </Link>
            <Link href="/#image-tools" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] font-medium transition-colors duration-300">
              {t('imageTools')}
            </Link>
            <Link href="/#video-tools" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] font-medium transition-colors duration-300">
              {t('videoTools')}
            </Link>
            <Link href="/blog" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] font-medium transition-colors duration-300">
              {t('blog')}
            </Link>
          </nav>

          {/* Language Switcher + Mobile Toggle */}
          <div className="flex items-center gap-4">
            {/* Language Switcher - Native select for reliability */}
            <div className="relative flex items-center">
              <i className="fas fa-globe text-[var(--color-text-muted)] text-lg pointer-events-none absolute left-0"></i>
              <select
                value={locale}
                onChange={handleLocaleChange}
                className="appearance-none bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer pl-6 pr-4 py-1 text-sm font-medium border-none outline-none transition-colors duration-300"
                aria-label="Change language"
              >
                {locales.map((loc) => (
                  <option key={loc} value={loc} className="bg-[var(--color-bg)] text-[var(--color-text)]">
                    {localeNames[loc]}
                  </option>
                ))}
              </select>
              <i className="fas fa-chevron-down text-[var(--color-text-muted)] text-xs pointer-events-none"></i>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-xl transition-colors"
              aria-label="Toggle menu"
            >
              <i className={`fas ${mobileOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-bg)]">
          <nav className="px-4 py-4 flex flex-col gap-1">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] font-medium py-3 px-3 rounded-lg hover:bg-white/5 transition-all"
            >
              {t('home')}
            </Link>
            <Link
              href="/#image-tools"
              onClick={() => setMobileOpen(false)}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] font-medium py-3 px-3 rounded-lg hover:bg-white/5 transition-all"
            >
              {t('imageTools')}
            </Link>
            <Link
              href="/#video-tools"
              onClick={() => setMobileOpen(false)}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] font-medium py-3 px-3 rounded-lg hover:bg-white/5 transition-all"
            >
              {t('videoTools')}
            </Link>
            <Link
              href="/blog"
              onClick={() => setMobileOpen(false)}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] font-medium py-3 px-3 rounded-lg hover:bg-white/5 transition-all"
            >
              {t('blog')}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
