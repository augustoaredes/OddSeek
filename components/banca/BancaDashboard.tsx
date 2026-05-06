'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { loadBets, saveBets, loadInitialBankroll, buildEquityCurve, toSettledBet } from '@/lib/banca/store';
import type { BankBet } from '@/lib/banca/store';
import { totalProfit, roi as calcROI, hitRate, averageOdd } from '@/lib/banca/metrics';
import { generateAlerts } from '@/lib/banca/alerts';
import { BetFormModal } from './BetFormModal';

const statusLabel = (s: string) =>
  ({ won: 'Ganhou', lost: 'Perdeu', pending: 'Aberta', void: 'Void', cashout: 'Cashout' }[s] ?? s);

const txBadgeClass = (s: string) =>
  s === 'won' ? 'win' : s === 'lost' ? 'loss' : 'pend';

function kellyStake(bankroll: number, prob: number, odd: number): number {
  const b = odd - 1;
  const k = (prob * b - (1 - prob)) / b;
  const half = Math.max(k * 0.5, 0);
  const capped = Math.min(half * bankroll, bankroll * 0.03);
  return Math.round(capped);
}

function EquityCurveChart({ curve, initial }: { curve: { balance: number }[]; initial: number }) {
  if (curve.length < 2) {
    return (
      <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 12 }}>
        Registre apostas para ver o gráfico.
      </div>
    );
  }

  const W = 600; const H = 160;
  const values = curve.map(c => c.balance);
  const min = Math.min(...values, initial);
  const max = Math.max(...values, initial);
  const range = max - min || 1;
  const pts = values.map((v, i) => [
    (i / (values.length - 1)) * W,
    H - ((v - min) / range) * (H - 16) - 8,
  ]);
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const fillD = `${pathD} L${W},${H} L0,${H} Z`;
  const last = pts[pts.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: 160 }}>
      <defs>
        <linearGradient id="bcFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--lime)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--lime)" stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <line x1="0" y1={H / 3} x2={W} y2={H / 3} stroke="var(--border)" strokeWidth="1" />
      <line x1="0" y1={(H * 2) / 3} x2={W} y2={(H * 2) / 3} stroke="var(--border)" strokeWidth="1" />
      <path d={fillD} fill="url(#bcFill)" />
      <path d={pathD} fill="none" stroke="var(--lime)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="8" fill="var(--lime)" opacity="0.15" />
      <circle cx={last[0]} cy={last[1]} r="3.5" fill="var(--lime)" />
    </svg>
  );
}

// Converte aposta do DB para o formato BankBet usado internamente
function dbBetToBankBet(row: Record<string, unknown>): BankBet {
  return {
    id:         String(row.id),
    sport:      String(row.sport ?? ''),
    league:     String(row.league ?? ''),
    matchLabel: String(row.eventLabel ?? row.matchLabel ?? ''),
    market:     String(row.market ?? ''),
    selection:  String(row.selection ?? ''),
    book:       String(row.book ?? ''),
    odd:        Number(row.odd),
    stake:      Number(row.stake),
    status:     (row.status as BankBet['status']) ?? 'pending',
    profit:     row.profit != null ? Number(row.profit) : undefined,
    placedAt:   row.placedAt ? new Date(row.placedAt as string).toISOString() : new Date().toISOString(),
    settledAt:  row.settledAt ? new Date(row.settledAt as string).toISOString() : undefined,
    source:     (row.source as BankBet['source']) ?? 'manual',
  };
}

