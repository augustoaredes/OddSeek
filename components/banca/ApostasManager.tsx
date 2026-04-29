'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { loadBets, saveBets, toSettledBet } from '@/lib/banca/store';
import type { BankBet } from '@/lib/banca/store';
import { totalProfit, roi as calcROI } from '@/lib/banca/metrics';
import { BetFormModal } from './BetFormModal';

const statusColor = (s: string) =>
  s === 'won' ? 'var(--green)' : s === 'lost' ? 'var(--red)' : s === 'pending' ? 'var(--amber)' : 'var(--muted)';

const statusLabel = (s: string) =>
  ({ won: 'Ganhou', lost: 'Perdeu', pending: 'Pendente', void: 'Void', cashout: 'Cashout' }[s] ?? s);

const SPORT_EMOJI: Record<string, string> = {
  football: '⚽', basketball: '🏀', tennis: '🎾', mma: '🥊',
};

interface Prefill {
  sport?: string;
  league?: string;
  matchLabel?: string;
  market?: string;
  selection?: string;
  book?: string;
  odd?: number;
}

interface ApostasManagerProps {
  locale: string;
  prefill?: Prefill;
}

export function ApostasManager({ locale, prefill }: ApostasManagerProps) {
  const [bets,      setBets]      = useState<BankBet[]>([]);
  const [showForm,  setShowForm]  = useState(false);
  const [hydrated,  setHydrated]  = useState(false);
  const [filter,    setFilter]    = useState<'all' | 'pending' | 'won' | 'lost'>('all');

  useEffect(() => {
    setBets(loadBets());
    setHydrated(true);
    // Auto-open form if coming from a tip
    if (prefill) setShowForm(true);
  }, [prefill]);

  const sorted = useMemo(() =>
    [...bets].sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()),
    [bets]);

  const filtered = useMemo(() =>
    filter === 'all' ? sorted : sorted.filter(b => b.status === filter),
    [sorted, filter]);

  const { settled, profit, roiValue } = useMemo(() => {
    const settled  = bets.map(toSettledBet).filter(Boolean) as NonNullable<ReturnType<typeof toSettledBet>>[];
    const profit   = totalProfit(settled);
    const roiValue = calcROI(settled);
    return { settled, profit, roiValue };
  }, [bets]);

  function addBet(bet: BankBet) {
    const next = [bet, ...bets];
    setBets(next);
    saveBets(next);
  }

  function updateStatus(id: string, status: BankBet['status']) {
    const next = bets.map(b =>
      b.id === id ? { ...b, status, settledAt: new Date().toISOString() } : b);
    setBets(next);
    saveBets(next);
  }

  function deleteBet(id: string) {
    const next = bets.filter(b => b.id !== id);
    setBets(next);
    saveBets(next);
  }

  if (!hydrated) return null;

  return (
    <>
      {showForm && (
        <BetFormModal onSave={addBet} onClose={() => setShowForm(false)} prefill={prefill} />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 6, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-cond)', fontSize: 26, fontWeight: 800,
              letterSpacing: '-0.01em', textTransform: 'uppercase', color: 'var(--text)', margin: 0 }}>
              Histórico de Apostas
            </h1>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
              {bets.length} apostas · ROI {roiValue >= 0 ? '+' : ''}{roiValue.toFixed(1)}% · Lucro R${profit.toFixed(0)}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { href: `/${locale}/banca`,          label: 'Overview' },
              { href: `/${locale}/banca/apostas`,  label: 'Apostas', active: true },
              { href: `/${locale}/banca/insights`, label: 'Insights' },
            ].map(tab => (
              <Link key={tab.href} href={tab.href}
                style={{ padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                  textDecoration: 'none',
                  background: tab.active ? 'var(--lime)' : 'var(--s2)',
                  color: tab.active ? 'var(--bg)' : 'var(--muted)',
                  border: '1px solid var(--border)' }}>
                {tab.label}
              </Link>
            ))}
            <button onClick={() => setShowForm(true)} className="btn btn-lime"
              style={{ fontSize: 12, padding: '7px 16px' }}>
              + Nova aposta
            </button>
          </div>
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', 'pending', 'won', 'lost'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                cursor: 'pointer',
                background: filter === f ? 'var(--lime)' : 'var(--s2)',
                color:      filter === f ? 'var(--bg)'   : 'var(--muted)',
                border: `1px solid ${filter === f ? 'var(--lime)' : 'var(--border)'}` }}>
              {f === 'all' ? `Todas (${bets.length})` :
               f === 'pending' ? `Pendentes (${bets.filter(b => b.status === 'pending').length})` :
               f === 'won'     ? `Ganhas (${bets.filter(b => b.status === 'won').length})` :
               `Perdidas (${bets.filter(b => b.status === 'lost').length})`}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="table-wrap wide">
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 12, overflow: 'hidden' }}>

            {/* Header */}
            <div style={{ display: 'grid',
              gridTemplateColumns: '28px 1fr 90px 60px 60px 88px 72px 72px',
              gap: 10, padding: '10px 16px',
              background: 'var(--s2)', borderBottom: '1px solid var(--border)',
              fontSize: 10, fontWeight: 700, letterSpacing: '0.07em',
              textTransform: 'uppercase', color: 'var(--muted)' }}>
              <div />
              <div>Seleção</div>
              <div>Liga</div>
              <div style={{ textAlign: 'right' }}>Odd</div>
              <div style={{ textAlign: 'right' }}>Stake</div>
              <div style={{ textAlign: 'center' }}>Status</div>
              <div style={{ textAlign: 'right' }}>Resultado</div>
              <div style={{ textAlign: 'right' }}>Data</div>
            </div>

            {filtered.length === 0 ? (
              <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                {bets.length === 0
                  ? <>Nenhuma aposta ainda.{' '}
                      <button onClick={() => setShowForm(true)}
                        style={{ background: 'none', border: 'none', color: 'var(--lime)',
                          cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                        Adicionar a primeira →
                      </button>
                    </>
                  : 'Nenhuma aposta neste filtro.'
                }
              </div>
            ) : filtered.map((bet, i) => (
              <div key={bet.id} style={{
                display: 'grid',
                gridTemplateColumns: '28px 1fr 90px 60px 60px 88px 72px 72px',
                gap: 10, padding: '11px 16px',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                alignItems: 'center',
              }}>
                {/* Sport icon */}
                <div style={{ fontSize: 14, textAlign: 'center' }}>
                  {SPORT_EMOJI[bet.sport] ?? '🎯'}
                </div>

                {/* Selection + match */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{bet.selection}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 1 }}>
                    {bet.matchLabel} · {bet.market}
                  </div>
                </div>

                <div style={{ fontSize: 11, color: 'var(--muted)', fontStyle: 'italic' }}>{bet.league}</div>

                <div style={{ textAlign: 'right', fontSize: 13, fontWeight: 700,
                  fontFamily: 'var(--font-cond)', color: 'var(--text)' }}>
                  {bet.odd.toFixed(2)}
                </div>

                <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text)' }}>
                  R${bet.stake}
                </div>

                {/* Status — inline update for pending */}
                <div style={{ textAlign: 'center' }}>
                  {bet.status === 'pending' ? (
                    <div style={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
                      <button onClick={() => updateStatus(bet.id, 'won')}
                        style={{ fontSize: 10, fontWeight: 700, padding: '4px 7px', borderRadius: 5,
                          background: 'var(--green)22', border: '1px solid var(--green)55',
                          color: 'var(--green)', cursor: 'pointer' }}>
                        ✓ W
                      </button>
                      <button onClick={() => updateStatus(bet.id, 'lost')}
                        style={{ fontSize: 10, fontWeight: 700, padding: '4px 7px', borderRadius: 5,
                          background: 'var(--red)22', border: '1px solid var(--red)55',
                          color: 'var(--red)', cursor: 'pointer' }}>
                        ✗ L
                      </button>
                      <button onClick={() => updateStatus(bet.id, 'void')}
                        style={{ fontSize: 10, fontWeight: 700, padding: '4px 7px', borderRadius: 5,
                          background: 'var(--s2)', border: '1px solid var(--border)',
                          color: 'var(--muted)', cursor: 'pointer' }}>
                        V
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
                      textTransform: 'uppercase', color: statusColor(bet.status),
                      background: `${statusColor(bet.status)}22`,
                      padding: '3px 8px', borderRadius: 4 }}>
                      {statusLabel(bet.status)}
                    </span>
                  )}
                </div>

                {/* Profit */}
                <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 700,
                  fontFamily: 'var(--font-cond)',
                  color: bet.status === 'won' ? 'var(--green)' : bet.status === 'lost' ? 'var(--red)' : 'var(--muted)' }}>
                  {bet.status === 'won'  ? `+R$${(bet.stake * (bet.odd - 1)).toFixed(1)}` :
                   bet.status === 'lost' ? `-R$${bet.stake.toFixed(0)}` :
                   bet.status === 'void' ? 'Void' : '—'}
                </div>

                {/* Date + delete */}
                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center',
                  justifyContent: 'flex-end', gap: 6 }}>
                  <span style={{ fontSize: 11, color: 'var(--dim)' }}>
                    {new Date(bet.placedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                  </span>
                  <button onClick={() => deleteBet(bet.id)}
                    title="Remover aposta"
                    style={{ background: 'none', border: 'none', color: 'var(--dim)', cursor: 'pointer',
                      fontSize: 14, lineHeight: 1, padding: '2px 4px' }}>
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
