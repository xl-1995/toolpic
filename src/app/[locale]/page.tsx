import { useTranslations } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { tools, getToolSlug } from '@/data/tools';
import { blogPosts } from '@/data/blog';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'meta' });
  const baseUrl = 'https://toolpic.me';
  const url = `${baseUrl}/${locale}`;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'ToolPic',
      url: url,
      description: t('siteDescription'),
      inLanguage: locale,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${baseUrl}/${locale}/tools/{search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'ToolPic',
      url: baseUrl,
      logo: `${baseUrl}/icon-512.png`,
      description: 'Free online image and video processing tools. 100% browser-based, no uploads required. Privacy-first with client-side processing.',
      sameAs: [],
      foundingDate: '2025',
      knowsAbout: ['image compression', 'image conversion', 'video compression', 'video conversion', 'background removal', 'image editing', 'video to GIF conversion', 'audio extraction'],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'ToolPic',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Any (Web Browser)',
      url: url,
      description: 'Free browser-based image and video tools. Compress, convert, crop, merge images. Compress, convert videos and extract audio. All processing happens locally in your browser - no file uploads.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: 'Image Compression, Image Conversion, Image Cropping, Watermark, Background Removal, Image Merge, Video Compression, Video Conversion, Video to GIF, Audio Extraction',
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeContent locale={locale} />
    </>
  );
}

