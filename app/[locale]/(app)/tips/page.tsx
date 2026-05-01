import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { getTips } from '@/lib/tips/fetcher';
import { sanitizeEV } from '@/lib/analytics/ev';
import { TipCard } from '@/components/tips/TipCard';

interface Props {
  searchParams: Promise<{ sport?: string; filter?: string; league?: string }>;
}

const SPORT_FILTERS = [
  { value: 'all',        label: 'Todos',    icon: '' },
  { value: 'football',   label: 'Futebol',  icon: '⚽' },
  { value: 'basketball', label: 'Basquete', icon: '🏀' },
  { value: 'tennis',     label: 'Tênis',    icon: '🎾' },
  { value: 'mma',        label: 'MMA',      icon: '🥊' },
];

export default async function TipsPage({ searchParams }: Props) {
  const locale = await getLocale();
  const sp     = await searchParams;
  const sport  = sp.sport  ?? 'all';
  const filter = sp.filter ?? '';
  const league = sp.league ?? 'all';

  const allTips = await getTips();

  // Unique leagues from all tips (filtered by sport if selected)
  const sportFiltered = sport === 'all' ? allTips : allTips.filter(t => t.sport === sport);
  const leagues = ['all', ...Array.from(new Set(sportFiltered.map(t => t.league))).sort()];

  // Apply all filters
  let tips = sportFiltered;
  if (league !== 'all') tips = tips.filter(t => t.league === league);
  if (filter === 'elite') tips = tips.filter(t => sanitizeEV(t.ev) >= 0.10);
  if (filter === 'live')  tips = tips.slice(0, 3);

  const positiveEV = allTips.filter(t => sanitizeEV(t.ev) > 0).length;

  // Build URL helpers
  function buildHref(patch: Record<string, string>) {
    const p = new URLSearchParams();
    const current = { sport, filter, league };
    const merged = { ...current, ...patch };
    if (merged.sport  && merged.sport  !== 'all') p.set('sport',  merged.sport);
    if (merged.filter && merged.filter !== '')    p.set('filter', merged.filter);
    if (merged.league && merged.league !== 'all') p.set('league', merged.league);
    const q = p.toString();
    return `/${locale}/tips${q ? `?${q}` : ''}`;
  }

  const [topTip, ...restTips] = tips;

  return (
    <div className="page-full">

      {/* ── Header ── */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 900, fontFamily: 'var(--font-cond)', letterSpacing: '-0.01em', color: 'var(--text)' }}>
              Tips EV+
            </span>
            <span style={{
              fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 4,
              background: 'var(--s2)', border: '1px solid var(--border)',
              color: 'var(--muted)', letterSpacing: '0.05em',
            }}>
              {tips.length} apostas
            </span>
          </div>
          <span style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--red)', display: 'inline-block', animation: 'pulse 1.2s ease-in-out infinite' }} />
            {positiveEV} com EV+
          </span>
        </div>

        {/* Filtros de esporte */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
          {SPORT_FILTERS.map(f => (
            <Link key={f.value} href={buildHref({ sport: f.value, league: 'all' })}
              className={`f-tab${sport === f.value ? ' on' : ''}`}>
              {f.icon && <span style={{ fontSize: 12 }}>{f.icon}</span>}
              {f.label}
            </Link>
          ))}
          <span className="f-sep" />
          <Link href={buildHref({ filter: filter === 'elite' ? '' : 'elite' })}
            className={`f-tab ev-tab${filter === 'elite' ? ' on' : ''}`}>
            Alto EV
          </Link>
          <Link href={buildHref({ filter: filter === 'live' ? '' : 'live' })}
            className={`f-tab${filter === 'live' ? ' on' : ''}`}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--red)', display: 'inline-block', animation: 'pulse 1.2s ease-in-out infinite' }} />
            Ao vivo
          </Link>
        </div>

        {/* Filtro por campeonato/liga */}
        {leagues.length > 2 && (
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 12, scrollbarWidth: 'none', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
            {leagues.map(lg => (
              <Link key={lg} href={buildHref({ league: lg })}
                style={{
                  fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
                  background: league === lg ? 'var(--lime)' : 'var(--s2)',
                  border: `1px solid ${league === lg ? 'var(--lime)' : 'var(--border)'}`,
                  color: league === lg ? '#000' : 'var(--muted)',
                  textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
                  transition: 'all .15s',
                }}>
                {lg === 'all' ? 'Todos campeonatos' : lg}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Conteúdo ── */}
      {tips.length === 0 ? (
        <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
          Nenhuma tip encontrada para este filtro.
        </div>
      ) : (
        <div className="page-scroll" style={{ padding: '0 20px' }}>

          {/* Card #1 em destaque */}
          {topTip && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{
                  fontSize: 9, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase',
                  background: 'var(--lime)', color: '#000', padding: '2px 8px', borderRadius: 4,
                  fontFamily: 'var(--font-cond)',
                }}>
                  #1 EV DO DIA
                </span>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>melhor oportunidade agora</span>
              </div>
              <TipCard tip={topTip} locale={locale} rank={1} highlight bankroll={1000} />
            </div>
          )}

          {/* Demais tips */}
          {restTips.length > 0 && (
            <>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
                Outras oportunidades
              </div>
              <div className="cards-scroll-row">
                {restTips.map((tip, i) => (
                  <div key={tip.id} className="tip-card" style={{ padding: 0, background: 'none', border: 'none' }}>
                    <TipCard tip={tip} locale={locale} rank={i + 2} bankroll={1000} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
