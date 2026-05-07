import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { OddSeekMark } from '@/components/brand/OddSeekMark';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export async function MarketingNav() {
  const locale = await getLocale();
  const t = await getTranslations('nav');
  const session = await auth();
  const isLoggedIn = !!session?.user;

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
        background: 'var(--nav-bg)',
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
        <Link href={`/${locale}/ferramentas`} style={{ color: 'var(--lime)', fontWeight: 700 }}>
          Ferramentas
        </Link>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {/* Theme toggle */}
        <ThemeToggle />

        {/* Language switcher */}
        <Link
          href={locale === 'pt-BR' ? '/en' : '/pt-BR'}
          className="btn btn-ghost"
          style={{ fontSize: 11, letterSpacing: '0.08em', minWidth: 'auto', padding: '0 10px' }}
        >
          {locale === 'pt-BR' ? 'EN' : 'PT'}
        </Link>

        {isLoggedIn ? (
          <Link href={`/${locale}/dashboard`} className="btn btn-lime">
            Dashboard →
          </Link>
        ) : (
          <>
            <Link href={`/${locale}/login`} className="btn btn-ghost">
              {t('login')}
            </Link>
            <Link href={`/${locale}/registro`} className="btn btn-lime">
              {t('signup')}
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
