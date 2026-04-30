import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { getTips } from '@/lib/tips/fetcher';
import { formatTimeBRT } from '@/lib/utils/date';
import { sanitizeEV } from '@/lib/analytics/ev';

const SPORT_DOTS: Record<string, string> = {
  football:   '#4ade80',
  basketball: '#a78bfa',
  tennis:     '#fcd34d',
  mma:        '#f87171',
};

const SPORT_LABELS: Record<string, string> = {
  football:   'Futebol',
  basketball: 'Basquete',
  tennis:     'Tênis',
  mma:        'MMA',
};

function evClass(ev: number): string {
  const safe = sanitizeEV(ev);
  if (safe >= 0.10) return 'hi';
  if (safe >= 0.02) return 'pos';
  return 'low';
}

function kellyStake(prob: number, odd: number): string {
  const b = odd - 1;
  const k = (prob * b - (1 - prob)) / b;
  const half = Math.max(k * 0.5, 0);
  const capped = Math.min(half, 0.03);
  return `${(capped * 100).toFixed(1)}u`;
}

interface Props {
  searchParams: Promise<{ sport?: string; filter?: string }>;
}

export default async function TipsPage({ searchParams }: Props) {
  const locale  = await getLocale();
  const sp      = await searchParams;
  const sport   = sp.sport   ?? 'all';
  const filter  = sp.filter  ?? '';

  const allTips = await getTips();

  let tips = sport === 'all' ? allTips : allTips.filter(t => t.sport === sport);
  if (filter === 'elite')     tips = tips.filter(t => t.ev >= 0.10);
  if (filter === 'live')      tips = tips.slice(0, 3);
  if (filter === 'scheduled') tips = tips.slice(3); // mocked: primeiros 3 = ao vivo, restante = agendados

  const positiveEV = allTips.filter(t => t.ev > 0).length;

  const sportFilters = [
    { value: 'all',        label: 'Todos' },
    { value: 'football',   label: 'Futebol',  dot: '#4ade80' },
    { value: 'basketball', label: 'Basquete', dot: '#a78bfa' },
    { value: 'tennis',     label: 'Tênis',    dot: '#fcd34d' },
    { value: 'mma',        label: 'MMA',      dot: '#f87171' },
  ];

  function tabHref(newSport: string) {
    const p = new URLSearchParams();
    if (newSport !== 'all') p.set('sport', newSport);
    if (filter) p.set('filter', filter);
    const q = p.toString();
    return `/${locale}/tips${q ? `?${q}` : ''}`;
  }

  function filterHref(newFilter: string) {
    const p = new URLSearchParams();
    if (sport !== 'all') p.set('sport', sport);
    if (newFilter) p.set('filter', newFilter);
    const q = p.toString();
    return `/${locale}/tips${q ? `?${q}` : ''}`;
  }

  return (
    <div className="page-full">
      {/* Header + filters */}
      <div className="tips-header" style={{ padding: '14px 20px 0' }}>
        <div className="tips-header-top">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span className="tips-title">Tips de hoje</span>
            <span className="tips-count-badge">{tips.length} apostas</span>
          </div>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>
            {positiveEV} com EV+
          </span>
        </div>
        <div className="filter-row">
          {sportFilters.map(f => (
            <Link
              key={f.value}
              href={tabHref(f.value)}
              className={`f-tab${sport === f.value ? ' on' : ''}`}
            >
              {f.dot && (
                <span className="f-sport-dot" style={{ background: f.dot }} />
              )}
              {f.label}
            </Link>
          ))}
          <span className="f-sep" />
          <Link href={filterHref('elite')} className={`f-tab${filter === 'elite' ? ' on ev-tab' : ' ev-tab'}`}>
            EV+
          </Link>
          <Link href={filterHref(filter === 'live' ? '' : 'live')} className={`f-tab${filter === 'live' ? ' on' : ''}`}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--red)', display: 'inline-block', animation: 'pulse 1.2s ease-in-out infinite' }} />
            Ao vivo
          </Link>
          <Link href={filterHref(filter === 'scheduled' ? '' : 'scheduled')} className={`f-tab${filter === 'scheduled' ? ' on' : ''}`}>
            Agendados
          </Link>
        </div>
      </div>

      {/* Card grid */}
      <div className="page-scroll">
        <div className="tips-grid" style={{ padding: '16px 20px' }}>
          {tips.length === 0 ? (
            <div style={{ gridColumn: '1/-1', padding: '40px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
              Nenhuma tip encontrada para este filtro.
            </div>
          ) : tips.map((tip, i) => {
            const isElite = tip.ev >= 0.10;
            const isLive  = i < 2; // mock: primeiros 2 são "ao vivo"
            const radius  = 12;
            const circum  = 2 * Math.PI * radius;
            const confOffset = circum - (tip.confidence / 100) * circum;
            const confColor  = tip.confidence >= 75 ? 'var(--lime)' : tip.confidence >= 60 ? 'var(--green)' : 'var(--muted)';
            const kelly = kellyStake(tip.probability, tip.odd);
            const matchParts = tip.matchLabel.replace(/^[^\s]+\s/, '').split(/ × | vs /i);
            const home = matchParts[0]?.trim() ?? '';
            const away = matchParts[1]?.trim() ?? '';
            const dotColor = SPORT_DOTS[tip.sport] ?? '#8A8780';

            return (
              <div key={tip.id} className={`tip-card${isElite ? ' elite' : ''}`}>
                {/* Head */}
                <div className="tc-head">
                  <div className="tc-league">
                    <span className="tc-league-dot" style={{ background: dotColor }} />
                    {tip.league}
                  </div>
                  <div className="tc-status">
                    {isLive ? (
                      <div className="tc-live">
                        <span className="tc-dot-live" />
                        67&apos;
                      </div>
                    ) : (
                      <span className="tc-time">{formatTimeBRT(tip.expiresAt)}</span>
                    )}
                  </div>
                </div>

                {/* Match */}
                <div className="tc-match">
                  <div className="tc-teams">
                    {home}
                    {away && <span>{away}</span>}
                  </div>
                  <div className="tc-tip-row">
                    <div>
                      <div className="tc-tip-label">Aposta</div>
                      <div className="tc-tip">{tip.selection}</div>
                    </div>
                    <div className="tc-odd-wrap">
                      <div className="tc-odd-label">Melhor odd</div>
                      <div className="tc-odd">{tip.odd.toFixed(2)}</div>
                      <div className="tc-house">{tip.book}</div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="tc-foot">
                  <div className={`tc-ev-pill ${evClass(tip.ev)}`}>
                    EV {sanitizeEV(tip.ev) >= 0 ? '+' : ''}{(sanitizeEV(tip.ev) * 100).toFixed(1)}%
                  </div>
                  <div className="tc-conf">
                    <div className="tc-conf-ring">
                      <svg viewBox="0 0 32 32" width="32" height="32" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="16" cy="16" r={radius} fill="none" stroke="var(--border)" strokeWidth="3" />
                        <circle cx="16" cy="16" r={radius} fill="none" stroke={confColor} strokeWidth="3"
                          strokeDasharray={circum} strokeDashoffset={confOffset} strokeLinecap="round" />
                      </svg>
                      <div className="tc-conf-val" style={{ color: confColor }}>{tip.confidence}</div>
                    </div>
                    <div className="tc-kelly">Kelly: <span>{kelly}</span></div>
                  </div>
                </div>

                {/* Actions */}
                <div className="tc-actions">
                  <a href={tip.affiliateUrl} target="_blank" rel="sponsored noopener noreferrer"
                    className="tc-btn tc-btn-lime">
                    Apostar →
                  </a>
                  <Link href={`/${locale}/banca/apostas?tipId=${tip.id}`}
                    className="tc-btn tc-btn-ghost">
                    + Banca
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
