import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { tools, getToolSlug, type ToolCategory } from '@/data/tools';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HomeContent locale={locale} />;
}

function HomeContent({ locale }: { locale: string }) {
  const t = useTranslations();
  const imageTools = tools.filter((tool) => tool.category === 'image');
  const videoTools = tools.filter((tool) => tool.category === 'video');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero */}
      <section className="text-center mb-20">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 gradient-text">
          {t('home.h1')}
        </h1>
        <p className="text-xl text-[var(--color-text-muted)] max-w-3xl mx-auto">
          {t('home.subtitle')}
        </p>
      </section>

      {/* Image Tools */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
          <i className="fas fa-image text-[var(--color-primary)]"></i>
          {t('home.imageSection')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {imageTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} locale={locale} t={t} />
          ))}
        </div>
      </section>

      {/* Video Tools */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
          <i className="fas fa-video text-[var(--color-accent)]"></i>
          {t('home.videoSection')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videoTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} locale={locale} t={t} />
          ))}
        </div>
      </section>

      {/* Why ToolPic */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-12">{t('home.whyTitle')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
    </div>
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
    <Link href={`/tools/${slug}`} className="tool-card glass-card p-6 block">
      <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center mb-4">
        <i className={`fas fa-${tool.icon} text-xl text-[var(--color-primary)]`}></i>
      </div>
      <h3 className="text-lg font-semibold mb-2">{toolT.title}</h3>
      <p className="text-sm text-[var(--color-text-muted)]">{toolT.description}</p>
    </Link>
  );
}

function WhyCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="glass-card p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mx-auto mb-6">
        <i className={`fas ${icon} text-2xl text-[var(--color-primary)]`}></i>
      </div>
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <p className="text-sm text-[var(--color-text-muted)]">{desc}</p>
    </div>
  );
}