export function BancaDashboard({ locale }: { locale: string }) {
  const { data: session, status: sessionStatus } = useSession();
  const isAuth = sessionStatus === 'authenticated';

  const [bets,            setBets]            = useState<BankBet[]>([]);
  const [initialBankroll, setInitialBankroll] = useState(2000);
  const [showForm,        setShowForm]        = useState(false);
  const [hydrated,        setHydrated]        = useState(false);
  const [kellyOdd,        setKellyOdd]        = useState('2.10');
  const [kellyProb,       setKellyProb]       = useState('54');

  useEffect(() => {
    if (sessionStatus === 'loading') return;

    if (isAuth) {
      // Carrega do banco de dados
      Promise.all([
        fetch('/api/banca/apostas').then(r => r.json()),
        fetch('/api/banca/bankroll').then(r => r.json()),
      ]).then(([apostas, bankroll]) => {
        if (Array.isArray(apostas)) setBets(apostas.map(dbBetToBankBet));
        if (bankroll?.initialAmount) setInitialBankroll(bankroll.initialAmount);
        setHydrated(true);
      }).catch(() => {
        setBets(loadBets());
        setInitialBankroll(loadInitialBankroll());
        setHydrated(true);
      });
    } else {
      setBets(loadBets());
      setInitialBankroll(loadInitialBankroll());
      setHydrated(true);
    }
  }, [sessionStatus, isAuth]);

  const { settled, profit, currentBalance, roiValue, hr, pending, won, lost, avgOdd, bestBet, equityCurve } =
    useMemo(() => {
      const nonNull = bets.map(toSettledBet).filter(Boolean) as NonNullable<ReturnType<typeof toSettledBet>>[];
      const profit         = totalProfit(nonNull);
      const currentBalance = initialBankroll + profit;
      const roiValue       = calcROI(nonNull);
      const hr             = hitRate(nonNull);
      const pending        = bets.filter(b => b.status === 'pending');
      const won            = nonNull.filter(b => b.status === 'won').length;
      const lost           = nonNull.filter(b => b.status === 'lost').length;
      const avgOdd         = averageOdd(nonNull);
      const bestBet        = nonNull.length > 0
        ? nonNull.reduce((b, c) => (c.stake * (c.odd - 1) > b.stake * (b.odd - 1) ? c : b), nonNull[0])
        : null;
      const equityCurve    = buildEquityCurve(bets, initialBankroll);
      return { settled: nonNull, profit, currentBalance, roiValue, hr, pending, won, lost, avgOdd, bestBet, equityCurve };
    }, [bets, initialBankroll]);

  async function addBet(bet: BankBet) {
    if (isAuth) {
      try {
        const res = await fetch('/api/banca/apostas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sport:      bet.sport,
            league:     bet.league,
            eventLabel: bet.matchLabel,
            market:     bet.market,
            selection:  bet.selection,
            book:       bet.book,
            odd:        bet.odd,
            stake:      bet.stake,
            source:     bet.source ?? 'manual',
          }),
        });
        if (res.ok) {
          const saved = await res.json();
          setBets(prev => [dbBetToBankBet(saved), ...prev]);
          return;
        }
      } catch { /* fallthrough */ }
    }
    const next = [bet, ...bets];
    setBets(next);
    saveBets(next);
  }

  async function updateStatus(id: string, status: BankBet['status']) {
    if (isAuth) {
      try {
        const res = await fetch(`/api/banca/apostas/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });
        if (res.ok) {
          const updated = await res.json();
          setBets(prev => prev.map(b => b.id === id ? dbBetToBankBet(updated) : b));
          return;
        }
      } catch { /* fallthrough */ }
    }
    const next = bets.map(b => b.id === id
      ? { ...b, status, settledAt: new Date().toISOString() }
      : b);
    setBets(next);
    saveBets(next);
  }

  async function deleteBet(id: string) {
    if (isAuth) {
      try {
        await fetch(`/api/banca/apostas/${id}`, { method: 'DELETE' });
      } catch { /* fallthrough */ }
    }
    const next = bets.filter(b => b.id !== id);
    setBets(next);
    if (!isAuth) saveBets(next);
  }

  const kellyResult = useMemo(() => {
    const odd  = parseFloat(kellyOdd)  || 2.0;
    const prob = parseFloat(kellyProb) / 100 || 0.5;
    return kellyStake(currentBalance, prob, odd);
  }, [kellyOdd, kellyProb, currentBalance]);

  const recentBets = useMemo(() =>
    [...bets].sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()),
    [bets]);

  const bancaAlerts = useMemo(
    () => generateAlerts(settled, currentBalance, initialBankroll, kellyResult),
    [settled, currentBalance, initialBankroll, kellyResult],
  );

  const progressPct = Math.min(100, Math.max(0,
    ((currentBalance - initialBankroll * 0.5) / (initialBankroll * 1.5 - initialBankroll * 0.5)) * 100
  ));

  if (!hydrated) return null;

  return (
    <>
      {showForm && <BetFormModal onSave={addBet} onClose={() => setShowForm(false)} />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

        {/* ── 5 KPIs ── */}
        <div className="banca-kpi-row">
          <div className="bkpi">
            <div className="bkpi-label">Banca atual</div>
            <div className="bkpi-val" style={{ color: 'var(--lime)' }}>R${currentBalance.toFixed(0)}</div>
            <div className="bkpi-sub">{profit >= 0 ? '↑ +' : '↓ '}R${Math.abs(profit).toFixed(0)} · {roiValue >= 0 ? '+' : ''}{roiValue.toFixed(1)}%</div>
          </div>
          <div className="bkpi">
            <div className="bkpi-label">ROI total</div>
            <div className="bkpi-val" style={{ color: 'var(--green)' }}>{roiValue >= 0 ? '+' : ''}{roiValue.toFixed(1)}%</div>
            <div className="bkpi-sub">{settled.length} apostas fechadas</div>
          </div>
          <div className="bkpi">
            <div className="bkpi-label">Taxa de acerto</div>
            <div className="bkpi-val" style={{ color: 'var(--amber)' }}>{(hr * 100).toFixed(0)}%</div>
            <div className="bkpi-sub">{won} vitórias / {lost} derrotas</div>
          </div>
          <div className="bkpi">
            <div className="bkpi-label">Odd média</div>
            <div className="bkpi-val" style={{ color: 'var(--red)' }}>{avgOdd > 0 ? avgOdd.toFixed(2) : '—'}</div>
            <div className="bkpi-sub">Abertas: {pending.length}</div>
          </div>
          <div className="bkpi">
            <div className="bkpi-label">Melhor aposta</div>
            <div className="bkpi-val" style={{ color: 'var(--blue)' }}>
              {bestBet ? `+R$${(bestBet.stake * (bestBet.odd - 1)).toFixed(0)}` : '—'}
            </div>
            <div className="bkpi-sub">{bestBet ? `odd ${bestBet.odd.toFixed(2)}` : 'Nenhuma'}</div>
          </div>
        </div>

        {/* ── Main grid ── */}
        <div className="banca-content-grid">

          {/* Left column */}
          <div className="banca-main-col">

            {/* Nav tabs */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {[
                  { href: `/${locale}/banca`,          label: 'Overview', active: true },
                  { href: `/${locale}/banca/apostas`,  label: 'Apostas' },
                  { href: `/${locale}/banca/insights`, label: 'Insights' },
                ].map(tab => (
                  <Link key={tab.href} href={tab.href} className="f-tab"
                    style={tab.active ? { borderColor: 'var(--lime)', color: 'var(--lime)', background: 'oklch(78% 0.3 115 / 0.06)' } : {}}>
                    {tab.label}
                  </Link>
                ))}
              </div>
              <button onClick={() => setShowForm(true)} className="btn btn-lime"
                style={{ fontSize: 11, height: 30, padding: '0 14px' }}>
                + Nova aposta
              </button>
            </div>

            {/* Chart */}
            <div className="chart-card">
              <div className="cc-head">
                <div className="cc-title">Evolução da Banca</div>
                <div className="cc-period">
                  {['7d', '30d', '90d', 'Tudo'].map((p, i) => (
                    <button key={p} className={`period-btn${i === 1 ? ' on' : ''}`}>{p}</button>
                  ))}
                </div>
              </div>
              <div className="cc-body">
                <div className="cc-chart-area">
                  <EquityCurveChart curve={equityCurve} initial={initialBankroll} />
                </div>
                <div className="cc-legend">
                  <div className="cc-legend-item">
                    <div className="cc-legend-dot" style={{ background: 'var(--lime)' }} />Banca
                  </div>
                  <div className="cc-legend-item">
                    <div className="cc-legend-dot" style={{ background: 'var(--blue)', opacity: 0.5 }} />Linha base
                  </div>
                </div>
              </div>
            </div>

            {/* Transactions */}
            <div className="tx-card">
              <div className="tx-head">
                <span className="cc-title">Histórico de Apostas</span>
                <Link href={`/${locale}/banca/apostas`}
                  style={{ fontSize: 11, color: 'var(--lime)', fontWeight: 700, textDecoration: 'none' }}>
                  Ver todas →
                </Link>
              </div>
              {recentBets.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                  Nenhuma aposta ainda.{' '}
                  <button onClick={() => setShowForm(true)}
                    style={{ background: 'none', border: 'none', color: 'var(--lime)', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                    Adicionar →
                  </button>
                </div>
              ) : (
                <>
                  <div className="tx-table-head">
                    <div className="txh">Data</div>
                    <div className="txh">Partida / Aposta</div>
                    <div className="txh" style={{ textAlign: 'right' }}>Valor</div>
                    <div className="txh" style={{ textAlign: 'right' }}>Odd</div>
                    <div className="txh" style={{ textAlign: 'center' }}>Resultado</div>
                    <div className="txh" style={{ textAlign: 'right' }}>P&L</div>
                  </div>
                  {recentBets.slice(0, 10).map(bet => (
                    <div key={bet.id} className="tx-row">
                      <div className="tx-date">
                        {new Date(bet.placedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </div>
                      <div>
                        <div className="tx-match-name">{bet.matchLabel}</div>
                        <div className="tx-tip-label">{bet.selection}</div>
                      </div>
                      <div className="tx-val">R${bet.stake}</div>
                      <div className="tx-odd">{bet.odd.toFixed(2)}</div>
                      <div className="tx-result">
                        {bet.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
                            <button onClick={() => updateStatus(bet.id, 'won')}
                              style={{ fontSize: 9, fontWeight: 700, padding: '3px 5px', borderRadius: 4, background: 'oklch(65% 0.25 155 / 0.12)', border: '1px solid oklch(65% 0.25 155 / 0.2)', color: 'var(--green)', cursor: 'pointer' }}>
                              ✓W
                            </button>
                            <button onClick={() => updateStatus(bet.id, 'lost')}
                              style={{ fontSize: 9, fontWeight: 700, padding: '3px 5px', borderRadius: 4, background: 'oklch(50% 0.28 25 / 0.1)', border: '1px solid oklch(50% 0.28 25 / 0.2)', color: 'var(--red)', cursor: 'pointer' }}>
                              ✗L
                            </button>
                          </div>
                        ) : (
                          <span className={`tx-badge ${txBadgeClass(bet.status)}`}>
                            {statusLabel(bet.status)}
                          </span>
                        )}
                      </div>
                      <div className="tx-pl" style={{
                        color: bet.status === 'won' ? 'var(--green)' : bet.status === 'lost' ? 'var(--red)' : 'var(--muted)',
                        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6,
                      }}>
                        {bet.status === 'won'  ? `+R$${(bet.stake * (bet.odd - 1)).toFixed(0)}` :
                         bet.status === 'lost' ? `-R$${bet.stake.toFixed(0)}` : '—'}
                        <button onClick={() => deleteBet(bet.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--dim)', cursor: 'pointer', fontSize: 14, padding: '0 2px', lineHeight: 1 }}>
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="banca-side-col">

            {/* Risk alerts */}
            {bancaAlerts.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 4 }}>
                {bancaAlerts.map((alert, i) => {
                  const colors = {
                    info:     { bg: 'oklch(65% 0.2 240 / 0.10)', border: 'oklch(65% 0.2 240 / 0.3)', text: 'var(--blue)' },
                    warning:  { bg: 'oklch(70% 0.18 60 / 0.10)',  border: 'oklch(70% 0.18 60 / 0.3)',  text: 'var(--amber)' },
                    critical: { bg: 'oklch(50% 0.28 25 / 0.12)',  border: 'oklch(50% 0.28 25 / 0.35)', text: 'var(--red)' },
                  }[alert.severity];
                  const icon = { info: 'ℹ', warning: '⚠', critical: '🚨' }[alert.severity];
                  return (
                    <div
                      key={i}
                      style={{
                        background: colors.bg,
                        border: `1px solid ${colors.border}`,
                        borderRadius: 10,
                        padding: '10px 14px',
                        display: 'flex',
                        gap: 10,
                        alignItems: 'flex-start',
                      }}
                    >
                      <span style={{ fontSize: 14, flexShrink: 0, lineHeight: 1.4 }}>{icon}</span>
                      <div>
                        <div style={{
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          color: colors.text,
                          marginBottom: 2,
                        }}>
                          {alert.severity === 'critical' ? 'Alerta crítico' : alert.severity === 'warning' ? 'Atenção' : 'Info'}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
                          {alert.message}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Banca summary */}
            <div className="sp-block">
              <div className="sp-title">Resumo da Banca</div>
              <div className="banca-total">R${currentBalance.toFixed(0)}</div>
              <div className="banca-change">
                {profit >= 0 ? '↑' : '↓'} {profit >= 0 ? '+' : ''}R${Math.abs(profit).toFixed(0)} · {roiValue >= 0 ? '+' : ''}{roiValue.toFixed(1)}%
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
              {[
                { label: 'Banca inicial',   value: `R$${initialBankroll.toFixed(0)}`,                                                    color: undefined },
                { label: 'Lucro líquido',   value: `${profit >= 0 ? '+' : ''}R$${profit.toFixed(0)}`,                                    color: profit >= 0 ? 'var(--green)' : 'var(--red)' },
                { label: 'Apostas abertas', value: `${pending.length} · R$${pending.reduce((s, b) => s + b.stake, 0).toFixed(0)}`,        color: undefined },
                { label: 'Disponível',      value: `R$${(currentBalance - pending.reduce((s, b) => s + b.stake, 0)).toFixed(0)}`,         color: 'var(--lime)' },
              ].map(row => (
                <div key={row.label} className="banca-stat-row">
                  <div className="bsl">{row.label}</div>
                  <div className="bsv" style={row.color ? { color: row.color } : {}}>{row.value}</div>
                </div>
              ))}
            </div>

            {/* Kelly calculator */}
            <div className="sp-block">
              <div className="sp-title">Calculadora Kelly</div>
              <div className="kelly-card">
                <div className="kc-row">
                  <div className="kc-label">Odd</div>
                  <input className="kc-input" type="number" step="0.05" min="1.01"
                    value={kellyOdd} onChange={e => setKellyOdd(e.target.value)} />
                </div>
                <div className="kc-row">
                  <div className="kc-label">Prob. (%)</div>
                  <input className="kc-input" type="number" step="1" min="1" max="99"
                    value={kellyProb} onChange={e => setKellyProb(e.target.value)} />
                </div>
                <div className="kc-row">
                  <div className="kc-label">Banca (R$)</div>
                  <input className="kc-input" type="number" value={Math.round(currentBalance)} readOnly
                    style={{ opacity: 0.6, cursor: 'default' }} />
                </div>
                <div className="kc-result">
                  <div><div className="kc-res-label">Aposta recomendada</div></div>
                  <div><div className="kc-res-val">R${kellyResult}</div></div>
                </div>
              </div>
            </div>

            {/* Sport distribution */}
            {bets.length > 0 && (
              <div className="sp-block">
                <div className="sp-title">Distribuição por esporte</div>
                {[
                  { label: 'Futebol',  sport: 'football',   color: '#4ade80' },
                  { label: 'Basquete', sport: 'basketball', color: '#a78bfa' },
                  { label: 'Tênis',    sport: 'tennis',     color: '#fcd34d' },
                  { label: 'MMA',      sport: 'mma',        color: '#f87171' },
                ].map(row => {
                  const cnt = bets.filter(b => b.sport === row.sport).length;
                  const pct = bets.length > 0 ? (cnt / bets.length) * 100 : 0;
                  return cnt > 0 ? (
                    <div key={row.sport} className="sp-dist-row">
                      <div className="sp-dist-label">{row.label}</div>
                      <div className="sp-dist-bar">
                        <div className="sp-dist-fill" style={{ width: `${pct}%`, background: row.color }} />
                      </div>
                      <div className="sp-dist-val">{cnt}</div>
                    </div>
                  ) : null;
                })}
              </div>
            )}

            {/* Config link */}
            <div className="sp-block" style={{ borderBottom: 'none' }}>
              <Link href={`/${locale}/configuracoes`}
                style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'none', fontWeight: 600 }}>
                ⚙ Configurar banca →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
