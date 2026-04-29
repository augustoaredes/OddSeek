import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations, getLocale } from 'next-intl/server';
import { getTips } from '@/lib/tips/fetcher';
import { formatTimeBRT } from '@/lib/utils/date';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'dashboard' });
  return { title: t('title') };
}

const SPORT_DOTS: Record<string, string> = {
  football:   '#4ade80',
  basketball: '#a78bfa',
  tennis:     '#fcd34d',
  mma:        '#f87171',
};

const SPORT_FILTERS = [
  { value: 'all',        label: 'Todos' },
  { value: 'football',   label: 'Futebol',  dot: '#4ade80' },
  { value: 'basketball', label: 'Basquete', dot: '#a78bfa' },
  { value: 'tennis',     label: 'Tênis',    dot: '#fcd34d' },
  { value: 'mma',        label: 'MMA',      dot: '#f87171' },
];

const staticOdds = [
  { house: 'Bet365',      fill: 100, val: '2.10', best: true,  ev: '+8.2%' },
  { house: 'Betano',      fill: 93,  val: '1.95', best: false, ev: null },
  { house: 'Sportingbet', fill: 90,  val: '1.92', best: false, ev: null },
  { house: '1xBet',       fill: 85,  val: '1.88', best: false, ev: null },
];

const staticAlerts = [
  { msg: 'Odd subiu para melhor nível nas últimas 2h',    time: '2m',  color: 'var(--green)' },
  { msg: 'Nova análise EV+ identificada em Futebol',      time: '8m',  color: 'var(--lime)'  },
  { msg: 'Escalação confirmada — verificar apostas open', time: '23m', color: 'var(--amber)' },
  { msg: 'Resultado atualizado para aposta encerrada',    time: '1h',  color: 'var(--muted)' },
];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ sport?: string }>;
}) {
  const locale      = await getLocale();
  const sp          = await searchParams;
  const sportFilter = sp.sport ?? 'all';

  const allTips = await getTips();
  const tips    = sportFilter === 'all' ? allTips : allTips.filter(t => t.sport === sportFilter);

  const positiveEV = allTips.filter(t => t.ev > 0);
  const elite      = allTips.filter(t => t.confidenceBand === 'elite');
  const bestTip    = allTips[0] ?? null;
  const avgEV      = positiveEV.length > 0 ? positiveEV.reduce((s, t) => s + t.ev, 0) / positiveEV.length : 0;
  const bestOdd    = allTips.length > 0 ? allTips.reduce((b, t) => t.odd > b.odd ? t : b, allTips[0]) : null;

  const displayTips = tips.slice(0, 12);

  return (
    <div className="page-full">

      {/* ── Stat cards ── */}
      <div className="stat-cards">
        <div className="stat-card">
          <div className="sc-label">Tips ativas</div>
          <div className="sc-val" style={{ color: 'var(--lime)' }}>{allTips.length}</div>
          <div className="sc-sub">↑ {positiveEV.length} com EV+</div>
        </div>
        <div className="stat-card">
          <div className="sc-label">EV médio</div>
          <div className="sc-val" style={{ color: 'var(--green)' }}>
            {avgEV > 0 ? `+${(avgEV * 100).toFixed(1)}%` : '—'}
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
      <div className="filter-bar" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', marginLeft: 0 }}>
        <div style={{ display: 'flex', gap: 6, padding: '0 0', overflowX: 'auto' }}>
          {SPORT_FILTERS.map(f => {
            const href = f.value === 'all'
              ? `/${locale}/dashboard`
              : `/${locale}/dashboard?sport=${f.value}`;
            return (
              <Link key={f.value} href={href}
                className={`f-tab${sportFilter === f.value ? ' on' : ''}`}>
                {f.dot && <span className="f-sport-dot" style={{ background: f.dot }} />}
                {f.label}
              </Link>
            );
          })}
          <span className="f-sep" />
          <Link href={`/${locale}/tips?filter=elite`} className="f-tab ev-tab">
            EV+
          </Link>
          <span style={{ marginLeft: 'auto', paddingRight: 4, display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--red)', fontFamily: 'var(--font-cond)', fontWeight: 700 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--red)', display: 'inline-block', animation: 'pulse 1.2s ease-in-out infinite' }} />
            14 ao vivo
          </span>
        </div>
      </div>

      {/* ── Events table + right panel ── */}
      <div className="dash-layout">

        {/* Events list */}
        <div className="dash-events">
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

            return (
              <Link key={tip.id} href={`/${locale}/tips`}
                className="event-row" style={{ textDecoration: 'none', display: 'grid', gridTemplateColumns: '60px 1fr 148px 120px 56px', alignItems: 'center', padding: '0', minHeight: 58, borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background .12s' }}>

                {/* Time */}
                <div>
                  {isLive ? (
                    <div className="ev-live-badge">
                      <span className="ev-dot-live" />
                      67&apos;
                    </div>
                  ) : (
                    <div className="ev-time">{formatTimeBRT(tip.expiresAt)}</div>
                  )}
                </div>

                {/* Match */}
                <div>
                  <div className="ev-sport-tag">
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor, display: 'inline-block' }} />
                    &nbsp;{tip.league}
                  </div>
                  <div className="ev-team-row">
                    <div className="ev-teams">{home}</div>
                  </div>
                  {away && (
                    <div className="ev-team-row">
                      <div className="ev-teams" style={{ opacity: 0.75 }}>{away}</div>
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
                  <div style={{ fontSize: 11, color: 'var(--lime)', fontWeight: 600, fontFamily: 'var(--font-cond)', whiteSpace: 'nowrap' }}>{tip.book}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{tip.market.slice(0, 14)}</div>
                </div>

                {/* EV */}
                <div className="ev-ev">
                  <div className={`ev-badge ${evCls}`}>
                    {tip.ev >= 0 ? '+' : ''}{(tip.ev * 100).toFixed(0)}%
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
        </div>

        {/* Right analysis panel */}
        <div className="dash-right-panel">

          {/* AI Analysis */}
          {bestTip && (
            <div className="rp-block">
              <div className="rp-title">Análise IA</div>
              <div className="ai-rec">
                <div className="ai-rec-label">{bestTip.league}</div>
                <div className="ai-rec-tip">{bestTip.selection}</div>
                {[
                  { label: 'Prob. real',  val: `${(bestTip.probability * 100).toFixed(0)}%`, fill: Math.round(bestTip.probability * 100), color: 'var(--lime)' },
                  { label: 'Prob. impl.', val: `${((1 / bestTip.odd) * 100).toFixed(0)}%`,  fill: Math.round((1 / bestTip.odd) * 100),  color: 'var(--muted)' },
                  { label: 'Confiança',   val: `${bestTip.confidence}%`,                     fill: bestTip.confidence,                    color: 'var(--green)' },
                ].map(row => (
                  <div key={row.label} className="ai-prob-row">
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
                    <div className="conf-label">Confiança</div>
                  </div>
                  <div className="conf-best">
                    <div className="conf-odd">{bestTip.odd.toFixed(2)}</div>
                    <div className="conf-where">{bestTip.book}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Odds comparison */}
          <div className="rp-block">
            <div className="rp-title">Comparação de odds</div>
            {staticOdds.map(row => (
              <div key={row.house} className="oc-row">
                <div className="oc-house">{row.house}</div>
                <div className="oc-bar-wrap">
                  <div className={`oc-bar${row.best ? ' best-bar' : ''}`} style={{ width: `${row.fill}%` }} />
                </div>
                <div className="oc-val" style={{ color: row.best ? 'var(--lime)' : 'var(--text)' }}>{row.val}</div>
                {row.ev
                  ? <div className="oc-ev best-ev">{row.ev}</div>
                  : <div className="oc-ev" />
                }
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
