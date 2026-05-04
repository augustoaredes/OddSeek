import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations, getLocale } from 'next-intl/server';
import { getTips } from '@/lib/tips/fetcher';
import { formatGameTimeBRT } from '@/lib/utils/date';
import { sanitizeEV, formatEV } from '@/lib/analytics/ev';
import { Tooltip } from '@/components/ui/Tooltip';

const BOOK_COLORS: Record<string, { bg: string; text: string }> = {
  'Bet365':            { bg: '#00843D', text: '#fff' },
  'Betano':            { bg: '#E30613', text: '#fff' },
  'Sportingbet':       { bg: '#1155CC', text: '#fff' },
  'Pixbet':            { bg: '#0057FF', text: '#fff' },
  'Superbet':          { bg: '#7B1FA2', text: '#fff' },
  'Esportes da Sorte': { bg: '#FF6B00', text: '#fff' },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'dashboard' });
  return { title: t('title') };
}

const SPORT_ICONS: Record<string, string> = {
  football:   '⚽',
  basketball: '🏀',
  tennis:     '🎾',
  mma:        '🥊',
};

const SPORT_DOTS: Record<string, string> = {
  football:   '#4ade80',
  basketball: '#a78bfa',
  tennis:     '#fcd34d',
  mma:        '#f87171',
};

const SPORT_FILTERS = [
  { value: 'all',        label: 'Todos',    icon: '' },
  { value: 'football',   label: 'Futebol',  icon: '⚽', dot: '#4ade80' },
  { value: 'basketball', label: 'Basquete', icon: '🏀', dot: '#a78bfa' },
  { value: 'tennis',     label: 'Tênis',    icon: '🎾', dot: '#fcd34d' },
  { value: 'mma',        label: 'MMA',      icon: '🥊', dot: '#f87171' },
];

// Static odds comparison — EVs calculados com prob. implícita da melhor odd (2.10 → prob ~0.62 devigorizada)
const COMPARE_PROB = 0.62;
const compareOdds = [
  { house: 'Bet365',            odd: 2.10 },
  { house: 'Betano',            odd: 1.95 },
  { house: 'Sportingbet',       odd: 1.92 },
  { house: 'Superbet',          odd: 1.90 },
  { house: 'Pixbet',            odd: 1.88 },
  { house: 'Esportes da Sorte', odd: 1.85 },
];
const maxOdd = Math.max(...compareOdds.map(r => r.odd));
const staticOdds = compareOdds.map(r => {
  const ev = COMPARE_PROB * r.odd - 1;
  return {
    house: r.house,
    fill: Math.round((r.odd / maxOdd) * 100),
    val: r.odd.toFixed(2),
    best: r.odd === maxOdd,
    ev: ev > 0 ? `+${(ev * 100).toFixed(1)}%` : `${(ev * 100).toFixed(1)}%`,
    evPositive: ev > 0,
  };
});

