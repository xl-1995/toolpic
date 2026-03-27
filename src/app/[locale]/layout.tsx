import { NextIntlClientProvider, useMessages } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Inter } from 'next/font/google';
import { routing } from '@/i18n/routing';
import { locales, localeNames, type Locale } from '@/i18n/config';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-inter',
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  const baseUrl = 'https://toolpic.me';
  const url = `${baseUrl}/${locale}`;

  // Build alternates for all locales
  const languages: Record<string, string> = {};
  for (const loc of locales) {
    languages[loc] = `${baseUrl}/${loc}`;
  }
  languages['x-default'] = `${baseUrl}/en`;

  return {
    metadataBase: new URL(baseUrl),
    title: t('homeTitle'),
    description: t('siteDescription'),
    icons: {
      icon: [
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
      ],
      apple: '/apple-touch-icon.png',
    },
    alternates: {
      canonical: url,
      languages,
    },
    openGraph: {
      title: t('homeTitle'),
      description: t('siteDescription'),
      url,
      siteName: 'ToolPic',
      type: 'website',
      locale: locale,
      images: [
        {
          url: 'https://toolpic.me/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'ToolPic - Free Online Image & Video Tools',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: t('homeTitle'),
      description: t('siteDescription'),
      images: ['https://toolpic.me/og-image.jpg'],
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = (await import(`@/messages/${locale}.json`)).default;

  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} className={`${inter.variable} ${inter.className}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#7c3aed" />
        {/* Load Font Awesome asynchronously to avoid render-blocking */}
        <link
          rel="preload"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          as="style"
        />
        <noscript>
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          />
        </noscript>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              var fa = document.createElement('link');
              fa.rel = 'stylesheet';
              fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
              document.head.appendChild(fa);
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
