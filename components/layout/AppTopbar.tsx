'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

interface AppTopbarProps {
  title?: string;
  liveCount?: number;
}

export function AppTopbar({ title, liveCount = 14 }: AppTopbarProps) {
  const t = useTranslations('dashboard');
  const locale = useLocale();

  return (
    <div className="topbar">
      {/* Logo visível só no mobile (substitui sidebar) */}
      <Link href={`/${locale}/dashboard`} className="topbar-mobile-logo lw" style={{ fontSize: 18, textDecoration: 'none' }}>
        <span className="lw-bet">Odd</span>
        <span className="lw-mind">Seek</span>
      </Link>

      <div
        className="topbar-title"
        style={{
          fontFamily: "var(--font-cond, 'Barlow Condensed', sans-serif)",
          fontStyle: 'normal',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          fontWeight: 700,
          fontSize: 13,
          color: 'var(--muted)',
        }}
      >
        {title ?? t('title')}
      </div>
      <div className="topbar-sep" />

      <div className="live-pill">
        <div className="live-dot" />
        {liveCount} {t('active_tips').toLowerCase()}
      </div>

      <button className="icon-btn" aria-label="Alerts">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <path d="M7.5 1.5a4 4 0 00-4 4v3L2 11h11L11.5 8.5v-3a4 4 0 00-4-4z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
          <path d="M6 12.5a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      </button>

      <Link href={`/${locale}/configuracoes`} className="icon-btn" aria-label="Configurações" style={{ textDecoration: 'none' }}>
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <circle cx="7.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M7.5 1v2M7.5 12v2M1 7.5h2M12 7.5h2M2.9 2.9l1.4 1.4M10.7 10.7l1.4 1.4M2.9 12.1l1.4-1.4M10.7 4.3l1.4-1.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      </Link>
    </div>
  );
}
