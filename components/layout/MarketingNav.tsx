'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useLocale, useTranslations } from 'next-intl';

const OddSeekMark = dynamic(
  () => import('@/components/brand/OddSeekMark').then((m) => ({ default: m.OddSeekMark })),
  { ssr: false }
);

export function MarketingNav() {
  const t = useTranslations('nav');
  const locale = useLocale();

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 44px',
        height: 56,
        background: 'oklch(4% 0 250 / 0.94)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <Link href={`/${locale}`} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <OddSeekMark size="md" />
        <span className="lw" style={{ fontSize: 20 }}>
          <span className="lw-bet">Odd</span>
          <span className="lw-mind">Seek</span>
        </span>
      </Link>

      {/* Desktop links */}
      <div className="nav-links hide-sm">
        <Link href={`/${locale}#features`}>{t('features')}</Link>
        <Link href={`/${locale}#matches`}>{t('live')}</Link>
        <Link href={`/${locale}#banca`}>{t('bankroll')}</Link>
        <Link href={`/${locale}#pricing`}>{t('pricing')}</Link>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {/* Language switcher */}
        <Link
          href={locale === 'pt-BR' ? '/en' : '/pt-BR'}
          className="btn btn-ghost"
          style={{ fontSize: 11, letterSpacing: '0.08em', minWidth: 'auto', padding: '0 10px' }}
        >
          {locale === 'pt-BR' ? 'EN' : 'PT'}
        </Link>

        <Link href={`/${locale}/login`} className="btn btn-ghost">
          {t('login')}
        </Link>
        <Link href={`/${locale}/registro`} className="btn btn-lime">
          {t('signup')}
        </Link>
      </div>
    </nav>
  );
}
