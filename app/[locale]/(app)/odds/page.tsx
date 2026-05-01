import type React from 'react';
import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { getEvents } from '@/lib/odds/fetcher';
import type { Sport } from '@/lib/odds/types';
import { calculateEV } from '@/lib/analytics/ev';
import { sanitizeEV } from '@/lib/analytics/ev';
import { formatTimeBRT } from '@/lib/utils/date';

const SPORT_ICONS: Record<Sport, string> = {
  football:   '⚽',
  basketball: '🏀',
  tennis:     '🎾',
  mma:        '🥊',
  baseball:   '⚾',
  hockey:     '🏒',
};

const SPORT_LABELS: Record<string, string> = {
  football:   'Futebol',
  basketball: 'Basquete',
  tennis:     'Tênis',
  mma:        'MMA',
};

interface Props {
  searchParams: Promise<{ sport?: string; filter?: string; league?: string }>;
}

export default async function OddsPage({ searchParams }: Props) {
  const locale  = await getLocale();
  const sp      = await searchParams;
  const sport   = sp.sport  ?? 'all';
  const filter  = sp.filter ?? '';
  const league  = sp.league ?? 'all';

  const allEvents = await getEvents();

  // Apply sport filter
  let events = sport === 'all' ? allEvents : allEvents.filter(e => e.sport === sport);

  // Unique leagues for current sport (for filter pills)
  const leagues = ['all', ...Array.from(new Set(events.map(e => e.league))).sort()];

  // Apply league filter
  if (league !== 'all') events = events.filter(e => e.league === league);

  // Apply status/ev filter
  if (filter === 'live')      events = events.filter(e => e.status === 'live');
  if (filter === 'scheduled') events = events.filter(e => e.status === 'scheduled');
  if (filter === 'ev')        events = events.filter(e => bestEV(e) > 0);

  const liveEvents = events.filter(e => e.status === 'live');
  const scheduled  = events.filter(e => e.status !== 'live');

  function bestEV(event: typeof allEvents[0]) {
    let best = -Infinity;
    for (const mkt of event.markets) {
      for (const sel of mkt.selections) {
        const topOdd = Math.max(...sel.books.map(b => b.odd));
        const ev = sanitizeEV(calculateEV(sel.consensusProb, topOdd));
        if (ev > best) best = ev;
      }
    }
    return best === -Infinity ? 0 : best;
  }

  function winnerSelections(event: typeof allEvents[0]) {
    const mkt = event.markets.find(m => m.market === 'match_winner');
    return mkt?.selections ?? event.markets[0]?.selections ?? [];
  }

  const evColor = (ev: number) =>
    ev >= 0.10 ? 'var(--lime)' : ev >= 0.05 ? 'var(--green)' : ev > 0 ? 'var(--amber)' : 'var(--muted)';

  function buildOddsHref(patch: { sport?: string; filter?: string; league?: string }) {
    const p = new URLSearchParams();
    const s = patch.sport  ?? sport;
    const f = patch.filter ?? filter;
    const l = patch.league ?? league;
    if (s !== 'all') p.set('sport',  s);
    if (f)           p.set('filter', f);
    if (l !== 'all') p.set('league', l);
    const q = p.toString();
    return `/${locale}/odds${q ? `?${q}` : ''}`;
  }

  function tabHref(newSport: string) {
    return buildOddsHref({ sport: newSport, league: 'all' });
  }

  function filterHref(newFilter: string) {
    return buildOddsHref({ filter: newFilter === filter ? '' : newFilter });
  }

  function leagueHref(newLeague: string) {
    return buildOddsHref({ league: newLeague });
  }

  function EventSection({ list, title, live }: { list: typeof events; title: string; live?: boolean }) {
    if (list.length === 0) return null;
    return (
      <section style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          {live && <span className="live-dot" />}
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: live ? 'var(--red)' : 'var(--text)',
          }}>
            {title}
          </span>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>
            — {list.length} evento{list.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="table-wrap">
        <div className="card" style={{ overflow: 'hidden' }}>
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
              <Link key={event.id} href={`/${locale}/odds/${event.id}`} style={{ textDecoration: 'none' }}>
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
                  <div style={{ fontSize: 11, color: event.status === 'live' ? 'var(--red)' : 'var(--muted)', fontWeight: event.status === 'live' ? 700 : 400 }}>
                    {event.status === 'live'
                      ? <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span className="live-dot" />{event.elapsed}&apos;</span>
                      : formatTimeBRT(event.startsAt, event.status, event.elapsed)
                    }
                  </div>

                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>
                      {SPORT_ICONS[event.sport]} {event.home} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>×</span> {event.away}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2, fontStyle: 'italic' }}>{event.league}</div>
                  </div>

                  <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                    {sels.slice(0, selCount).map(sel => {
                      const best = sel.books.reduce((a, b) => b.odd > a.odd ? b : a, sel.books[0]);
                      const selEV = sanitizeEV(calculateEV(sel.consensusProb, best?.odd ?? 0));
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
                          }}>
                            {best?.odd.toFixed(2) ?? '—'}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ textAlign: 'center' }}>
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
                  </div>

                  <div style={{ textAlign: 'right', color: 'var(--muted)', fontSize: 13 }}>→</div>
                </div>
              </Link>
            );
          })}
        </div>
        </div>
      </section>
    );
  }

  const topEV = [...allEvents]
    .map(e => ({ event: e, ev: bestEV(e) }))
    .filter(x => x.ev > 0)
    .sort((a, b) => b.ev - a.ev)
    .slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* KPIs */}
      <div className="kpi-row">
        {[
          { label: 'Eventos hoje',  value: allEvents.length,                                               accent: 'var(--lime)'  },
          { label: 'Ao vivo',       value: allEvents.filter(e => e.status === 'live').length,              accent: 'var(--red)'   },
          { label: 'Com EV+',       value: allEvents.filter(e => bestEV(e) > 0).length,                   accent: 'var(--green)' },
          { label: 'Mercados',      value: allEvents.reduce((s, e) => s + e.markets.length, 0),            accent: 'var(--blue)'  },
        ].map(s => (
          <div key={s.label} className="kpi" style={{ '--kpi-accent': s.accent } as React.CSSProperties}>
            <div className="kpi-label">{s.label}</div>
            <div className="kpi-val" style={{ color: s.accent }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Linha 1: esporte + status */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <Link href={tabHref('all')} className={`f-tab${sport === 'all' ? ' on' : ''}`}>Todos</Link>
          {(['football', 'basketball', 'tennis', 'mma'] as Sport[]).map(s => (
            <Link key={s} href={tabHref(s)} className={`f-tab${sport === s ? ' on' : ''}`}>
              {SPORT_ICONS[s]} {SPORT_LABELS[s]}
            </Link>
          ))}
          <span className="f-sep" />
          <Link href={filterHref('live')} className={`f-tab${filter === 'live' ? ' on' : ''}`}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--red)', display: 'inline-block', animation: 'pulse 1.2s ease-in-out infinite' }} />
            Ao vivo
          </Link>
          <Link href={filterHref('scheduled')} className={`f-tab${filter === 'scheduled' ? ' on' : ''}`}>Agendados</Link>
          <Link href={filterHref('ev')} className={`f-tab ev-tab${filter === 'ev' ? ' on' : ''}`}>EV+</Link>
        </div>

        {/* Linha 2: campeonato/liga */}
        {leagues.length > 2 && (
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
            {leagues.map(lg => (
              <Link key={lg} href={leagueHref(lg)}
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

      {/* Main content */}
      <div className="page-grid" style={{ '--pg-cols': '1fr 252px', gap: 14 } as React.CSSProperties}>
        <div>
          {events.length === 0 ? (
            <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
              Nenhum evento encontrado para este filtro.
            </div>
          ) : (
            <>
              {liveEvents.length > 0 && <EventSection list={liveEvents} title="Ao Vivo" live />}
              {scheduled.length > 0  && <EventSection list={scheduled}  title="Próximos" />}
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="page-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="card-head">
              <div className="card-title">Melhores EV</div>
              <span className="ev-badge lime">{topEV.length}</span>
            </div>
            {topEV.length === 0 ? (
              <div style={{ padding: '16px', fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>Nenhum EV+ agora</div>
            ) : topEV.map(({ event, ev }, i) => (
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
                  <span style={{ fontSize: 11, fontWeight: 800, color: evColor(ev), fontFamily: 'var(--font-cond)' }}>
                    +{(ev * 100).toFixed(1)}%
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="card" style={{ padding: '14px 16px' }}>
            <div className="card-title" style={{ marginBottom: 10 }}>Como ler as odds</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'H · D · A', desc: 'Casa · Empate · Fora — melhor odd disponível' },
                { label: 'EV+',       desc: 'Expected Value positivo — a odd supera a prob. real estimada' },
                { label: 'Lime',      desc: 'Linha destacada = melhor oportunidade' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--lime)', fontFamily: 'var(--font-cond)', letterSpacing: '0.04em', flexShrink: 0, marginTop: 1 }}>
                    {item.label}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text)', opacity: 0.7, lineHeight: 1.5 }}>{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
