'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { locales, localeNames, type Locale } from '@/i18n/config';

export default function Header() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  function switchLocale(newLocale: string) {
    router.replace(pathname, { locale: newLocale as Locale });
    setLangOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--color-bg)]/80 border-b border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center">
              <i className="fas fa-wand-magic-sparkles text-white text-sm"></i>
            </div>
            <span className="text-xl font-bold">Tool<span className="text-[var(--color-primary)]">Pic</span></span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm text-[var(--color-text-muted)] hover:text-white transition-colors">
              {t('home')}
            </Link>
            <Link href="/#image-tools" className="text-sm text-[var(--color-text-muted)] hover:text-white transition-colors">
              {t('imageTools')}
            </Link>
            <Link href="/#video-tools" className="text-sm text-[var(--color-text-muted)] hover:text-white transition-colors">
              {t('videoTools')}
            </Link>
          </nav>

          {/* Language Switcher + Mobile Toggle */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
              >
                <i className="fas fa-globe"></i>
                <span className="hidden sm:inline">{localeNames[locale as Locale]}</span>
                <i className="fas fa-chevron-down text-xs"></i>
              </button>
              {langOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 max-h-80 overflow-y-auto glass-card py-2 z-50">
                    {locales.map((loc) => (
                      <button
                        key={loc}
                        onClick={() => switchLocale(loc)}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          loc === locale
                            ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/10'
                            : 'text-[var(--color-text-muted)] hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {localeNames[loc]}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-[var(--color-text-muted)] hover:text-white p-2"
            >
              <i className={`fas ${mobileOpen ? 'fa-xmark' : 'fa-bars'} text-lg`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-bg)]">
          <nav className="px-4 py-4 flex flex-col gap-3">
            <Link href="/" onClick={() => setMobileOpen(false)} className="text-sm text-[var(--color-text-muted)] hover:text-white py-2">
              {t('home')}
            </Link>
            <Link href="/#image-tools" onClick={() => setMobileOpen(false)} className="text-sm text-[var(--color-text-muted)] hover:text-white py-2">
              {t('imageTools')}
            </Link>
            <Link href="/#video-tools" onClick={() => setMobileOpen(false)} className="text-sm text-[var(--color-text-muted)] hover:text-white py-2">
              {t('videoTools')}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
