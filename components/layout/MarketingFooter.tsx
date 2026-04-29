import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { OddSeekMark } from '@/components/brand/OddSeekMark';

export async function MarketingFooter() {
  const locale = await getLocale();
  const t = await getTranslations('footer');

  return (
    <footer
      style={{
        borderTop: '1px solid var(--border)',
        padding: '32px 44px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 24,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <OddSeekMark size="sm" />
        <span className="lw" style={{ fontSize: 16 }}>
          <span className="lw-bet">Odd</span>
          <span className="lw-mind">Seek</span>
        </span>
      </div>

      <p
        style={{
          fontSize: 11,
          color: 'var(--muted)',
          lineHeight: 1.7,
          maxWidth: 480,
          flex: '1 1 300px',
        }}
      >
        {t('disclaimer')}
      </p>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <Link
          href={`/${locale}/termos`}
          style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}
        >
          {t('terms')}
        </Link>
        <Link
          href={`/${locale}/privacidade`}
          style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}
        >
          {t('privacy')}
        </Link>
        <Link
          href={`/${locale}/aviso-risco`}
          style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}
        >
          {t('risk')}
        </Link>
        <span
          style={{
            fontSize: 11,
            color: 'var(--dim)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          © {new Date().getFullYear()} {t('copy')}
        </span>
      </div>
    </footer>
  );
}
