'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { signOut } from 'next-auth/react';
import { OddSeekMark } from '@/components/brand/OddSeekMark';

interface NavItem {
  href: string;
  label: string;
  badge?: number | string;
  badgeVariant?: 'lime' | 'amber';
  icon: React.ReactNode;
}

function NavIcon({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{children}</span>
  );
}

export function AppSidebar() {
  const t = useTranslations('sidebar');
  const locale = useLocale();
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/');
  }

  const mainItems: NavItem[] = [
    {
      href: `/${locale}/dashboard`,
      label: t('dashboard'),
      icon: (
        <NavIcon>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1.5" y="1.5" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
            <rect x="8" y="1.5" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
            <rect x="1.5" y="8" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
            <rect x="8" y="8" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
          </svg>
        </NavIcon>
      ),
    },
    {
      href: `/${locale}/tips`,
      label: t('tips'),
      badge: 14,
      badgeVariant: 'lime',
      icon: (
        <NavIcon>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="5" r="3" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M2 13c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </NavIcon>
      ),
    },
    {
      href: `/${locale}/odds`,
      label: t('odds'),
      icon: (
        <NavIcon>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7h8M5 4l-2 3 2 3M9 4l2 3-2 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </NavIcon>
      ),
    },
    {
      href: `/${locale}/multiplas`,
      label: t('parlays'),
      icon: (
        <NavIcon>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 11l3-4 2.5 2 3-5 2 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </NavIcon>
      ),
    },
    {
      href: `/${locale}/arbitragem`,
      label: t('arbitrage'),
      badge: 'ARB',
      badgeVariant: 'amber' as const,
      icon: (
        <NavIcon>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="3.5" cy="7" r="2" stroke="currentColor" strokeWidth="1.2"/>
            <circle cx="10.5" cy="7" r="2" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M5.5 5.5L8.5 4M5.5 8.5L8.5 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </NavIcon>
      ),
    },
  ];

  const bankrollItems: NavItem[] = [
    {
      href: `/${locale}/banca`,
      label: t('bankroll'),
      icon: (
        <NavIcon>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1.5" y="4" width="11" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M4 4V3a2 2 0 014 0v1" stroke="currentColor" strokeWidth="1.2"/>
            <circle cx="7" cy="8" r="1" fill="currentColor"/>
          </svg>
        </NavIcon>
      ),
    },
    {
      href: `/${locale}/banca/apostas`,
      label: t('bets'),
      icon: (
        <NavIcon>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 12.5h10M2 9.5h10M4 6.5h6M5 3.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </NavIcon>
      ),
    },
    {
      href: `/${locale}/banca/insights`,
      label: t('insights'),
      icon: (
        <NavIcon>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M7 4v3l2 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </NavIcon>
      ),
    },
  ];

  const communityItems: NavItem[] = [
    {
      href: `/${locale}/comunidade`,
      label: t('community'),
      icon: (
        <NavIcon>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
            <circle cx="10" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M1 13c0-2 1.8-3.5 4-3.5s4 1.5 4 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            <path d="M10 9.5c2 0 3.5 1.3 3.5 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </NavIcon>
      ),
    },
    {
      href: `/${locale}/ranking`,
      label: t('ranking'),
      icon: (
        <NavIcon>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="7" width="3" height="5.5" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
            <rect x="5.5" y="4" width="3" height="8.5" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
            <rect x="10" y="1.5" width="3" height="11" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
          </svg>
        </NavIcon>
      ),
    },
    {
      href: `/${locale}/configuracoes`,
      label: t('settings'),
      icon: (
        <NavIcon>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M7 1.5v1.5M7 11v1.5M1.5 7H3M11 7h1.5M3.4 3.4l1 1M9.6 9.6l1 1M3.4 10.6l1-1M9.6 4.4l1-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </NavIcon>
      ),
    },
  ];

  function renderItem(item: NavItem) {
    const active = isActive(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`nav-item${active ? ' active' : ''}`}
      >
        {item.icon}
        {item.label}
        {item.badge !== undefined && (
          <span className={`nav-badge${item.badgeVariant === 'amber' ? ' amber' : ''}`}>
            {item.badge}
          </span>
        )}
      </Link>
    );
  }

  return (
    <aside>
      <Link href={`/${locale}/dashboard`} className="sidebar-logo">
        <OddSeekMark size="md" />
        <span className="lw" style={{ fontSize: 17 }}>
          <span className="lw-bet">Odd</span>
          <span className="lw-mind">Seek</span>
        </span>
      </Link>

      <div className="nav-group">
        <div className="nav-group-label">{t('main')}</div>
        {mainItems.map(renderItem)}
      </div>

      <div className="nav-group">
        <div className="nav-group-label">{t('sports')}</div>
        {bankrollItems.map(renderItem)}
      </div>

      <div className="nav-group">
        <div className="nav-group-label">{t('account')}</div>
        {communityItems.map(renderItem)}
      </div>

      <div className="sidebar-footer">
        <Link
          href={`/${locale}`}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '7px 10px', borderRadius: 7, marginBottom: 4,
            fontSize: 12, fontWeight: 600, color: 'var(--muted)',
            textDecoration: 'none', transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0 }}>
            <path d="M1.5 6.5L6.5 2l5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 5.5V11h2.5V8.5h2V11H10V5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Página Inicial
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: `/${locale}` })}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '7px 10px', borderRadius: 7, marginBottom: 8,
            fontSize: 12, fontWeight: 600, color: 'var(--muted)',
            background: 'none', border: 'none', cursor: 'pointer',
            width: '100%', textAlign: 'left', transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--red)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0 }}>
            <path d="M5 2H2a1 1 0 00-1 1v7a1 1 0 001 1h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            <path d="M8.5 9l3-2.5L8.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="11" y1="6.5" x2="4.5" y2="6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          Sair da conta
        </button>

        <div className="user-row">
          <div className="avatar">U</div>
          <div>
            <div className="user-name">Demo User</div>
            <div className="user-plan">{t('free_plan')}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
