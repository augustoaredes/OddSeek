import type React from 'react';
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

// 14-day bankroll performance path — viewBox 0 0 440 120, Y inverted
const chartPoints: [number, number][] = [
  [0, 90], [32, 80], [64, 85], [96, 70], [128, 72], [160, 60],
  [192, 65], [224, 52], [256, 55], [288, 44], [320, 38], [352, 30],
  [384, 25], [440, 20],
];
const pathD = chartPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
const fillD = `${pathD} L440,120 L0,120 Z`;
const chartDays = ['14d', '12d', '10d', '8d', '6d', '4d', '2d', 'Hoje'];

const staticOdds = [
  { house: 'Bet365',     fill: 100, val: '2.10', best: true,  ev: 'EV +8.2%' },
  { house: 'Betano',     fill: 93,  val: '1.95', best: false, ev: null },
  { house: 'Sportingbet',fill: 90,  val: '1.92', best: false, ev: null },
  { house: 'KTO',        fill: 85,  val: '1.88', best: false, ev: null },
  { house: 'Blaze',      fill: 83,  val: '1.85', best: false, ev: null },
];

const staticAlerts = [
  { msg: 'Odd do Real Madrid subiu para 2.10 na Bet365',          time: '2m',  cls: 'alert-green' },
  { msg: 'Nova análise: Flamengo × Palmeiras (EV +11.4%)',        time: '8m',  cls: 'alert-lime'  },
  { msg: 'Escalação confirmada: Vinicius Jr. ausente',             time: '23m', cls: 'alert-amber' },
  { msg: 'Djokovic × Alcaraz — resultado atualizado',              time: '1h',  cls: 'alert-dim'   },
];

const SPORT_FILTERS = [
  { value: 'all',        label: 'Todos'    },
  { value: 'football',   label: '⚽ Fut.'   },
  { value: 'basketball', label: '🏀 NBA'   },
  { value: 'tennis',     label: '🎾 Tênis' },
  { value: 'mma',        label: '🥊 MMA'   },
];

const CONF_FILTERS = [
  { value: 'all',   label: 'Todos'         },
  { value: 'elite', label: '⭐ Elite'       },
  { value: 'high',  label: 'Alta conf.'    },
  { value: 'ev',    label: 'EV+'           },
];

const evBandColor = (ev: number) =>
  ev >= 0.10 ? 'lime' : ev >= 0.05 ? 'green' : 'green';