function HomeContent({ locale }: { locale: string }) {
  const t = useTranslations();
  const imageTools = tools.filter((tool) => tool.category === 'image');
  const videoTools = tools.filter((tool) => tool.category === 'video');

  return (
    <>
      <div className="background-grid" />

      {/* Hero */}
      <section className="relative text-center pt-24 pb-20 sm:pt-32 sm:pb-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link
            href="/blog/gpt-image-2-everything-we-know-2026-guide"
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border border-[var(--color-purple)]/40 bg-gradient-to-r from-[var(--color-purple)]/10 to-[var(--color-blue)]/10 hover:border-[var(--color-purple)]/70 hover:from-[var(--color-purple)]/15 hover:to-[var(--color-blue)]/15 transition-all duration-300 text-sm"
          >
            <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-[var(--color-purple)] to-[var(--color-blue)] text-white text-xs font-bold">🔥 {t('home.newBadgeLabel')}</span>
            <span className="text-[var(--color-text)]">{t('home.gptImage2Badge')}</span>
            <i className="fas fa-arrow-right text-xs text-[var(--color-text-muted)]"></i>
          </Link>
          <h1 className="text-4xl sm:text-5xl lg:text-[4.5rem] font-extrabold leading-tight tracking-tight mb-6 gradient-text">
            {t('home.h1')}
          </h1>
          <p className="text-lg sm:text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto mb-10">
            {t('home.subtitle')}
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="#image-tools"
              className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-base"
            >
              {t('home.startNow')} <i className="fas fa-arrow-right"></i>
            </Link>
            <Link
              href="#why-toolpic"
              className="inline-flex items-center gap-2 px-6 py-3 text-base font-semibold rounded-[var(--radius-btn)] border border-[var(--color-border-hover)] text-[var(--color-text)] hover:bg-[var(--color-bg-card)] hover:border-[var(--color-text-muted)] transition-all duration-300"
            >
              {t('home.learnMore')}
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Image Tools */}
        <section id="image-tools" className="py-16 sm:py-24">
          <h2 className="text-3xl sm:text-[2.5rem] font-extrabold text-center mb-4 gradient-text">
            {t('home.imageSection')}
          </h2>
          <p className="text-lg text-[var(--color-text-muted)] text-center max-w-xl mx-auto mb-12">
            {t('home.imageSectionDesc')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {imageTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} locale={locale} t={t} />
            ))}
          </div>
        </section>

        {/* Video Tools */}
        <section id="video-tools" className="py-16 sm:py-24">
          <h2 className="text-3xl sm:text-[2.5rem] font-extrabold text-center mb-4 gradient-text">
            {t('home.videoSection')}
          </h2>
          <p className="text-lg text-[var(--color-text-muted)] text-center max-w-xl mx-auto mb-12">
            {t('home.videoSectionDesc')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videoTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} locale={locale} t={t} />
            ))}
          </div>
        </section>

        {/* Why ToolPic */}
        <section id="why-toolpic" className="py-16 sm:py-24">
          <h2 className="text-3xl sm:text-[2.5rem] font-extrabold text-center mb-4 gradient-text">
            {t('home.whyTitle')}
          </h2>
          <p className="text-lg text-[var(--color-text-muted)] text-center max-w-xl mx-auto mb-12">
            {t('home.whySubtitle')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <WhyCard
              icon="fa-shield-halved"
              title={t('home.why1Title')}
              desc={t('home.why1Desc')}
            />
            <WhyCard
              icon="fa-infinity"
              title={t('home.why2Title')}
              desc={t('home.why2Desc')}
            />
            <WhyCard
              icon="fa-bolt"
              title={t('home.why3Title')}
              desc={t('home.why3Desc')}
            />
          </div>
        </section>

        {/* Latest Articles */}
        <section id="latest-articles" className="py-16 sm:py-24">
          <h2 className="text-3xl sm:text-[2.5rem] font-extrabold text-center mb-4 gradient-text">
            {t('common.latestArticlesTitle')}
          </h2>
          <p className="text-lg text-[var(--color-text-muted)] text-center max-w-xl mx-auto mb-12">
            {t('common.latestArticlesDesc')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {blogPosts.slice(0, 4).map((post) => (
              <BlogCard key={post.slug} post={post} t={t} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 text-base font-semibold rounded-[var(--radius-btn)] border border-[var(--color-border-hover)] text-[var(--color-text)] hover:bg-[var(--color-bg-card)] hover:border-[var(--color-text-muted)] transition-all duration-300"
            >
              {t('nav.blog')} <i className="fas fa-arrow-right text-sm"></i>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}

function ToolCard({
  tool,
  locale,
  t,
}: {
  tool: (typeof tools)[number];
  locale: string;
  t: any;
}) {
  const slug = getToolSlug(tool.id, locale);
  const toolT = t.raw(`tools.${tool.id}`);

  return (
    <Link href={`/tools/${slug}`} className="tool-card glass-card p-8 block">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-purple)]/10 to-[var(--color-blue)]/10 flex items-center justify-center mb-5">
        <i className={`fas fa-${tool.icon} text-xl text-[var(--color-text)]`}></i>
      </div>
      <h3 className="text-xl font-semibold mb-2">{toolT.title}</h3>
      <p className="text-[0.95rem] text-[var(--color-text-muted)] leading-relaxed">{toolT.description}</p>
    </Link>
  );
}

function BlogCard({
  post,
  t,
}: {
  post: (typeof blogPosts)[number];
  t: any;
}) {
  let postTitle: string;
  let postExcerpt: string;
  try {
    postTitle = t(`blog.posts.${post.slug}.title`);
    postExcerpt = t(`blog.posts.${post.slug}.excerpt`);
  } catch {
    postTitle = post.slug.replace(/-/g, ' ');
    postExcerpt = '';
  }

  return (
    <Link href={`/blog/${post.slug}`} className="tool-card glass-card p-6 block group">
      {post.heroImage && (
        <div className="rounded-lg overflow-hidden mb-4 aspect-[16/9]">
          <img
            src={post.heroImage}
            alt={postTitle}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            width={400}
            height={225}
            loading="lazy"
          />
        </div>
      )}
      <h3 className="text-[0.95rem] font-semibold mb-2 line-clamp-2 group-hover:text-[var(--color-purple)] transition-colors">
        {postTitle}
      </h3>
      <p className="text-sm text-[var(--color-text-muted)] leading-relaxed line-clamp-2">{postExcerpt}</p>
    </Link>
  );
}

function WhyCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="glass-card p-10 text-center">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-purple)]/10 to-[var(--color-blue)]/10 flex items-center justify-center mx-auto mb-6">
        <i className={`fas ${icon} text-2xl text-[var(--color-text)]`}></i>
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-[0.95rem] text-[var(--color-text-muted)] leading-relaxed">{desc}</p>
    </div>
  );
}
