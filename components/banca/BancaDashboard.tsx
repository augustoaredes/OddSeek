'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { loadBets, saveBets, loadInitialBankroll, buildEquityCurve, toSettledBet } from '@/lib/banca/store';
import type { BankBet } from '@/lib/banca/store';
import { totalProfit, roi as calcROI, hitRate, averageOdd } from '@/lib/banca/metrics';
import { generateAlerts } from '@/lib/banca/alerts';
import { BankCard } from './BankCard';
import { BetFormModal } from './BetFormModal';

const statusColor = (s: string) =>
  s === 'won' ? 'var(--green)' : s === 'lost' ? 'var(--red)' : s === 'pending' ? 'var(--amber)' : 'var(--muted)';

const statusLabel = (s: string) =>
  ({ won: 'Ganhou', lost: 'Perdeu', pending: 'Pendente', void: 'Void', cashout: 'Cashout' }[s] ?? s);

function profitOf(bet: BankBet): number {
  if (bet.status === 'won')  return bet.stake * (bet.odd - 1);
  if (bet.status === 'lost') return -bet.stake;
  return 0;
}

export function BancaDashboard({ locale }: { locale: string }) {
  const [bets,            setBets]            = useState<BankBet[]>([]);
  const [initialBankroll, setInitialBankroll] = useState(2000);
  const [showForm,        setShowForm]        = useState(false);
  const [hydrated,        setHydrated]        = useState(false);

  useEffect(() => {
    setBets(loadBets());
    setInitialBankroll(loadInitialBankroll());
    setHydrated(true);
  }, []);

  const { settled, profit, currentBalance, roiValue, hr, pending, alerts, equityCurve, won, lost, avgOdd, bestBet } =
    useMemo(() => {
      const nonNull = bets.map(toSettledBet).filter(Boolean) as NonNullable<ReturnType<typeof toSettledBet>>[];
      const profit         = totalProfit(nonNull);
      const currentBalance = initialBankroll + profit;
      const roiValue       = calcROI(nonNull);
      const hr             = hitRate(nonNull);
      const pending        = bets.filter(b => b.status === 'pending');
      const alerts         = generateAlerts(nonNull, currentBalance, initialBankroll, currentBalance * 0.03);
      const equityCurve    = buildEquityCurve(bets, initialBankroll);
      const won  = nonNull.filter(b => b.status === 'won').length;
      const lost = nonNull.filter(b => b.status === 'lost').length;
      const avgOdd = averageOdd(nonNull);
      const profits = bets.map(b => ({ bet: b, p: profitOf(b) }));
      const bestBet = profits.length > 0 ? profits.reduce((a, x) => x.p > a.p ? x : a, profits[0]) : null;
      return { settled: nonNull, profit, currentBalance, roiValue, hr, pending, alerts, equityCurve, won, lost, avgOdd, bestBet };
    }, [bets, initialBankroll]);

  const recent = useMemo(() =>
    [...bets].sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()).slice(0, 8),
    [bets]);

  function addBet(bet: BankBet) {
    const next = [bet, ...bets];
    setBets(next);
    saveBets(next);
  }

  function updateStatus(id: string, status: BankBet['status']) {
    const next = bets.map(b => b.id === id
      ? { ...b, status, settledAt: new Date().toISOString() }
      : b);
    setBets(next);
    saveBets(next);
  }

  if (!hydrated) return null;

  return (
    <>
      {showForm && <BetFormModal onSave={addBet} onClose={() => setShowForm(false)} />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Nav tabs + Nova aposta */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>
            {settled.length} apostas liquidadas · {pending.length} pendentes
          </p>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { href: `/${locale}/banca`,          label: 'Overview', active: true },
              { href: `/${locale}/banca/apostas`,  label: 'Apostas' },
              { href: `/${locale}/banca/insights`, label: 'Insights' },
            ].map(tab => (
              <Link key={tab.href} href={tab.href}
                style={{ padding: '6px 14px', borderRadius: 7, fontSize: 12, fontWeight: 700,
                  textDecoration: 'none',
                  background: tab.active ? 'var(--lime)' : 'var(--s2)',
                  color: tab.active ? 'var(--bg)' : 'var(--muted)',
                  border: '1px solid var(--border)' }}>
                {tab.label}
              </Link>
            ))}
            <button onClick={() => setShowForm(true)} className="btn btn-lime"
              style={{ fontSize: 12, padding: '6px 14px' }}>
              + Nova aposta
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="kpi-row">
          {[
            { label: 'Saldo Atual',    value: `R$${currentBalance.toFixed(0)}`,
              delta: `${profit >= 0 ? '+' : ''}R$${profit.toFixed(0)} lucro`,
              accent: profit >= 0 ? 'var(--green)' : 'var(--red)' },
            { label: 'ROI Total',      value: `${roiValue >= 0 ? '+' : ''}${roiValue.toFixed(1)}%`,
              delta: `${settled.length} apostas`,
              accent: roiValue >= 0 ? 'var(--lime)' : 'var(--red)' },
            { label: 'Taxa de Acerto', value: `${(hr * 100).toFixed(0)}%`,
              delta: `${won} vitórias · ${lost} derrotas`,
              accent: 'var(--blue)' },
            { label: 'Pendentes',      value: `${pending.length}`,
              delta: `R$${pending.reduce((s, b) => s + b.stake, 0).toFixed(0)} em jogo`,
              accent: 'var(--amber)' },
          ].map(kpi => (
            <div key={kpi.label} className="kpi" style={{ '--kpi-accent': kpi.accent } as React.CSSProperties}>
              <div className="kpi-label">{kpi.label}</div>
              <div className="kpi-val" style={{ color: kpi.accent }}>{kpi.value}</div>
              <div className="kpi-delta">{kpi.delta}</div>
            </div>
          ))}
        </div>

        {/* Main 2-col */}
        <div className="page-grid" style={{ '--pg-cols': '1fr 264px', gap: 14 } as React.CSSProperties}>

          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <BankCard
              currentBalance={currentBalance}
              initialBalance={initialBankroll}
              totalProfit={profit}
              roi={roiValue}
              equityCurve={equityCurve}
              riskProfile="moderado"
            />

            {/* Recent bets */}
            <div className="card" style={{ overflow: 'hidden' }}>
              <div className="card-head">
                <div className="card-title">Apostas Recentes</div>
                <Link href={`/${locale}/banca/apostas`}
                  style={{ fontSize: 11, color: 'var(--lime)', textDecoration: 'none', fontWeight: 700 }}>
                  Ver todas →
                </Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 64px 72px 80px',
                gap: 12, padding: '8px 18px',
                background: 'var(--s2)', borderBottom: '1px solid var(--border)',
                fontSize: 10, fontWeight: 700, letterSpacing: '0.07em',
                textTransform: 'uppercase', color: 'var(--muted)' }}>
                <div>Aposta</div>
                <div style={{ textAlign: 'right' }}>Odd · Stake</div>
                <div style={{ textAlign: 'center' }}>Status</div>
                <div style={{ textAlign: 'right' }}>Resultado</div>
              </div>

              {recent.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: 12 }}>
                  Nenhuma aposta ainda.{' '}
                  <button onClick={() => setShowForm(true)}
                    style={{ background: 'none', border: 'none', color: 'var(--lime)', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>
                    Adicionar →
                  </button>
                </div>
              ) : recent.map((bet, i) => (
                <div key={bet.id} style={{
                  display: 'grid', gridTemplateColumns: '1fr 64px 72px 80px',
                  alignItems: 'center', gap: 12, padding: '10px 18px',
                  borderBottom: i < recent.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{bet.selection}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 1 }}>
                      {bet.matchLabel} · {bet.market}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-cond)', color: 'var(--text)' }}>
                      {bet.odd.toFixed(2)}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--muted)' }}>R${bet.stake}</div>
                  </div>

                  {/* Inline status actions for pending */}
                  {bet.status === 'pending' ? (
                    <div style={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
                      <button onClick={() => updateStatus(bet.id, 'won')}
                        style={{ fontSize: 9, fontWeight: 700, padding: '3px 6px', borderRadius: 4,
                          background: 'var(--green)22', border: '1px solid var(--green)44',
                          color: 'var(--green)', cursor: 'pointer' }}>
                        ✓W
                      </button>
                      <button onClick={() => updateStatus(bet.id, 'lost')}
                        style={{ fontSize: 9, fontWeight: 700, padding: '3px 6px', borderRadius: 4,
                          background: 'var(--red)22', border: '1px solid var(--red)44',
                          color: 'var(--red)', cursor: 'pointer' }}>
                        ✗L
                      </button>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: statusColor(bet.status),
                        letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                        {statusLabel(bet.status)}
                      </span>
                    </div>
                  )}

                  <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 700,
                    fontFamily: 'var(--font-cond)',
                    color: bet.status === 'won' ? 'var(--green)' : bet.status === 'lost' ? 'var(--red)' : 'var(--muted)' }}>
                    {bet.status === 'won'  ? `+R$${(bet.stake * (bet.odd - 1)).toFixed(1)}` :
                     bet.status === 'lost' ? `-R$${bet.stake.toFixed(0)}` : '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="page-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Alerts */}
            {alerts.length > 0 && (
              <div className="card" style={{ overflow: 'hidden' }}>
                <div className="card-head">
                  <div className="card-title">Alertas</div>
                  <span style={{ fontSize: 10, color: 'var(--amber)', fontWeight: 700 }}>{alerts.length}</span>
                </div>
                {alerts.map((alert, i) => (
                  <div key={i} style={{ padding: '10px 14px', fontSize: 12, lineHeight: 1.5,
                    color: alert.severity === 'critical' ? 'var(--red)' : 'var(--amber)',
                    borderBottom: i < alerts.length - 1 ? '1px solid var(--border)' : 'none',
                    borderLeft: `3px solid ${alert.severity === 'critical' ? 'var(--red)' : 'var(--amber)'}` }}>
                    {alert.severity === 'critical' ? '🚨' : '⚠️'} {alert.message}
                  </div>
                ))}
              </div>
            )}

            {/* Performance */}
            <div className="card" style={{ overflow: 'hidden' }}>
              <div className="card-head"><div className="card-title">Performance</div></div>
              {[
                { label: 'Odd Média',     value: avgOdd > 0 ? avgOdd.toFixed(2) : '—',                           color: 'var(--text)' },
                { label: 'Vitórias',      value: `${won}`,                                                        color: 'var(--green)' },
                { label: 'Derrotas',      value: `${lost}`,                                                       color: 'var(--red)' },
                { label: 'Melhor aposta', value: bestBet && bestBet.p > 0 ? `+R$${bestBet.p.toFixed(0)}` : '—',  color: 'var(--lime)' },
                { label: 'Lucro total',   value: `${profit >= 0 ? '+' : ''}R$${profit.toFixed(0)}`,               color: profit >= 0 ? 'var(--green)' : 'var(--red)' },
              ].map((row, i, arr) => (
                <div key={row.label} style={{ display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', padding: '9px 14px',
                  borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: row.color, fontFamily: 'var(--font-cond)' }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Kelly guide */}
            <div className="card" style={{ padding: '14px 16px' }}>
              <div className="card-title" style={{ marginBottom: 10 }}>Stake Sugerido</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 10 }}>
                Perfil <span style={{ color: 'var(--lime)', fontWeight: 700 }}>Moderado</span> · Half-Kelly cap 3%
              </div>
              {[
                { label: 'EV 5%',  value: `R$${(currentBalance * 0.01).toFixed(0)}` },
                { label: 'EV 10%', value: `R$${(currentBalance * 0.02).toFixed(0)}` },
                { label: 'EV 15%', value: `R$${(currentBalance * 0.03).toFixed(0)}` },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>{row.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--lime)', fontFamily: 'var(--font-cond)' }}>
                    {row.value}
                  </span>
                </div>
              ))}
              <Link href={`/${locale}/banca/insights`}
                style={{ display: 'block', textAlign: 'center', marginTop: 10, fontSize: 11,
                  color: 'var(--lime)', fontWeight: 700, textDecoration: 'none' }}>
                Ver Insights →
              </Link>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
