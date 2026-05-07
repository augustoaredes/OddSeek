'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { ThemeToggle } from './ThemeToggle';

// ── Search index ──────────────────────────────────────────────────────────────
interface SearchItem {
  label: string;
  sub?: string;
  href: string;
  category: string;
  icon?: string;
}

function buildIndex(locale: string): SearchItem[] {
  return [
    // Páginas
    { label: 'Dashboard',       href: `/${locale}/dashboard`,       category: 'Páginas', icon: '⊞' },
    { label: 'Odds ao Vivo',    href: `/${locale}/odds`,            category: 'Páginas', icon: '📊' },
    { label: 'Tips IA',         href: `/${locale}/tips`,            category: 'Páginas', icon: '🎯' },
    { label: 'Múltiplas',       href: `/${locale}/multiplas`,       category: 'Páginas', icon: '🔗' },
    { label: 'Banca & P&L',     href: `/${locale}/banca`,           category: 'Páginas', icon: '💰' },
    { label: 'Apostas',         href: `/${locale}/banca/apostas`,   category: 'Páginas', icon: '📋' },
    { label: 'Insights',        href: `/${locale}/banca/insights`,  category: 'Páginas', icon: '📈' },
    { label: 'Comunidade',      href: `/${locale}/comunidade`,      category: 'Páginas', icon: '👥' },
    { label: 'Ranking',         href: `/${locale}/ranking`,         category: 'Páginas', icon: '🏆' },
    { label: 'Configurações',   href: `/${locale}/configuracoes`,   category: 'Páginas', icon: '⚙️' },
    // Esportes
    { label: 'Futebol',         sub: 'Odds ao vivo',  href: `/${locale}/odds?sport=football`,   category: 'Esportes', icon: '⚽' },
    { label: 'Basquete',        sub: 'Odds ao vivo',  href: `/${locale}/odds?sport=basketball`, category: 'Esportes', icon: '🏀' },
    { label: 'Tênis',           sub: 'Odds ao vivo',  href: `/${locale}/odds?sport=tennis`,     category: 'Esportes', icon: '🎾' },
    { label: 'MMA',             sub: 'Odds ao vivo',  href: `/${locale}/odds?sport=mma`,        category: 'Esportes', icon: '🥊' },
    // Mercados
    { label: 'Resultado Final', sub: 'Mercado 1X2',   href: `/${locale}/odds?market=match_winner`,       category: 'Mercados' },
    { label: 'Ambas Marcam',    sub: 'BTTS',          href: `/${locale}/odds?market=btts`,                category: 'Mercados' },
    { label: 'Total de Gols',   sub: 'Over/Under',    href: `/${locale}/odds?market=total_goals`,         category: 'Mercados' },
    { label: 'Handicap',        sub: 'Asiático',      href: `/${locale}/odds?market=asian_handicap`,      category: 'Mercados' },
    // Times frequentes
    { label: 'Real Madrid',     sub: 'Futebol · LaLiga',      href: `/${locale}/odds?sport=football&filter=ev`, category: 'Times', icon: '⚽' },
    { label: 'Barcelona',       sub: 'Futebol · LaLiga',      href: `/${locale}/odds?sport=football&filter=ev`, category: 'Times', icon: '⚽' },
    { label: 'Flamengo',        sub: 'Futebol · Brasileirão', href: `/${locale}/odds?sport=football&filter=ev`, category: 'Times', icon: '⚽' },
    { label: 'Palmeiras',       sub: 'Futebol · Brasileirão', href: `/${locale}/odds?sport=football&filter=ev`, category: 'Times', icon: '⚽' },
    { label: 'Lakers',          sub: 'Basquete · NBA',        href: `/${locale}/odds?sport=basketball`,         category: 'Times', icon: '🏀' },
    { label: 'Celtics',         sub: 'Basquete · NBA',        href: `/${locale}/odds?sport=basketball`,         category: 'Times', icon: '🏀' },
  ];
}

function search(index: SearchItem[], query: string): SearchItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return index
    .filter(item =>
      item.label.toLowerCase().includes(q) ||
      item.sub?.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    )
    .slice(0, 8);
}

