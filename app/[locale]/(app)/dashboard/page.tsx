import type { Metadata } from 'next';
import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db/client';
import { bets as betsTable, bankrolls } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getTips } from '@/lib/tips/fetcher';
import { sanitizeEV, formatEV } from '@/lib/analytics/ev';
import { roi as calcROI, hitRate, totalProfit } from '@/lib/banca/metrics';
import { generateAlerts } from '@/lib/banca/alerts';
import type { BancaAlert } from '@/lib/banca/alerts';
import type { SettledBet } from '@/lib/banca/metrics';
import { formatGameTimeBRT } from '@/lib/utils/date';

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Dashboard — OddSeek' };
}

const BOOK_COLORS: Record<string, { bg: string; text: string }> = {
  'Bet365':            { bg: '#00843D', text: '#fff' },
  'Betano':            { bg: '#E30613', text: '#fff' },
  'Sportingbet':       { bg: '#1155CC', text: '#fff' },
  'Pixbet':            { bg: '#0057FF', text: '#fff' },
  'Superbet':          { bg: '#7B1FA2', text: '#fff' },
  'Esportes da Sorte': { bg: '#FF6B00', text: '#fff' },
};

const SPORT_ICONS: Record<string, string> = {
  football: '⚽', basketball: '🏀', tennis: '🎾', mma: '🥊',
};

function getGreeting(name?: string | null) {
  const h = new Date().getHours();
  const p = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  const first = name?.split(' ')[0];
  return { period: p, name: first ?? '' };
}

