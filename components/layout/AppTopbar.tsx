'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { ThemeToggle } from './ThemeToggle';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':        'Dashboard',
  '/tips':             'Tips',
  '/odds':             'Odds',
  '/multiplas':        'Múltiplas',
  '/banca':            'Banca',
  '/banca/apostas':    'Apostas',
  '/banca/insights':   'Insights',
  '/comunidade':       'Comunidade',
  '/ranking':          'Ranking',
  '/configuracoes':    'Configurações',
};

interface AppTopbarProps {
  title?: string;
  liveCount?: number;
}

export function AppTopbar({ title, liveCount = 14 }: AppTopbarProps) {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const pathname = usePathname();

  // strip locale prefix: /pt-BR/dashboard → /dashboard
  const pathKey = pathname.replace(/^\/[^/]+/, '') || '/dashboard';
  const dynamicTitle = title ?? PAGE_TITLES[pathKey] ?? t('title');

  return (
    <div className="topbar">
      {/* Logo mobile — toca para ir à página inicial */}
      <Link href={`/${locale}`} className="topbar-mobile-logo lw" style={{ fontSize: 18, textDecoration: 'none' }}>
        <span className="lw-bet">Odd</span>
        <span className="lw-mind">Seek</span>
      </Link>

      <div className="topbar-search">
        <svg className="topbar-search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        <input
          type="search"
          placeholder="Buscar times, jogos, mercados..."
          aria-label="Buscar"
        />
        <span className="topbar-search-kbd">⌘K</span>
      </div>

      <div className="topbar-sep" />

      <div className="live-pill">
        <div className="live-dot" />
        {liveCount} {t('active_tips').toLowerCase()}
      </div>

      <ThemeToggle />

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
