import type React from 'react';
import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { DEMO_BETS, DEMO_EQUITY, INITIAL_BANKROLL, toSettledBet } from '@/lib/banca/mock-data';
import { totalProfit, roi as calcROI, hitRate } from '@/lib/banca/metrics';
import { generateAlerts } from '@/lib/banca/alerts';
import { BankCard } from '@/components/banca/BankCard';

export default async function BancaPage() {
  const locale = await getLocale();

  const nonNull = DEMO_BETS.map(toSettledBet).filter(Boolean) as NonNullable<ReturnType<typeof toSettledBet>>[];
  const profit  = totalProfit(nonNull);
  const currentBalance = INITIAL_BANKROLL + profit;
  const roiValue = calcROI(nonNull);
  const hr  = hitRate(nonNull);
  const pending = DEMO_BETS.filter(b => b.status === 'pending');
  const alerts  = generateAlerts(nonNull, currentBalance, INITIAL_BANKROLL, currentBalance * 0.03);

  const recent = [...DEMO_BETS]
    .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime())
    .slice(0, 8);

  const won  = nonNull.filter(b => b.status === 'won').length;
  const lost = nonNull.filter(b => b.status === 'lost').length;

  // Best and worst bet
  const betProfits = nonNull.map(b => ({
    bet: b,
    p: b.status === 'won' ? b.stake * (b.odd - 1) : b.status === 'lost' ? -b.stake : 0,
  }));
  const bestBet  = betProfits.reduce((a, x) => x.p > a.p ? x : a, betProfits[0]);
  const avgOdd   = nonNull.length > 0 ? nonNull.reduce((s, b) => s + b.odd, 0) / nonNull.length : 0;

  const statusColor = (s: string) =>
    s === 'won' ? 'var(--green)' : s === 'lost' ? 'var(--red)' : s === 'pending' ? 'var(--amber)' : 'var(--muted)';
  const statusLabel = (s: string) =>
    ({ won: 'Ganhou', lost: 'Perdeu', pending: 'Pendente', void: 'Void', cashout: 'Cashout' }[s] ?? s);
  const profitDisplay = (bet: typeof DEMO_BETS[0]) => {
    const sb = toSettledBet(bet);
    if (!sb) return '—';
    const p = sb.status === 'won' ? sb.stake * (sb.odd - 1) : sb.status === 'lost' ? -sb.stake : 0;
    return p >= 0 ? `+R$${p.toFixed(1)}` : `R$${p.toFixed(1)}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── Nav tabs ─────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>
          {nonNull.length} apostas liquidadas · {pending.length} pendentes
        </p>
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { href: `/${locale}/banca`,          label: 'Overview', active: true },
            { href: `/${locale}/banca/apostas`,  label: 'Apostas' },
            { href: `/${locale}/banca/insights`, label: 'Insights' },
          ].map(tab => (
            <Link key={tab.href} href={tab.href}
              style={{ padding: '6px 14px', borderRadius: 7, fontSize: 12, fontWeight: 700, textDecoration: 'none',
                background: tab.active ? 'var(--lime)' : 'var(--s2)',
                color: tab.active ? 'var(--bg)' : 'var(--muted)',
                border: '1px solid var(--border)',
              }}>
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── KPIs ─────────────────────────────────────────── */}
      <div className="kpi-row">
        {[
          { label: 'Saldo Atual',    value: `R$${currentBalance.toFixed(0)}`,                     delta: `${profit >= 0 ? '+' : ''}R$${profit.toFixed(0)} lucro`,         accent: profit >= 0 ? 'var(--green)' : 'var(--red)' },
          { label: 'ROI Total',      value: `${roiValue >= 0 ? '+' : ''}${roiValue.toFixed(1)}%`, delta: `${nonNull.length} apostas`,                                      accent: roiValue >= 0 ? 'var(--lime)' : 'var(--red)' },
          { label: 'Taxa de Acerto', value: `${(hr * 100).toFixed(0)}%`,                          delta: `${won} vitórias · ${lost} derrotas`,                             accent: 'var(--blue)' },
          { label: 'Pendentes',      value: `${pending.length}`,                                   delta: `R$${pending.reduce((s, b) => s + b.stake, 0).toFixed(0)} em jogo`, accent: 'var(--amber)' },
        ].map(kpi => (
          <div key={kpi.label} className="kpi" style={{ '--kpi-accent': kpi.accent } as React.CSSProperties}>
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-val" style={{ color: kpi.accent }}>{kpi.value}</div>
            <div className="kpi-delta">{kpi.delta}</div>
          </div>
        ))}
      </div>

      {/* ── Main: 2-column ───────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 264px', gap: 14, alignItems: 'start' }}>

        {/* Left: BankCard + Recent bets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <BankCard
            currentBalance={currentBalance}
            initialBalance={INITIAL_BANKROLL}
            totalProfit={profit}
            roi={roiValue}
            equityCurve={DEMO_EQUITY}
            riskProfile="moderado"
          />

          {/* Recent bets */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="card-head">
              <div className="card-title">Apostas Recentes</div>
              <Link href={`/${locale}/banca/apostas`} style={{ fontSize: 11, color: 'var(--lime)', textDecoration: 'none', fontWeight: 700 }}>
                Ver todas →
              </Link>
            </div>
            {/* Table header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 64px 70px 72px',
              gap: 12, padding: '8px 18px',
              background: 'var(--s2)', borderBottom: '1px solid var(--border)',
              fontSize: 10, fontWeight: 700, letterSpacing: '0.07em',
              textTransform: 'uppercase', color: 'var(--muted)',
            }}>
              <div>Aposta</div>
              <div style={{ textAlign: 'right' }}>Odd · Stake</div>
              <div style={{ textAlign: 'right' }}>Status</div>
              <div style={{ textAlign: 'right' }}>Resultado</div>
            </div>
            {recent.map((bet, i) => (
              <div key={bet.id} style={{
                display: 'grid', gridTemplateColumns: '1fr 64px 70px 72px',
                alignItems: 'center', gap: 12, padding: '10px 18px',
                borderBottom: i < recent.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{bet.selection}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 1 }}>{bet.matchLabel} · {bet.market}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-cond)' }}>{bet.odd.toFixed(2)}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)' }}>R${bet.stake}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: statusColor(bet.status), letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    {statusLabel(bet.status)}
                  </span>
                </div>
                <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-cond)', color: bet.status === 'won' ? 'var(--green)' : bet.status === 'lost' ? 'var(--red)' : 'var(--muted)' }}>
                  {profitDisplay(bet)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="card" style={{ overflow: 'hidden' }}>
              <div className="card-head">
                <div className="card-title">Alertas</div>
                <span style={{ fontSize: 10, color: 'var(--amber)', fontWeight: 700 }}>{alerts.length}</span>
              </div>
              {alerts.map((alert, i) => (
                <div key={i} style={{
                  padding: '10px 14px', fontSize: 12, lineHeight: 1.5,
                  color: alert.severity === 'critical' ? 'var(--red)' : 'var(--amber)',
                  borderBottom: i < alerts.length - 1 ? '1px solid var(--border)' : 'none',
                  borderLeft: `3px solid ${alert.severity === 'critical' ? 'var(--red)' : 'var(--amber)'}`,
                }}>
                  {alert.severity === 'critical' ? '🚨' : '⚠️'} {alert.message}
                </div>
              ))}
            </div>
          )}

          {/* Performance stats */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="card-head">
              <div className="card-title">Performance</div>
            </div>
            {[
              { label: 'Odd Média',     value: avgOdd > 0 ? avgOdd.toFixed(2) : '—',                 color: 'var(--text)' },
              { label: 'Vitórias',      value: `${won}`,                                              color: 'var(--green)' },
              { label: 'Derrotas',      value: `${lost}`,                                             color: 'var(--red)' },
              { label: 'Melhor aposta', value: bestBet ? `+R$${bestBet.p.toFixed(0)}` : '—',         color: 'var(--lime)' },
              { label: 'Lucro total',   value: `${profit >= 0 ? '+' : ''}R$${profit.toFixed(0)}`,    color: profit >= 0 ? 'var(--green)' : 'var(--red)' },
            ].map((row, i, arr) => (
              <div key={row.label} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '9px 14px',
                borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{row.label}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: row.color, fontFamily: 'var(--font-cond)' }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Kelly stake guide */}
          <div className="card" style={{ padding: '14px 16px' }}>
            <div className="card-title" style={{ marginBottom: 10 }}>Stake Sugerido</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 10 }}>
              Perfil <span style={{ color: 'var(--lime)', fontWeight: 700 }}>Moderado</span> · Half-Kelly com cap de 3%
            </div>
            {[
              { label: 'EV 5%',  value: `R$${(currentBalance * 0.01).toFixed(0)}` },
              { label: 'EV 10%', value: `R$${(currentBalance * 0.02).toFixed(0)}` },
              { label: 'EV 15%', value: `R$${(currentBalance * 0.03).toFixed(0)}` },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>{row.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--lime)', fontFamily: 'var(--font-cond)' }}>{row.value}</span>
              </div>
            ))}
            <Link href={`/${locale}/banca/insights`}
              style={{ display: 'block', textAlign: 'center', marginTop: 10, fontSize: 11, color: 'var(--lime)', fontWeight: 700, textDecoration: 'none' }}>
              Ver Insights →
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
