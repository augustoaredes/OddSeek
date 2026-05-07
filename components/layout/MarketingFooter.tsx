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

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {([
          { href: `/${locale}/sobre`,     label: 'Sobre' },
          { href: `/${locale}/faq`,       label: 'FAQ' },
          { href: `/${locale}/afiliados`, label: 'Afiliados' },
          { href: `/${locale}/contato`,   label: 'Contato' },
          { href: `/${locale}/termos`,    label: t('terms') },
          { href: `/${locale}/privacidade`, label: t('privacy') },
          { href: `/${locale}/aviso-risco`, label: t('risk') },
        ] as { href: string; label: string }[]).map(item => (
          <Link
            key={item.href}
            href={item.href}
            style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', textDecoration: 'none' }}
          >
            {item.label}
          </Link>
        ))}
        <span style={{ fontSize: 11, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          © {new Date().getFullYear()} {t('copy')}
        </span>
      </div>
    </footer>
  );
}
