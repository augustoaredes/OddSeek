import type React from 'react';
import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { getEvents } from '@/lib/odds/fetcher';
import type { Sport } from '@/lib/odds/types';
import { calculateEV } from '@/lib/analytics/ev';
import { formatTimeBRT } from '@/lib/utils/date';

const SPORT_ICONS: Record<Sport, string> = {
  football:   '⚽',
  basketball: '🏀',
  tennis:     '🎾',
  mma:        '🥊',
  baseball:   '⚾',
  hockey:     '🏒',
};

export default async function OddsPage() {
  const locale = await getLocale();
  const events = await getEvents();

  const liveEvents = events.filter(e => e.status === 'live');
  const scheduled  = events.filter(e => e.status === 'scheduled');

  // Compute best EV per event across all selections
  function bestEV(event: typeof events[0]) {
    let best = -Infinity;
    for (const mkt of event.markets) {
      for (const sel of mkt.selections) {
        const topOdd = Math.max(...sel.books.map(b => b.odd));
        const ev = calculateEV(sel.consensusProb, topOdd);
        if (ev > best) best = ev;
      }
    }
    return best;
  }

  // Get winner market selections (H/D/A or primary)
  function winnerSelections(event: typeof events[0]) {
    const mkt = event.markets.find(m => m.market === 'match_winner');
    return mkt?.selections ?? event.markets[0]?.selections ?? [];
  }

  const evColor = (ev: number) =>
    ev >= 0.10 ? 'var(--lime)' : ev >= 0.05 ? 'var(--green)' : ev > 0 ? 'var(--amber)' : 'var(--muted)';

  function EventSection({ list, title, live }: { list: typeof events; title: string; live?: boolean }) {
    return (
      <section style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          {live && <span className="live-dot" />}
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: live ? 'var(--red)' : 'var(--muted)',
          }}>
            {title}
          </span>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>
            — {list.length} evento{list.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="table-wrap">
        <div className="card" style={{ overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '56px 1fr 180px 60px 48px',
            gap: 12, padding: '9px 18px',
            background: 'var(--s2)', borderBottom: '1px solid var(--border)',
            fontSize: 10, fontWeight: 700, letterSpacing: '0.07em',
            textTransform: 'uppercase', color: 'var(--muted)',
          }}>
            <div>Hora</div>
            <div>Partida</div>
            <div style={{ textAlign: 'center' }}>Odds (H · D · A)</div>
            <div style={{ textAlign: 'center' }}>Melhor EV</div>
            <div />
          </div>

          {list.map((event, i) => {
            const ev = bestEV(event);
            const sels = winnerSelections(event);
            const selCount = Math.min(sels.length, 3);
            return (
              <Link
                key={event.id}
                href={`/${locale}/odds/${event.id}`}
                style={{ textDecoration: 'none' }}
              >
                <div
                  className="tip-row"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '56px 1fr 180px 60px 48px',
                    gap: 12, padding: '11px 18px',
                    borderBottom: i < list.length - 1 ? '1px solid var(--border)' : 'none',
                    alignItems: 'center',
                  }}
                >
                  {/* Time / Live */}
                  <div style={{ fontSize: 11, color: event.status === 'live' ? 'var(--red)' : 'var(--muted)', fontWeight: event.status === 'live' ? 700 : 400, letterSpacing: event.status === 'live' ? '0.05em' : 0 }}>
                    {event.status === 'live'
                      ? <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span className="live-dot" />{event.elapsed}&apos;</span>
                      : formatTimeBRT(event.startsAt, event.status, event.elapsed)
                    }
                  </div>

                  {/* Match */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>
                      {SPORT_ICONS[event.sport]} {event.home} <span style={{ color: 'var(--dim)', fontWeight: 400 }}>×</span> {event.away}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2, fontStyle: 'italic' }}>{event.league}</div>
                  </div>

                  {/* H/D/A odds chips */}
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                    {sels.slice(0, selCount).map(sel => {
                      const best = sel.books.reduce((a, b) => b.odd > a.odd ? b : a, sel.books[0]);
                      const selEV = calculateEV(sel.consensusProb, best?.odd ?? 0);
                      const isValue = selEV > 0;
                      return (
                        <div key={sel.label} style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center',
                          background: isValue ? 'oklch(80% 0.3 115 / 0.10)' : 'var(--s2)',
                          border: `1px solid ${isValue ? 'oklch(80% 0.3 115 / 0.3)' : 'var(--border)'}`,
                          borderRadius: 6, padding: '4px 8px', minWidth: 46,
                        }}>
                          <div style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1 }}>
                            {sel.label.length > 6 ? sel.label.slice(0, 4) : sel.label}
                          </div>
                          <div style={{
                            fontFamily: 'var(--font-cond)', fontSize: 15, fontWeight: 900,
                            color: isValue ? 'var(--lime)' : 'var(--text)', lineHeight: 1.1,
                            letterSpacing: '-0.01em',
                          }}>
                            {best?.odd.toFixed(2) ?? '—'}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Best EV */}
                  <div style={{ textAlign: 'center' }}>
                    {ev > -Infinity && (
                      <span style={{
                        display: 'inline-block',
                        fontSize: 11, fontWeight: 800,
                        color: evColor(ev),
                        background: `${evColor(ev)}18`,
                        border: `1px solid ${evColor(ev)}44`,
                        borderRadius: 5, padding: '3px 6px',
                        fontFamily: 'var(--font-cond)',
                      }}>
                        {ev >= 0 ? '+' : ''}{(ev * 100).toFixed(1)}%
                      </span>
                    )}
                  </div>

                  {/* Arrow */}
                  <div style={{ textAlign: 'right', color: 'var(--dim)', fontSize: 13 }}>→</div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      </section>
    );
  }

  // Top EV events for sidebar
  const topEV = [...events]
    .map(e => ({ event: e, ev: bestEV(e) }))
    .filter(x => x.ev > 0)
    .sort((a, b) => b.ev - a.ev)
    .slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── KPIs ────────────────────────────────────────── */}
      <div className="kpi-row">
        {[
          { label: 'Eventos hoje',  value: events.length,                                            accent: 'var(--lime)'  },
          { label: 'Ao vivo',       value: liveEvents.length,                                        accent: 'var(--red)'   },
          { label: 'Com EV+',       value: events.filter(e => bestEV(e) > 0).length,                 accent: 'var(--green)' },
          { label: 'Mercados',      value: events.reduce((s, e) => s + e.markets.length, 0),          accent: 'var(--blue)'  },
        ].map(s => (
          <div key={s.label} className="kpi" style={{ '--kpi-accent': s.accent } as React.CSSProperties}>
            <div className="kpi-label">{s.label}</div>
            <div className="kpi-val" style={{ color: s.accent }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── Filters ─────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        <button className="stab on">Todos</button>
        {(['football', 'basketball', 'tennis', 'mma'] as Sport[]).map(sport => (
          <button key={sport} className="stab">
            {SPORT_ICONS[sport]} {sport === 'football' ? 'Futebol' : sport === 'basketball' ? 'Basquete' : sport === 'tennis' ? 'Tênis' : 'MMA'}
          </button>
        ))}
        <span style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px', flexShrink: 0 }} />
        <button className="stab on">Ao vivo</button>
        <button className="stab">Agendados</button>
        <button className="stab">EV+</button>
      </div>

      {/* ── Main: events + sidebar ──────────────────────── */}
      <div className="page-grid" style={{ '--pg-cols': '1fr 252px', gap: 14 } as React.CSSProperties}>

        {/* Events */}
        <div>
          {liveEvents.length > 0 && (
            <EventSection list={liveEvents} title="Ao Vivo" live />
          )}
          <EventSection list={scheduled} title="Próximos" />
        </div>

        {/* Sidebar */}
        <div className="page-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Top EV */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="card-head">
              <div className="card-title">Melhores EV</div>
              <span className="ev-badge lime">{topEV.length}</span>
            </div>
            {topEV.map(({ event, ev }, i) => (
              <Link key={event.id} href={`/${locale}/odds/${event.id}`} style={{ textDecoration: 'none' }}>
                <div className="tip-row" style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 14px',
                  borderBottom: i < topEV.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <span style={{ fontSize: 14 }}>{SPORT_ICONS[event.sport]}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {event.home} × {event.away}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--muted)' }}>{event.league}</div>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 800, color: evColor(ev),
                    fontFamily: 'var(--font-cond)',
                  }}>
                    +{(ev * 100).toFixed(1)}%
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Guide */}
          <div className="card" style={{ padding: '14px 16px' }}>
            <div className="card-title" style={{ marginBottom: 10 }}>Como ler as odds</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'H · D · A', desc: 'Casa · Empate · Fora — melhor odd disponível em qualquer casa' },
                { label: 'EV+',       desc: 'Expected Value positivo — a odd supera a probabilidade real estimada' },
                { label: 'Lime',      desc: 'Linha destacada = melhor oportunidade no mercado' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--lime)', fontFamily: 'var(--font-cond)', letterSpacing: '0.04em', flexShrink: 0, marginTop: 1 }}>
                    {item.label}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>{item.desc}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
