'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useSession, signOut } from 'next-auth/react';
import { OddSeekMark } from '@/components/brand/OddSeekMark';

const SPORTS = [
  { key: 'football',   label: 'Futebol',   count: 1247, dot: true },
  { key: 'basketball', label: 'Basquete',  count: 312  },
  { key: 'tennis',     label: 'Tênis',     count: 198  },
  { key: 'mma',        label: 'MMA',       count: 42   },
  { key: 'esports',    label: 'E-Sports',  count: 86   },
  { key: 'american_football', label: 'NFL', count: 28  },
];

export function AppSidebar() {
  const locale   = useLocale();
  const pathname = usePathname();
  const { data: session } = useSession();

  const name     = session?.user?.name ?? 'Demo User';
  const initials = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/');
  }

  function sport(key: string) {
    const sp = new URLSearchParams({ sport: key });
    return `/${locale}/odds?${sp}`;
  }

  const li = (href: string, label: string, badge?: string | number, badgeColor?: string, icon?: React.ReactNode) => {
    const active = isActive(href);
    return (
      <Link key={href} href={href} className={`nav-item${active ? ' active' : ''}`}>
        {icon ?? null}
        {label}
        {badge !== undefined && (
          <span className="nav-badge" style={badgeColor ? { background: badgeColor + '22', color: badgeColor, border: `1px solid ${badgeColor}44` } : undefined}>
            {badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside>
      {/* Logo */}
      <Link href={`/${locale}/dashboard`} className="sidebar-logo">
        <OddSeekMark size="md" />
        <span className="lw" style={{ fontSize: 17 }}>
          <span className="lw-bet">Odd</span>
          <span className="lw-mind">Seek</span>
        </span>
      </Link>

      <nav style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4, padding: '8px 12px' }}>

        {/* PRINCIPAL */}
        <div className="nav-group-label" style={{ marginTop: 8 }}>Principal</div>

        {li(`/${locale}/dashboard`, 'Dashboard', undefined, undefined,
          <NavIcon><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="1.5" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="8" y="1.5" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="1.5" y="8" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="8" y="8" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.2"/></svg></NavIcon>
        )}
        {li(`/${locale}/odds`, 'Odds ao vivo', 'EV+', 'var(--lime)',
          <NavIcon><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M5 4l-2 3 2 3M9 4l2 3-2 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg></NavIcon>
        )}
        {li(`/${locale}/tips`, 'Palpites IA', 128, undefined,
          <NavIcon><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="5" r="3" stroke="currentColor" strokeWidth="1.2"/><path d="M2 13c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg></NavIcon>
        )}
        {li(`/${locale}/multiplas`, 'Múltiplas', undefined, undefined,
          <NavIcon><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 11l3-4 2.5 2 3-5 2 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg></NavIcon>
        )}
        {li(`/${locale}/banca`, 'Banca & P&L', undefined, undefined,
          <NavIcon><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="4" width="11" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M4 4V3a2 2 0 014 0v1" stroke="currentColor" strokeWidth="1.2"/><circle cx="7" cy="8" r="1" fill="currentColor"/></svg></NavIcon>
        )}

        {/* ESPORTES */}
        <div className="nav-group-label" style={{ marginTop: 16 }}>Esportes</div>
        {SPORTS.map(s => {
          const href = sport(s.key);
          const active = pathname.includes(`sport=${s.key}`);
          return (
            <Link key={s.key} href={href} className={`nav-item${active ? ' active' : ''}`}>
              {s.dot && (
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--lime)', flexShrink: 0 }} />
              )}
              {!s.dot && <span style={{ width: 6, flexShrink: 0 }} />}
              {s.label}
              <span style={{ marginLeft: 'auto', fontSize: 10, color: active ? 'var(--lime)' : 'var(--dim)', fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--font-cond)', fontWeight: 700 }}>
                {s.count.toLocaleString('pt-BR')}
              </span>
            </Link>
          );
        })}

        {/* CONTA */}
        <div className="nav-group-label" style={{ marginTop: 16 }}>Conta</div>
        {li(`/${locale}/comunidade`, 'Comunidade', undefined, undefined,
          <NavIcon><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2"/><circle cx="10" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2"/><path d="M1 13c0-2 1.8-3.5 4-3.5s4 1.5 4 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M10 9.5c2 0 3.5 1.3 3.5 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg></NavIcon>
        )}
        {li(`/${locale}/ranking`, 'Histórico', undefined, undefined,
          <NavIcon><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="7" width="3" height="5.5" rx="0.5" stroke="currentColor" strokeWidth="1.2"/><rect x="5.5" y="4" width="3" height="8.5" rx="0.5" stroke="currentColor" strokeWidth="1.2"/><rect x="10" y="1.5" width="3" height="11" rx="0.5" stroke="currentColor" strokeWidth="1.2"/></svg></NavIcon>
        )}
        {li(`/${locale}/configuracoes`, 'Configurações', undefined, undefined,
          <NavIcon><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.2"/><path d="M7 1.5v1.5M7 11v1.5M1.5 7H3M11 7h1.5M3.4 3.4l1 1M9.6 9.6l1 1M3.4 10.6l1-1M9.6 4.4l1-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg></NavIcon>
        )}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">

        {/* Upgrade card */}
        <div style={{
          background: 'oklch(80% 0.3 115 / 0.08)',
          border: '1px solid oklch(80% 0.3 115 / 0.2)',
          borderRadius: 10, padding: '14px 14px 12px', marginBottom: 12,
        }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--lime)', opacity: .7, marginBottom: 4 }}>
            Plano Explorador
          </div>
          <div style={{ fontFamily: 'var(--font-cond)', fontSize: 14, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-.01em', color: 'var(--text)', lineHeight: 1.1, marginBottom: 8 }}>
            Liberar EV+ Ilimitado
          </div>
          <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5, margin: '0 0 10px' }}>
            Upgrade para Pro e veja todos os palpites em tempo real.
          </p>
          <Link
            href={`/${locale}/sobre`}
            style={{
              display: 'block', textAlign: 'center',
              fontFamily: 'var(--font-cond)', fontWeight: 800, fontSize: 11,
              letterSpacing: '.08em', textTransform: 'uppercase',
              background: 'var(--lime)', color: '#000',
              padding: '8px 0', borderRadius: 6, textDecoration: 'none',
            }}
          >
            Ver Planos
          </Link>
        </div>

        {/* User row */}
        <div className="user-row">
          <div className="avatar" style={{ background: 'oklch(75% 0.22 145)', color: '#000', fontWeight: 800 }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
            <div className="user-plan">Plano Explorador</div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: `/${locale}` })}
            title="Sair"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dim)', padding: 4, display: 'flex', alignItems: 'center', flexShrink: 0 }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--red)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--dim)')}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M5 2H2a1 1 0 00-1 1v7a1 1 0 001 1h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              <path d="M8.5 9l3-2.5L8.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="11" y1="6.5" x2="4.5" y2="6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}

function NavIcon({ children }: { children: React.ReactNode }) {
  return <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{children}</span>;
}