// ── Component ─────────────────────────────────────────────────────────────────
export function AppTopbar({ liveCount = 14 }: { liveCount?: number }) {
  const locale   = useLocale();
  const router   = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef   = useRef<HTMLDivElement>(null);

  const [query,   setQuery]   = useState('');
  const [open,    setOpen]    = useState(false);
  const [cursor,  setCursor]  = useState(-1);

  const index   = buildIndex(locale);
  const results = search(index, query);

  // ⌘K / Ctrl+K to focus
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
        setCursor(-1);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const navigate = useCallback((href: string) => {
    setOpen(false);
    setQuery('');
    setCursor(-1);
    router.push(href);
  }, [router]);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor(c => Math.min(c + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor(c => Math.max(c - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = results[cursor] ?? results[0];
      if (target) navigate(target.href);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setCursor(-1);
      inputRef.current?.blur();
    }
  }

  // Group results by category
  const grouped: Record<string, SearchItem[]> = {};
  for (const item of results) {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  }
  let flatIdx = 0;

  return (
    <div className="topbar">
      <Link href={`/${locale}`} className="topbar-mobile-logo lw" style={{ fontSize: 18, textDecoration: 'none' }}>
        <span className="lw-bet">Odd</span>
        <span className="lw-mind">Seek</span>
      </Link>

      {/* ── Search ── */}
      <div className="topbar-search" ref={boxRef}>
        <svg className="topbar-search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>

        <input
          ref={inputRef}
          type="search"
          value={query}
          placeholder="Buscar times, jogos, mercados..."
          aria-label="Buscar"
          autoComplete="off"
          onChange={e => { setQuery(e.target.value); setOpen(true); setCursor(-1); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
        <span className="topbar-search-kbd">⌘K</span>

        {/* Dropdown */}
        {open && results.length > 0 && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
            background: 'var(--surface)', border: '1px solid var(--bd2)',
            borderRadius: 10, boxShadow: '0 12px 40px #0009',
            zIndex: 200, overflow: 'hidden',
            maxHeight: 360, overflowY: 'auto',
          }}>
            {Object.entries(grouped).map(([cat, items]) => (
              <div key={cat}>
                <div style={{
                  padding: '8px 14px 4px',
                  fontSize: 10, fontWeight: 700, letterSpacing: '.1em',
                  textTransform: 'uppercase', color: 'var(--dim)',
                }}>
                  {cat}
                </div>
                {items.map(item => {
                  const idx = flatIdx++;
                  const active = cursor === idx;
                  return (
                    <button
                      key={item.href + item.label}
                      onMouseDown={() => navigate(item.href)}
                      onMouseEnter={() => setCursor(idx)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                        padding: '9px 14px', background: active ? 'var(--s2)' : 'transparent',
                        border: 'none', cursor: 'pointer', textAlign: 'left',
                        borderLeft: active ? '2px solid var(--lime)' : '2px solid transparent',
                        transition: 'background .1s',
                      }}
                    >
                      {item.icon && (
                        <span style={{ fontSize: 14, flexShrink: 0 }}>{item.icon}</span>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.2 }}>
                          {item.label}
                        </div>
                        {item.sub && (
                          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{item.sub}</div>
                        )}
                      </div>
                      <span style={{ fontSize: 10, color: 'var(--dim)', fontFamily: 'var(--font-cond)', letterSpacing: '.06em', textTransform: 'uppercase', flexShrink: 0 }}>
                        {item.category}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}

            <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border)', display: 'flex', gap: 12 }}>
              {[['↑↓', 'navegar'], ['↵', 'abrir'], ['Esc', 'fechar']].map(([k, v]) => (
                <span key={k} style={{ fontSize: 10, color: 'var(--dim)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <kbd style={{ background: 'var(--border)', borderRadius: 3, padding: '1px 4px', fontSize: 9, fontFamily: 'inherit' }}>{k}</kbd>
                  {v}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="topbar-sep" />

      <div className="live-pill">
        <div className="live-dot" />
        {liveCount} tips ao vivo
      </div>

      <ThemeToggle />

      <button className="icon-btn" aria-label="Alertas">
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