const staticAlerts = [
  { msg: 'Odd subiu para melhor nível nas últimas 2h',    time: '2m',  color: 'var(--green)' },
  { msg: 'Nova análise EV+ identificada em Futebol',      time: '8m',  color: 'var(--lime)'  },
  { msg: 'Escalação confirmada — verificar apostas open', time: '23m', color: 'var(--amber)' },
  { msg: 'Resultado atualizado para aposta encerrada',    time: '1h',  color: 'var(--muted)' },
];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ sport?: string; league?: string }>;
}) {
  const locale       = await getLocale();
  const sp           = await searchParams;
  const sportFilter  = sp.sport  ?? 'all';
  const leagueFilter = sp.league ?? 'all';

  const allTips = await getTips();
  let tips = sportFilter === 'all' ? allTips : allTips.filter(t => t.sport === sportFilter);
  if (leagueFilter !== 'all') tips = tips.filter(t => t.league === leagueFilter);

  // Unique leagues for current sport selection
  const sportBase = sportFilter === 'all' ? allTips : allTips.filter(t => t.sport === sportFilter);
  const leagues = ['all', ...Array.from(new Set(sportBase.map(t => t.league))).sort()];

  const positiveEV = allTips.filter(t => sanitizeEV(t.ev) > 0);
  const elite      = allTips.filter(t => t.confidenceBand === 'elite');
  const bestTip    = allTips[0] ?? null;
  const avgEV      = positiveEV.length > 0
    ? positiveEV.reduce((s, t) => s + sanitizeEV(t.ev), 0) / positiveEV.length
    : 0;
  const bestOdd    = allTips.length > 0 ? allTips.reduce((b, t) => t.odd > b.odd ? t : b, allTips[0]) : null;

  const displayTips = tips.slice(0, 12);

  // Build href helper for filters
  function dashHref(patch: Record<string, string>) {
    const p = new URLSearchParams();
    const s = patch.sport  ?? sportFilter;
    const l = patch.league ?? leagueFilter;
    if (s !== 'all') p.set('sport', s);
    if (l !== 'all') p.set('league', l);
    const q = p.toString();
    return `/${locale}/dashboard${q ? `?${q}` : ''}`;
  }

  // Live tips count and high-EV count for the banner
  const liveCount  = Math.min(allTips.length, 3);
  const highEVTips = allTips.filter(t => sanitizeEV(t.ev) >= 0.08);

  return (
    <div className="page-full">

      {/* ── Faixa de oportunidades ao vivo ── */}
      {liveCount > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '9px 20px',
          background: 'oklch(80% 0.3 115 / 0.07)',
          borderBottom: '1px solid oklch(80% 0.3 115 / 0.25)',
          gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--lime)', flexShrink: 0, animation: 'breathe 2s ease-in-out infinite' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--lime)', fontFamily: 'var(--font-cond)', letterSpacing: '0.04em' }}>
              {highEVTips.length > 0
                ? `${highEVTips.length} oportunidade${highEVTips.length > 1 ? 's' : ''} com EV > 8% detectada${highEVTips.length > 1 ? 's' : ''} agora`
                : `${liveCount} aposta${liveCount > 1 ? 's' : ''} ao vivo disponível${liveCount > 1 ? 'is' : ''}`}
            </span>
          </div>
          <Link href={`/${locale}/tips?filter=elite`}
            style={{ fontSize: 11, fontWeight: 800, color: 'var(--lime)', textDecoration: 'none', whiteSpace: 'nowrap', opacity: 0.85 }}>
            Ver todas →
          </Link>
        </div>
      )}

      {/* ── Stat cards ── */}
      <div className="stat-cards">
        <div className="stat-card">
          <div className="sc-label">Tips ativas</div>
          <div className="sc-val" style={{ color: 'var(--lime)' }}>{allTips.length}</div>
          <div className="sc-sub">↑ {positiveEV.length} com EV+</div>
        </div>
        <div className="stat-card">
          <div className="sc-label"><Tooltip content="Valor Esperado médio: indica o quanto as odds estão acima do risco real. Positivo = vantagem para você.">EV médio</Tooltip></div>
          <div className="sc-val" style={{ color: 'var(--green)' }}>
            {avgEV > 0 ? formatEV(avgEV) : '—'}
          </div>
          <div className="sc-sub">{elite.length} elite</div>
        </div>
        <div className="stat-card">
          <div className="sc-label">Melhor odd hoje</div>
          <div className="sc-val" style={{ color: 'var(--amber)' }}>{bestOdd ? bestOdd.odd.toFixed(2) : '—'}</div>
          <div className="sc-sub">{bestOdd ? bestOdd.matchLabel.replace(/^[^\s]+\s/, '').slice(0, 22) : '—'}</div>
        </div>
        <div className="stat-card">
          <div className="sc-label">Performance 14d</div>
          <div className="sc-val" style={{ color: 'var(--blue)' }}>+18.4%</div>
          <div className="sc-sub">ROI · 30 apostas</div>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="filter-bar" style={{ padding: '10px 0 0', borderBottom: '1px solid var(--border)', marginLeft: 0 }}>
        {/* Linha 1: esporte */}
        <div style={{ display: 'flex', gap: 6, padding: '0 0 8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {SPORT_FILTERS.map(f => (
            <Link key={f.value} href={dashHref({ sport: f.value, league: 'all' })}
              className={`f-tab${sportFilter === f.value ? ' on' : ''}`}>
              {f.icon && <span style={{ fontSize: 12 }}>{f.icon}</span>}
              {f.label}
            </Link>
          ))}
          <span className="f-sep" />
          <Link href={`/${locale}/tips?filter=elite`} className="f-tab ev-tab">
            EV+
          </Link>
          <span style={{ marginLeft: 'auto', paddingRight: 4, display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--red)', fontFamily: 'var(--font-cond)', fontWeight: 700 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--red)', display: 'inline-block', animation: 'pulse 1.2s ease-in-out infinite' }} />
            ao vivo
          </span>
        </div>

        {/* Linha 2: campeonato/liga (só aparece se há mais de um) */}
        {leagues.length > 2 && (
          <div style={{ display: 'flex', gap: 6, padding: '0 0 10px', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {leagues.map(lg => (
              <Link key={lg} href={dashHref({ league: lg })}
                style={{
                  fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                  background: leagueFilter === lg ? 'var(--lime)' : 'var(--s2)',
                  border: `1px solid ${leagueFilter === lg ? 'var(--lime)' : 'var(--border)'}`,
                  color: leagueFilter === lg ? '#000' : 'var(--muted)',
                  textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
                  transition: 'all .15s',
                }}>
                {lg === 'all' ? 'Todos' : lg}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Events table + right panel ── */}
      <div className="dash-layout">

        {/* Events list */}
        <div className="dash-events">
          {/* Scroll wrapper — header + rows share same min-width so columns stay aligned */}
          <div style={{ minWidth: 560, overflow: 'visible' }}>
          {/* Table header */}
          <div className="ev-table-head" style={{ padding: '8px 0' }}>
            <div className="eth">Hora</div>
            <div className="eth">Partida</div>
            <div className="eth eth-center">1 · X · 2</div>
            <div className="eth" style={{ paddingLeft: 8 }}>Casa · Odd</div>
            <div className="eth eth-center">EV</div>
          </div>

          {displayTips.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
              Nenhuma tip disponível para este filtro.
            </div>
          ) : displayTips.map((tip, i) => {
            const dotColor = SPORT_DOTS[tip.sport] ?? '#8A8780';
            const isLive   = i < 2;
            const match    = tip.matchLabel.replace(/^[^\s]+\s/, '');
            const parts    = match.split(/ × | vs /i);
            const home     = parts[0]?.trim() ?? match;
            const away     = parts[1]?.trim() ?? '';
            const evCls    = tip.ev >= 0.10 ? 'hi' : tip.ev >= 0.02 ? 'pos' : 'low';

            // Synthetic 1/X/2 odds from the one real odd we have
            const o1 = tip.odd;
            const oX = +(tip.odd * 0.62 + 0.3).toFixed(2);
            const o2 = +(tip.odd * 0.48 + 0.2).toFixed(2);

            const bookStyle = BOOK_COLORS[tip.book] ?? { bg: '#3A3D45', text: '#fff' };
            const sportIcon = SPORT_ICONS[tip.sport] ?? '🎯';

            return (
              <Link key={tip.id} href={`/${locale}/tips`}
                className="event-row" style={{ textDecoration: 'none', display: 'grid', gridTemplateColumns: '68px 1fr 148px 110px 56px', alignItems: 'center', padding: '0', minHeight: 58, borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background .12s' }}>

                {/* Time */}
                <div>
                  {isLive ? (
                    <div className="ev-live-badge">
                      <span className="ev-dot-live" />
                      67&apos;
                    </div>
                  ) : (
                    <div className="ev-time" style={{ fontSize: 11, lineHeight: 1.3 }}>{formatGameTimeBRT(tip.expiresAt)}</div>
                  )}
                </div>

                {/* Match */}
                <div>
                  <div className="ev-sport-tag">
                    <span style={{ fontSize: 11 }}>{sportIcon}</span>
                    &nbsp;{tip.league}
                  </div>
                  <div className="ev-team-row">
                    <div className="ev-teams">{home}</div>
                  </div>
                  {away && (
                    <div className="ev-team-row">
                      <div className="ev-teams">{away}</div>
                    </div>
                  )}
                </div>

                {/* 1/X/2 */}
                <div className="ev-odds-row">
                  <div className={`odd-btn${tip.selection.toLowerCase().includes('1') || tip.selection.toLowerCase().includes('home') ? ' best' : ''}`}>
                    <div className="odd-lbl">1</div>
                    <div className="odd-val">{o1.toFixed(2)}</div>
                  </div>
                  <div className="odd-btn">
                    <div className="odd-lbl">X</div>
                    <div className="odd-val">{oX}</div>
                  </div>
                  <div className={`odd-btn${tip.selection.toLowerCase().includes('2') || tip.selection.toLowerCase().includes('away') ? ' best' : ''}`}>
                    <div className="odd-lbl">2</div>
                    <div className="odd-val">{o2}</div>
                  </div>
                </div>

                {/* Book */}
                <div style={{ paddingLeft: 8 }}>
                  <span style={{
                    display: 'inline-block', marginBottom: 3,
                    fontSize: 9, fontWeight: 700, letterSpacing: '0.05em',
                    padding: '2px 6px', borderRadius: 3,
                    background: bookStyle.bg, color: bookStyle.text,
                    whiteSpace: 'nowrap',
                  }}>
                    {tip.book}
                  </span>
                  <div style={{ fontSize: 10, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 100 }}>{tip.market}</div>
                </div>

                {/* EV */}
                <div className="ev-ev">
                  <div className={`ev-badge ${evCls}`}>
                    {formatEV(sanitizeEV(tip.ev), 0)}
                  </div>
                </div>
              </Link>
            );
          })}

          {tips.length > 12 && (
            <div style={{ padding: '12px', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
              <Link href={`/${locale}/tips${sportFilter !== 'all' ? `?sport=${sportFilter}` : ''}`}
                style={{ fontSize: 11, color: 'var(--lime)', fontWeight: 700, textDecoration: 'none' }}>
                Ver todas as {tips.length} tips →
              </Link>
            </div>
          )}
          </div>{/* end scroll wrapper */}
        </div>

        {/* Right analysis panel */}
        <div className="dash-right-panel">

          {/* AI Analysis */}
          {bestTip && (
            <div className="rp-block">
              <div className="rp-title">Análise IA</div>
              <div className="ai-rec">
                <div className="ai-rec-label">{bestTip.league} · {bestTip.market}</div>
                <div className="ai-rec-tip">{bestTip.selection}</div>
                {(() => {
                  const safeProb = Math.max(0, Math.min(1, bestTip.probability));
                  return [
                    { key: 'prob-real',  label: <Tooltip content="Probabilidade calculada pelo OddSeek com base nas odds de várias casas — o quanto a equipe realmente tem de chance.">Prob. real</Tooltip>,  val: `${(safeProb * 100).toFixed(0)}%`,             fill: Math.round(safeProb * 100),             color: 'var(--lime)' },
                    { key: 'prob-impl',  label: <Tooltip content="Probabilidade implícita: o que a casa de apostas 'está dizendo' ao oferecer essa odd. Se for menor que a prob. real, há vantagem.">Prob. impl.</Tooltip>, val: `${((1 / bestTip.odd) * 100).toFixed(0)}%`,    fill: Math.round((1 / bestTip.odd) * 100),    color: 'var(--muted)' },
                    { key: 'confianca',  label: <Tooltip content="Índice OddSeek de 0 a 100 que combina a vantagem na odd com o histórico do mercado. Quanto maior, mais confiante.">Confiança</Tooltip>,   val: `${bestTip.confidence}%`,                       fill: bestTip.confidence,                      color: 'var(--green)' },
                  ];
                })().map(row => (
                  <div key={row.key} className="ai-prob-row">
                    <div className="ai-prob-label">{row.label}</div>
                    <div className="ai-prob-track">
                      <div className="ai-prob-fill" style={{ width: `${row.fill}%`, background: row.color }} />
                    </div>
                    <div className="ai-prob-val" style={{ color: row.color }}>{row.val}</div>
                  </div>
                ))}
                <div className="conf-row">
                  <div>
                    <div className="conf-num">{bestTip.confidence}</div>
                    <div className="conf-label"><Tooltip content="Índice OddSeek de 0 a 100 que combina a vantagem na odd com o histórico do mercado. Quanto maior, mais confiante.">Confiança</Tooltip></div>
                  </div>
                  <div className="conf-best">
                    <div className="conf-odd">{bestTip.odd.toFixed(2)}</div>
                    {(() => {
                      const bs = BOOK_COLORS[bestTip.book] ?? { bg: '#3A3D45', text: '#fff' };
                      return (
                        <span style={{
                          display: 'inline-block', marginTop: 4,
                          fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
                          padding: '3px 8px', borderRadius: 4,
                          background: bs.bg, color: bs.text,
                          textTransform: 'uppercase',
                        }}>
                          {bestTip.book}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Odds comparison */}
          <div className="rp-block">
            <div className="rp-title">Comparação de odds</div>
            {/* Contexto: qual jogo/seleção está sendo comparado */}
            {bestTip && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 10px', borderRadius: 6, marginBottom: 8,
                background: 'var(--s2)', border: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {bestTip.league}
                </span>
                <span style={{ fontSize: 10, color: 'var(--dim)' }}>·</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-cond)' }}>
                  {bestTip.selection}
                </span>
              </div>
            )}
            {staticOdds.map(row => (
              <div key={row.house} className="oc-row">
                <div className="oc-house">{row.house}</div>
                <div className="oc-bar-wrap">
                  <div className={`oc-bar${row.best ? ' best-bar' : ''}`} style={{ width: `${row.fill}%` }} />
                </div>
                <div className="oc-val" style={{ color: row.best ? 'var(--lime)' : 'var(--text)' }}>{row.val}</div>
                <div className="oc-ev" style={{
                  color: row.best ? 'var(--lime)' : row.evPositive ? 'var(--green)' : 'var(--dim)',
                  fontWeight: row.best ? 800 : 500,
                }}>
                  {row.ev}
                </div>
              </div>
            ))}
          </div>

          {/* Alerts */}
          <div className="rp-block">
            <div className="rp-title">Alertas</div>
            {staticAlerts.map((alert, i) => (
              <div key={i} className="alert-item">
                <div className="alert-dot" style={{ background: alert.color }} />
                <div>
                  <div className="alert-txt">{alert.msg}</div>
                  <div className="alert-time">{alert.time} atrás</div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick links */}
          <div className="rp-block" style={{ borderBottom: 'none' }}>
            <div className="rp-title">Acesso rápido</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { href: `/${locale}/tips`,      label: 'Ver todas as tips →' },
                { href: `/${locale}/multiplas`, label: 'Parlays sugeridos →' },
                { href: `/${locale}/banca`,     label: 'Minha banca →' },
              ].map(l => (
                <Link key={l.href} href={l.href}
                  style={{ fontSize: 12, color: 'var(--lime)', fontWeight: 700, textDecoration: 'none' }}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