const confColor = (conf: number) =>
  conf >= 75 ? 'var(--lime)' : conf >= 60 ? 'var(--amber)' : 'var(--muted)';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ sport?: string; conf?: string }>;
}) {
  const t = await getTranslations('dashboard');
  const locale = await getLocale();
  const { sport, conf } = await searchParams;

  const allTips = await getTips();

  const sportFilter = sport ?? 'all';
  const confFilter  = conf  ?? 'all';

  let filtered = sportFilter === 'all' ? allTips : allTips.filter(tip => tip.sport === sportFilter);
  if (confFilter === 'elite') filtered = filtered.filter(tip => tip.confidenceBand === 'elite');
  else if (confFilter === 'high') filtered = filtered.filter(tip => tip.confidenceBand === 'high' || tip.confidenceBand === 'elite');
  else if (confFilter === 'ev') filtered = filtered.filter(tip => tip.ev > 0);

  const positiveEV = allTips.filter(t => t.ev > 0);
  const elite      = allTips.filter(t => t.confidenceBand === 'elite');
  const bestOdd    = allTips.length > 0 ? allTips.reduce((b, t) => t.odd > b.odd ? t : b, allTips[0]) : null;
  const avgEV      = positiveEV.length > 0 ? positiveEV.reduce((s, t) => s + t.ev, 0) / positiveEV.length : 0;

  const displayTips = filtered.slice(0, 8);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── KPI Row ──────────────────────────────────────────────── */}
      <div className="kpi-row">
        <div className="kpi" style={{ '--kpi-accent': 'var(--lime)' } as React.CSSProperties}>
          <div className="kpi-label">Tips ativas</div>
          <div className="kpi-val" style={{ color: 'var(--lime)' }}>{allTips.length}</div>
          <div className="kpi-delta"><span className="up">↑ {positiveEV.length}</span> com EV+</div>
        </div>

        <div className="kpi" style={{ '--kpi-accent': 'var(--green)' } as React.CSSProperties}>
          <div className="kpi-label">EV médio</div>
          <div className="kpi-val" style={{ color: 'var(--green)' }}>
            {avgEV > 0 ? `+${(avgEV * 100).toFixed(1)}%` : '—'}
          </div>
          <div className="kpi-delta" style={{ color: 'var(--muted)' }}>{elite.length} elite</div>
        </div>

        <div className="kpi" style={{ '--kpi-accent': 'var(--amber)' } as React.CSSProperties}>
          <div className="kpi-label">Melhor odd hoje</div>
          <div className="kpi-val">{bestOdd ? bestOdd.odd.toFixed(2) : '—'}</div>
          <div className="kpi-delta" style={{ color: 'var(--muted)' }}>
            {bestOdd ? bestOdd.matchLabel.slice(0, 22) : ''}
          </div>
        </div>

        <div className="kpi" style={{ '--kpi-accent': 'var(--blue)' } as React.CSSProperties}>
          <div className="kpi-label">{t('active_tips')}</div>
          <div className="kpi-val">{positiveEV.length}</div>
          <div className="kpi-delta"><span className="up">↑ {elite.length}</span> elite</div>
        </div>
      </div>

      {/* ── Main grid ────────────────────────────────────────────── */}
      <div className="main-grid">

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Predictions */}
          <div className="card">
            <div className="card-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="card-title">{t('predictions')}</div>
                <span className="ev-badge lime">{filtered.length} tips</span>
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {SPORT_FILTERS.map(s => {
                  const href = `?sport=${s.value}${confFilter !== 'all' ? `&conf=${confFilter}` : ''}`;
                  return (
                    <Link key={s.value} href={href}
                      className={`tab${sportFilter === s.value ? ' on' : ''}`}
                      style={{ textDecoration: 'none' }}>
                      {s.label}
                    </Link>
                  );
                })}
                <span style={{ width: 1, background: 'var(--border)', margin: '0 2px', alignSelf: 'stretch' }} />
                {CONF_FILTERS.slice(2).map(c => {
                  const href = `?${sportFilter !== 'all' ? `sport=${sportFilter}&` : ''}conf=${c.value}`;
                  return (
                    <Link key={c.value} href={href}
                      className={`tab${confFilter === c.value ? ' on' : ''}`}
                      style={{ textDecoration: 'none' }}>
                      {c.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {displayTips.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                Nenhuma tip encontrada para este filtro.
              </div>
            ) : (
              displayTips.map((tip) => (
                <div key={tip.id} className="pred-item">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="pred-teams">{tip.matchLabel}</div>
                    <div className="pred-sub">
                      <span className="league-dot" style={{ background: 'var(--muted)', animation: 'none' }} />
                      {tip.league} · {formatTimeBRT(tip.expiresAt)}
                    </div>
                  </div>
                  <div className="market-tag">{tip.selection}</div>
                  <span className={`ev-badge ${evBandColor(tip.ev)}`}>
                    {tip.ev > 0 ? '+' : ''}{(tip.ev * 100).toFixed(1)}%
                  </span>
                  <div className="pred-odd" style={{ color: confColor(tip.confidence) }}>
                    {tip.odd.toFixed(2)}
                  </div>
                  <ConfidenceRing value={tip.confidence} color={confColor(tip.confidence)} />
                </div>
              ))
            )}

            {filtered.length > 8 && (
              <div style={{ padding: '10px 16px', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
                <Link href={`/${locale}/tips${sportFilter !== 'all' ? `?sport=${sportFilter}` : ''}`}
                  style={{ fontSize: 11, color: 'var(--lime)', fontWeight: 700, textDecoration: 'none' }}>
                  Ver todas as {filtered.length} tips →
                </Link>
              </div>
            )}
          </div>

          {/* Performance chart */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">Performance · 14 dias</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="ev-badge lime">+18.4% ROI</span>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>30 apostas</span>
              </div>
            </div>
            <div className="chart-wrap">
              <svg viewBox="0 0 440 120" className="chart-svg" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="var(--lime)" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="var(--lime)" stopOpacity="0.01" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="30"  x2="440" y2="30"  className="chart-grid-line" />
                <line x1="0" y1="60"  x2="440" y2="60"  className="chart-grid-line" />
                <line x1="0" y1="90"  x2="440" y2="90"  className="chart-grid-line" />
                <path d={fillD} fill="url(#chartFill)" />
                <path d={pathD} fill="none" stroke="var(--lime)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="440" cy="20" r="8"   fill="var(--lime)" opacity="0.12" />
                <circle cx="440" cy="20" r="3.5" fill="var(--lime)" />
              </svg>
              <div className="chart-labels">
                {chartDays.map((d) => (
                  <span key={d} className="chart-label">{d}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="right">

          {/* AI Insight */}
          <div className="card" style={{ boxShadow: '0 0 0 1px oklch(80% 0.3 115 / 0.18), 0 8px 32px oklch(80% 0.3 115 / 0.07)' }}>
            <div className="card-head">
              <div className="card-title">{t('ai_insight')}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--green)', fontFamily: 'var(--font-cond)', fontWeight: 700, letterSpacing: '0.06em' }}>
                <div className="live-dot" style={{ width: 5, height: 5 }} />
                AO VIVO
              </div>
            </div>

            {bestOdd ? (
              <div className="insight-body">
                <div className="insight-match">{bestOdd.matchLabel.replace(/^[^ ]+ /, '')}</div>
                <div className="insight-league">{bestOdd.league}</div>
                <p className="insight-text">
                  Melhor oportunidade identificada: <strong>{bestOdd.selection}</strong> em{' '}
                  <strong>{bestOdd.market}</strong> com odd{' '}
                  <strong style={{ color: 'var(--lime)' }}>{bestOdd.odd.toFixed(2)}</strong> na{' '}
                  {bestOdd.book}. EV estimado:{' '}
                  <strong style={{ color: 'var(--lime)' }}>+{(bestOdd.ev * 100).toFixed(1)}%</strong>
                </p>
                {[
                  { label: 'Prob. real',   val: `${(bestOdd.probability * 100).toFixed(0)}%`, fill: Math.round(bestOdd.probability * 100), color: 'var(--lime)' },
                  { label: 'Prob. impl.',  val: `${((1 / bestOdd.odd) * 100).toFixed(0)}%`,  fill: Math.round((1 / bestOdd.odd) * 100),  color: 'var(--muted)' },
                  { label: 'Conf.',        val: `${bestOdd.confidence}%`,                     fill: bestOdd.confidence,                    color: 'var(--green)' },
                ].map((row) => (
                  <div key={row.label} className="pbar">
                    <span className="pbar-label">{row.label}</span>
                    <div className="pbar-track">
                      <div className="pbar-fill" style={{ width: row.fill + '%', background: row.color }} />
                    </div>
                    <span className="pbar-val" style={{ color: row.color }}>{row.val}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '16px', color: 'var(--muted)', fontSize: 12 }}>
                Nenhuma tip disponível agora.
              </div>
            )}

            {bestOdd && (
              <div className="insight-footer">
                <div>
                  <div className="ins-conf">{bestOdd.confidence}</div>
                  <div className="ins-conf-l">Confiança</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <div className="ins-odd">
                    <div className="ins-odd-val">{bestOdd.odd.toFixed(2)}</div>
                    <div className="ins-odd-l">Melhor odd · {bestOdd.book}</div>
                  </div>
                  <a href={bestOdd.affiliateUrl} target="_blank" rel="sponsored noopener noreferrer"
                    className="btn btn-lime" style={{ fontSize: 11, height: 28, padding: '0 14px', textDecoration: 'none' }}>
                    Apostar →
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Odds comparison */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">{t('odds_compare')}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                {bestOdd ? bestOdd.selection : 'Nenhuma tip'}
              </div>
            </div>
            {staticOdds.map((row) => (
              <div key={row.house} className={`odds-row${row.best ? ' odds-best' : ''}`}>
                <span className="odds-house">{row.house}</span>
                <div className="odds-bar">
                  <div className="odds-bar-fill" style={{ width: row.fill + '%', opacity: row.best ? 0.7 : 0.25 }} />
                </div>
                <span className="odds-val" style={{ color: row.best ? 'var(--lime)' : 'var(--text)' }}>
                  {row.val}
                </span>
                {row.best
                  ? <span className="ev-badge lime" style={{ fontSize: 9 }}>{row.ev}</span>
                  : <span style={{ width: 58, flexShrink: 0 }} />
                }
              </div>
            ))}
          </div>

          {/* Alerts */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">Alertas</div>
              <span className="ev-badge lime">4 novos</span>
            </div>
            {staticAlerts.map((alert, i) => (
              <div key={i} className={`alert-row ${alert.cls}`}>
                <div className="alert-msg">{alert.msg}</div>
                <div className="alert-time">{alert.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfidenceRing({ value, color }: { value: number; color: string }) {
  const radius = 15;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="cring" style={{ width: 38, height: 38 }}>
      <svg viewBox="0 0 38 38" width="38" height="38" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="19" cy="19" r={radius} fill="none" stroke="var(--bd2)" strokeWidth="3.5" />
        <circle
          cx="19" cy="19" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="3.5"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="cring-val" style={{ color, fontSize: 10, fontWeight: 600 }}>{value}</div>
    </div>
  );
}