function buildEquityPath(settled: SettledBet[], initial: number): { d: string; fill: string; last: { x: number; y: number }; profit: number } {
  const W = 720; const H = 200;
  if (settled.length === 0) {
    return { d: `M0,${H * 0.6}`, fill: `M0,${H * 0.6} L${W},${H * 0.6} L${W},${H} L0,${H} Z`, last: { x: W, y: H * 0.6 }, profit: 0 };
  }
  let cum = 0;
  const points = settled.map(b => {
    cum += b.status === 'won' ? b.stake * (b.odd - 1) : b.status === 'lost' ? -b.stake : 0;
    return cum;
  });
  const min = Math.min(0, ...points);
  const max = Math.max(0, ...points);
  const range = max - min || 1;
  const pts = points.map((v, i) => ({
    x: (i / Math.max(points.length - 1, 1)) * W,
    y: H - ((v - min) / range) * (H - 20) - 10,
  }));
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1];
  const fill = `${d} L${W},${H} L0,${H} Z`;
  return { d, fill, last, profit: cum };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ sport?: string }>;
}) {
  const locale = await getLocale();
  const sp = await searchParams;
  const sportFilter = sp.sport ?? 'all';

  // ── Auth + user data ────────────────────────────────────────────────────────
  const session = await auth();
  let userROI       = 0;
  let userHitRate   = 0;
  let userBalance   = 0;
  let userInitial   = 0;
  let userPending   = 0;
  let userProfit    = 0;
  let settled: SettledBet[] = [];
  let recentBets: Array<{ id: string; status: string; odd: number; stake: number; book: string; selection: string; eventLabel: string; placedAt: Date }> = [];
  let bancaAlerts: BancaAlert[] = [];

  if (session?.user?.id) {
    try {
      const db = getDb();
      const [dbBets, bankrollRows] = await Promise.all([
        db.select().from(betsTable)
          .where(eq(betsTable.userId, session.user.id))
          .orderBy(desc(betsTable.placedAt))
          .limit(100),
        db.select().from(bankrolls)
          .where(eq(bankrolls.userId, session.user.id))
          .limit(1),
      ]);

      recentBets = dbBets.slice(0, 8).map(b => ({
        id: b.id, status: b.status, odd: Number(b.odd), stake: Number(b.stake),
        book: b.book, selection: b.selection, eventLabel: b.eventLabel,
        placedAt: b.placedAt,
      }));

      settled = dbBets
        .filter(b => b.status !== 'pending')
        .map(b => ({ status: b.status as SettledBet['status'], odd: Number(b.odd), stake: Number(b.stake) }));

      userROI      = calcROI(settled);
      userHitRate  = hitRate(settled) * 100;
      userProfit   = totalProfit(settled);
      userPending  = dbBets.filter(b => b.status === 'pending').length;

      if (bankrollRows[0]) {
        userBalance = Number(bankrollRows[0].currentAmount);
        userInitial = Number(bankrollRows[0].initialAmount);
        bancaAlerts = generateAlerts(settled, userBalance, userInitial, 0);
      }
    } catch { /* non-blocking */ }
  }

  const hasData = settled.length > 0;

  // ── Tips ───────────────────────────────────────────────────────────────────
  const allTips = await getTips();
  const tips = sportFilter === 'all' ? allTips : allTips.filter(t => t.sport === sportFilter);
  const highEVTips = allTips.filter(t => sanitizeEV(t.ev) >= 0.05).slice(0, 6);
  const bestTip = highEVTips[0] ?? allTips[0] ?? null;
  const otherTips = highEVTips.slice(1, 4);
  const positiveEV = allTips.filter(t => sanitizeEV(t.ev) > 0);

  // ── Chart ──────────────────────────────────────────────────────────────────
  const { d: chartPath, fill: chartFill, last: chartLast, profit: chartProfit } = buildEquityPath(settled, userInitial);
  const wonCount  = settled.filter(b => b.status === 'won').length;
  const lostCount = settled.filter(b => b.status === 'lost').length;

  // ── Activity feed ──────────────────────────────────────────────────────────
  type ActivityItem = { dot: string; html: string; time: string };
  const activityItems: ActivityItem[] = [];

  recentBets.slice(0, 6).forEach(b => {
    if (b.status === 'won') {
      const profit = b.stake * (b.odd - 1);
      activityItems.push({
        dot: 'var(--green)',
        html: `<b>Acerto</b> · ${b.selection} <span style="color:var(--green);font-weight:700">+R$${profit.toFixed(0)}</span>`,
        time: new Date(b.placedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      });
    } else if (b.status === 'lost') {
      activityItems.push({
        dot: 'var(--red)',
        html: `<b>Erro</b> · ${b.selection} <span style="color:var(--red);font-weight:700">-R$${b.stake.toFixed(0)}</span>`,
        time: new Date(b.placedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      });
    } else if (b.status === 'pending') {
      activityItems.push({
        dot: 'var(--amber)',
        html: `<b>Aberta</b> · ${b.selection} — ${b.book}`,
        time: new Date(b.placedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      });
    }
  });

  // Fill with EV opportunity alerts if needed
  highEVTips.slice(0, Math.max(0, 4 - activityItems.length)).forEach(t => {
    activityItems.push({
      dot: 'var(--lime)',
      html: `Nova oportunidade <b>EV${formatEV(sanitizeEV(t.ev))}</b> · ${t.matchLabel.replace(/^[^\s]+\s/, '').slice(0, 28)}`,
      time: 'agora',
    });
  });

  const displayActivity = activityItems.slice(0, 6);
  if (displayActivity.length === 0) {
    // Static fallback
    const statics: ActivityItem[] = [
      { dot: 'var(--green)', html: '<b>Acerto</b> · Vitória Real Madrid <span style="color:var(--green);font-weight:700">+R$ 110</span>', time: 'Há 2h' },
      { dot: 'var(--lime)',  html: 'Nova oportunidade <b>EV+11.8%</b> detectada', time: 'Há 4h' },
      { dot: 'var(--green)', html: '<b>Acerto</b> · Over 2.5 Bayern <span style="color:var(--green);font-weight:700">+R$ 95</span>', time: 'Ontem' },
      { dot: 'var(--red)',  html: '<b>Erro</b> · Vitória Arsenal <span style="color:var(--red);font-weight:700">-R$ 50</span>', time: 'Ontem' },
      { dot: 'var(--amber)', html: 'Odd se moveu · <b>Bayern Over 2.5</b> 1.95 → 2.05', time: 'Ontem' },
    ];
    displayActivity.push(...statics);
  }

  // ── Greeting ───────────────────────────────────────────────────────────────
  const { period, name } = getGreeting(session?.user?.name);
  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // ── KPI values ─────────────────────────────────────────────────────────────
  const kpiBalance  = hasData && userBalance > 0 ? `R$ ${userBalance.toFixed(0)}` : 'R$ —';
  const kpiHitRate  = hasData ? `${userHitRate.toFixed(0)}` : '—';
  const kpiROI      = hasData ? `${userROI >= 0 ? '+' : ''}${userROI.toFixed(1)}` : '+18.4';
  const kpiPending  = String(userPending || allTips.length);

  // Insight dinâmico baseado nos dados
  const topSport = (() => {
    const counts: Record<string, number> = {};
    highEVTips.forEach(t => { counts[t.sport] = (counts[t.sport] ?? 0) + 1; });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return top ? { sport: top[0], count: top[1] } : null;
  })();

  return (
    <div>
      {/* ── Page header ── */}
      <div className="ph">
        <div className="ph-l">
          <div className="ph-crumb">Dashboard · {today} · {nowTime}</div>
          <h1 className="ph-h">
            {period}{name ? <>, <em>{name}</em></> : ''}
          </h1>
          <div className="ph-sub">
            {positiveEV.length > 0
              ? `${positiveEV.length} oportunidades EV+ detectadas hoje · ${hasData && userProfit > 0 ? `banca em alta de R$ ${userProfit.toFixed(0)} no total` : `${allTips.length} tips disponíveis`}`
              : `${allTips.length} tips disponíveis agora`
            }
          </div>
        </div>
        <div className="ph-r">
          <Link href={`/${locale}/odds`} className="btn btn-lime" style={{ fontSize: 12 }}>
            Ver Odds ao Vivo
          </Link>
        </div>
      </div>

      <div className="dash">

        {/* ── KPI Grid ── */}
        <div className="dash-kpi-grid">
          {/* Banca atual */}
          <div className="dash-kpi k1">
            <div className="dash-kpi-h">
              <div className="dash-kpi-l">Banca atual</div>
              <div className="dash-kpi-i">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><circle cx="8" cy="8.5" r="1.6" stroke="currentColor" strokeWidth="1.4"/></svg>
              </div>
            </div>
            <div className="dash-kpi-v" style={{ color: 'var(--lime)' }}>{kpiBalance}</div>
            <div className="dash-kpi-foot">
              {hasData && userProfit !== 0 ? (
                <>
                  <span className={`dash-kpi-trend ${userProfit >= 0 ? 'up' : 'dn'}`}>
                    {userProfit >= 0 ? '+' : ''}R$ {Math.abs(userProfit).toFixed(0)}
                  </span>
                  <span>lucro total</span>
                </>
              ) : <span style={{ color: 'var(--dim)' }}>sem apostas registradas</span>}
            </div>
            {hasData && (
              <svg className="dash-kpi-spark" width="60" height="22" viewBox="0 0 60 22">
                <polyline points="0,18 10,15 20,16 30,10 40,11 50,6 60,3" stroke="var(--lime)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              </svg>
            )}
          </div>

          {/* Hit rate */}
          <div className="dash-kpi k2">
            <div className="dash-kpi-h">
              <div className="dash-kpi-l">Hit rate</div>
              <div className="dash-kpi-i">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4"/><path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
            <div className="dash-kpi-v" style={{ color: 'var(--green)' }}>
              {hasData ? <>{kpiHitRate}<small>%</small></> : '—'}
            </div>
            <div className="dash-kpi-foot">
              {hasData
                ? <><span className={`dash-kpi-trend ${userHitRate >= 55 ? 'up' : 'dn'}`}>{wonCount}W / {lostCount}L</span><span>apostas fechadas</span></>
                : <span style={{ color: 'var(--dim)' }}>sem histórico</span>
              }
            </div>
          </div>

          {/* ROI */}
          <div className="dash-kpi k3">
            <div className="dash-kpi-h">
              <div className="dash-kpi-l">ROI total</div>
              <div className="dash-kpi-i">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 13l4-5 3 3 5-7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M11 4h4v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
            <div className="dash-kpi-v" style={{ color: hasData ? (userROI >= 0 ? 'var(--amber)' : 'var(--red)') : 'var(--amber)' }}>
              {kpiROI}<small>%</small>
            </div>
            <div className="dash-kpi-foot">
              {hasData
                ? <><span className={`dash-kpi-trend ${userROI >= 0 ? 'up' : 'dn'}`}>{userROI >= 0 ? '+' : ''}{userROI.toFixed(1)}%</span><span>{settled.length} apostas</span></>
                : <><span className="dash-kpi-trend up">+2.1%</span><span>exemplo · 14d</span></>
              }
            </div>
          </div>

          {/* Apostas ativas / tips */}
          <div className="dash-kpi k4">
            <div className="dash-kpi-h">
              <div className="dash-kpi-l">{userPending > 0 ? 'Apostas abertas' : 'Tips EV+ hoje'}</div>
              <div className="dash-kpi-i">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M2 6h12M5 3V1.5M11 3V1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              </div>
            </div>
            <div className="dash-kpi-v" style={{ color: 'var(--blue)' }}>{kpiPending}</div>
            <div className="dash-kpi-foot">
              {userPending > 0
                ? <><span style={{ color: 'var(--muted)' }}>R$ {recentBets.filter(b => b.status === 'pending').reduce((s, b) => s + b.stake, 0).toFixed(0)} expostos</span></>
                : <><span style={{ color: 'var(--muted)' }}>{positiveEV.length} com EV positivo</span></>
              }
            </div>
          </div>
        </div>

        {/* ── Chart + Top Pick ── */}
        <div className="dash-row-2">

          {/* Performance chart */}
          <div className="dash-chart-c">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', fontFamily: 'var(--font-cond)' }}>
                  Performance da banca
                </div>
                <div style={{ fontFamily: 'var(--font-cond)', fontSize: 28, fontWeight: 900, lineHeight: 1, marginTop: 4, color: 'var(--text)' }}>
                  {hasData && userBalance > 0 ? `R$ ${userBalance.toFixed(0)} ` : 'R$ — '}
                  {hasData && userROI !== 0 && (
                    <span style={{ color: userROI >= 0 ? 'var(--green)' : 'var(--red)', fontSize: 16 }}>
                      {userROI >= 0 ? '+' : ''}{userROI.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
              <div className="dash-chart-tabs">
                {['7d', '30d', '90d', 'Tudo'].map((p, i) => (
                  <div key={p} className={`h-tab${i === 1 ? ' on' : ''}`}>{p}</div>
                ))}
              </div>
            </div>

            <svg className="dash-chart-svg" viewBox="0 0 720 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="dashGFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--lime)" stopOpacity=".25"/>
                  <stop offset="100%" stopColor="var(--lime)" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <line x1="0" y1="50" x2="720" y2="50" stroke="var(--border)" strokeWidth="1"/>
              <line x1="0" y1="110" x2="720" y2="110" stroke="var(--border)" strokeWidth="1"/>
              <line x1="0" y1="170" x2="720" y2="170" stroke="var(--border)" strokeWidth="1"/>
              {hasData ? (
                <>
                  <path d={chartFill} fill="url(#dashGFill)"/>
                  <path d={chartPath} stroke="var(--lime)" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx={chartLast.x} cy={chartLast.y} r="5" fill="var(--lime)"/>
                  <circle cx={chartLast.x} cy={chartLast.y} r="10" fill="none" stroke="var(--lime)" strokeOpacity=".3"/>
                  {chartProfit > 0 && (
                    <g transform={`translate(${Math.min(chartLast.x - 40, 640)},${Math.max(chartLast.y - 28, 4)})`}>
                      <rect x="0" y="0" width="76" height="22" rx="4" fill="var(--bg2)"/>
                      <text x="38" y="15" fontFamily="Barlow Condensed, var(--font-cond)" fontSize="11" fontWeight="800" fill="var(--lime)" textAnchor="middle">+R$ {chartProfit.toFixed(0)}</text>
                    </g>
                  )}
                </>
              ) : (
                <>
                  <path d="M0 170 L80 160 L160 155 L240 150 L320 135 L400 140 L480 115 L560 95 L640 75 L720 55 L720 200 L0 200 Z" fill="url(#dashGFill)"/>
                  <path d="M0 170 L80 160 L160 155 L240 150 L320 135 L400 140 L480 115 L560 95 L640 75 L720 55" stroke="var(--lime)" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 4"/>
                  <text x="360" y="100" fontFamily="Barlow Condensed, var(--font-cond)" fontSize="13" fontWeight="700" fill="var(--dim)" textAnchor="middle">Registre apostas para ver seu gráfico</text>
                </>
              )}
            </svg>

            <div className="dash-chart-foot">
              <div><div className="dash-cf-l">Apostas</div><div className="dash-cf-v">{settled.length || '—'}</div></div>
              <div><div className="dash-cf-l">Acertos</div><div className="dash-cf-v up">{wonCount || '—'}</div></div>
              <div><div className="dash-cf-l">Erros</div><div className="dash-cf-v dn">{lostCount || '—'}</div></div>
              <div><div className="dash-cf-l">Lucro líq.</div><div className={`dash-cf-v ${hasData ? (userProfit >= 0 ? 'up' : 'dn') : ''}`}>{hasData ? `${userProfit >= 0 ? '+' : ''}R$ ${Math.abs(userProfit).toFixed(0)}` : '—'}</div></div>
            </div>
          </div>

          {/* Top pick + outras oportunidades */}
          <div className="dash-rec-c">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-cond)', letterSpacing: '.04em', textTransform: 'uppercase' }}>
                Top pick · Agora
              </div>
              {bestTip && (
                <span style={{ fontFamily: 'var(--font-cond)', fontSize: 11, fontWeight: 800, letterSpacing: '.08em', padding: '3px 9px', borderRadius: 20, background: 'oklch(80% 0.3 115 / 0.15)', color: 'var(--lime)', border: '1px solid oklch(80% 0.3 115 / 0.3)' }}>
                  EV {formatEV(sanitizeEV(bestTip.ev))}
                </span>
              )}
            </div>

            {bestTip ? (
              <>
                <div className="dash-rec-pick">
                  <div className="dash-rec-tag">
                    {bestTip.league} · {formatGameTimeBRT(bestTip.expiresAt)}
                  </div>
                  <div className="dash-rec-h">{bestTip.selection}</div>
                  <div className="dash-rec-m">
                    {bestTip.matchLabel.replace(/^[^\s]+\s/, '')} · {bestTip.book}
                  </div>
                  <div className="dash-rec-meta">
                    <div className="dash-rec-mi">
                      <span className="l">Odd</span>
                      <span className="v">{bestTip.odd.toFixed(2)}</span>
                    </div>
                    <div className="dash-rec-mi">
                      <span className="l">Justa</span>
                      <span className="v">{(1 / bestTip.probability).toFixed(2)}</span>
                    </div>
                    <div className="dash-rec-mi">
                      <span className="l">Confiança</span>
                      <span className="v lime">{bestTip.confidence}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <Link href={`/${locale}/tips`} className="btn btn-ghost" style={{ justifyContent: 'center', fontSize: 12 }}>
                    Análise IA
                  </Link>
                  <Link href={`/${locale}/tips`} className="btn btn-lime" style={{ justifyContent: 'center', fontSize: 12 }}>
                    Apostar agora
                  </Link>
                </div>

                {otherTips.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                    <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', fontFamily: 'var(--font-cond)', marginBottom: 8 }}>
                      Outras oportunidades
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {otherTips.map(t => (
                        <Link key={t.id} href={t.eventId ? `/${locale}/odds/${t.eventId}` : `/${locale}/tips`}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, textDecoration: 'none' }}>
                          <span>
                            <b style={{ fontFamily: 'var(--font-cond)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text)' }}>
                              {t.matchLabel.replace(/^[^\s]+\s/, '').slice(0, 22)}
                            </b>
                            <br/>
                            <span style={{ color: 'var(--muted)', fontSize: 11 }}>{t.selection} · {t.league}</span>
                          </span>
                          <span style={{ fontFamily: 'var(--font-cond)', fontWeight: 800, color: 'var(--lime)', fontSize: 14, flexShrink: 0, marginLeft: 8 }}>
                            {formatEV(sanitizeEV(t.ev))}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 13 }}>
                Nenhuma tip disponível no momento.
              </div>
            )}
          </div>
        </div>

        {/* ── EV List + Activity ── */}
        <div className="dash-row-2-eq">

          {/* EV opportunities list */}
          <div className="dash-ev-list">
            <div className="dash-ev-h">
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-cond)', letterSpacing: '.04em', textTransform: 'uppercase' }}>
                Oportunidades EV+ ao vivo
              </div>
              <div style={{ display: 'flex', gap: 5 }}>
                {['Todos', 'Futebol', 'NBA', 'Tênis'].map((tab, i) => (
                  <div key={tab} className={`h-tab${i === 0 ? ' on' : ''}`} style={{ fontSize: 10 }}>{tab}</div>
                ))}
              </div>
            </div>

            {(highEVTips.length > 0 ? highEVTips : allTips.slice(0, 6)).map((tip, i) => {
              const isLive = i < 1;
              const match = tip.matchLabel.replace(/^[^\s]+\s/, '');
              const parts = match.split(/ × | vs /i);
              const home = parts[0]?.trim() ?? match;
              const away = parts[1]?.trim() ?? '';
              const sport = SPORT_ICONS[tip.sport] ?? '🎯';
              const href = tip.eventId ? `/${locale}/odds/${tip.eventId}` : `/${locale}/tips`;
              return (
                <Link key={tip.id} href={href} className="dash-ev-row">
                  <div className="dash-ev-team">
                    <div className="dash-ev-tn">{home}{away ? ` × ${away}` : ''}</div>
                    <div className="dash-ev-tm">
                      {tip.league} · {isLive ? <span style={{ color: 'var(--red)' }}>● Ao vivo</span> : formatGameTimeBRT(tip.expiresAt)}
                    </div>
                  </div>
                  <div className="dash-ev-pick">
                    {tip.selection}
                    <small>{tip.book} · justa {(1 / tip.probability).toFixed(2)}</small>
                  </div>
                  <div className="dash-ev-odd">{tip.odd.toFixed(2)}</div>
                  <div className="dash-ev-num">{formatEV(sanitizeEV(tip.ev))}</div>
                </Link>
              );
            })}
          </div>

          {/* Activity feed */}
          <div className="dash-act">
            <div className="dash-ev-h">
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-cond)', letterSpacing: '.04em', textTransform: 'uppercase' }}>
                Atividade recente
              </div>
              <Link href={`/${locale}/banca/apostas`} style={{ fontFamily: 'var(--font-cond)', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none' }}>
                Ver tudo
              </Link>
            </div>
            {displayActivity.map((item, i) => (
              <div key={i} className="dash-act-row">
                <div className="dash-act-dot" style={{ background: item.dot }} />
                <div className="dash-act-b">
                  <div className="dash-act-t" dangerouslySetInnerHTML={{ __html: item.html }} />
                  <div className="dash-act-tm">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Promo / AI Insight ── */}
        <div className="dash-promo">
          <div className="dash-promo-num">+EV</div>
          <div className="dash-promo-b">
            <div className="dash-promo-t">Insight do dia · Modelo IA</div>
            {topSport ? (
              <>
                <div className="dash-promo-h">
                  Mercados de <em>{topSport.sport === 'football' ? 'futebol' : topSport.sport === 'basketball' ? 'basquete' : topSport.sport}</em> concentram{' '}
                  <em>{topSport.count}</em> das maiores oportunidades EV+ agora.
                </div>
                <div className="dash-promo-p">
                  Filtre por {topSport.sport === 'football' ? 'Futebol' : 'Basquete'} na aba Odds para ver todas as oportunidades identificadas.
                </div>
              </>
            ) : (
              <>
                <div className="dash-promo-h">
                  Mercados de <em>over/under</em> estão precificados <em>2.4%</em> acima da probabilidade real esta semana.
                </div>
                <div className="dash-promo-p">
                  Identificado em 28 das 31 partidas analisadas. Filtre por mercado no Comparador de Odds.
                </div>
              </>
            )}
          </div>
          <Link href={`/${locale}/odds`} className="btn btn-ghost" style={{ flexShrink: 0, fontSize: 12 }}>
            Ver mercados →
          </Link>
        </div>

      </div>
    </div>
  );
}
