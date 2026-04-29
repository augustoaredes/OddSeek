'use client';

import { useState, useEffect } from 'react';
import type { BankBet } from '@/lib/banca/store';
import { newBetId } from '@/lib/banca/store';

const SPORTS = [
  ['football',   '⚽ Futebol'],
  ['basketball', '🏀 Basquete'],
  ['tennis',     '🎾 Tênis'],
  ['mma',        '🥊 MMA'],
] as const;

const MARKETS = [
  'Resultado Final',
  'Total de Gols/Pontos',
  'Handicap Asiático',
  'Ambas Marcam',
  'Dupla Hipótese',
];

interface Prefill {
  sport?: string;
  league?: string;
  matchLabel?: string;
  market?: string;
  selection?: string;
  book?: string;
  odd?: number;
}

interface BetFormModalProps {
  onSave: (bet: BankBet) => void;
  onClose: () => void;
  prefill?: Prefill;
}

const field: React.CSSProperties = {
  width: '100%',
  background: 'var(--s2)',
  border: '1px solid var(--border)',
  borderRadius: 7,
  color: 'var(--text)',
  fontSize: 13,
  padding: '9px 11px',
  outline: 'none',
  boxSizing: 'border-box',
};

const label: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: 'var(--muted)',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  marginBottom: 5,
  display: 'block',
};

export function BetFormModal({ onSave, onClose, prefill }: BetFormModalProps) {
  const [sport,      setSport]      = useState(prefill?.sport      ?? 'football');
  const [league,     setLeague]     = useState(prefill?.league     ?? '');
  const [matchLabel, setMatchLabel] = useState(prefill?.matchLabel ?? '');
  const [market,     setMarket]     = useState(prefill?.market     ?? '');
  const [selection,  setSelection]  = useState(prefill?.selection  ?? '');
  const [book,       setBook]       = useState(prefill?.book       ?? '');
  const [odd,        setOdd]        = useState(prefill?.odd != null ? String(prefill.odd) : '');
  const [stake,      setStake]      = useState('');

  // Focus first empty field on open
  useEffect(() => {
    document.getElementById('bf-league')?.focus();
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const bet: BankBet = {
      id:         newBetId(),
      sport,
      league,
      matchLabel,
      market:     market || 'Resultado Final',
      selection,
      book,
      odd:        parseFloat(odd),
      stake:      parseFloat(stake),
      status:     'pending',
      placedAt:   new Date().toISOString(),
      source:     'manual',
    };
    onSave(bet);
    onClose();
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 999,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14,
        padding: 24, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontFamily: 'var(--font-cond)', fontSize: 20, fontWeight: 800,
            textTransform: 'uppercase', letterSpacing: '-0.01em', color: 'var(--text)' }}>
            Nova Aposta
          </div>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer',
              fontSize: 22, lineHeight: 1, padding: '0 4px' }}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Esporte + Liga */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <span style={label}>Esporte</span>
              <select value={sport} onChange={e => setSport(e.target.value)} style={field}>
                {SPORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <span style={label}>Liga</span>
              <input id="bf-league" value={league} onChange={e => setLeague(e.target.value)}
                placeholder="Brasileirão A" style={field} required />
            </div>
          </div>

          {/* Partida */}
          <div>
            <span style={label}>Partida</span>
            <input value={matchLabel} onChange={e => setMatchLabel(e.target.value)}
              placeholder="Flamengo vs Palmeiras" style={field} required />
          </div>

          {/* Mercado + Seleção */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <span style={label}>Mercado</span>
              <select value={market} onChange={e => setMarket(e.target.value)} style={field}>
                <option value="">Selecione...</option>
                {MARKETS.map(m => <option key={m} value={m}>{m}</option>)}
                {market && !MARKETS.includes(market) && (
                  <option value={market}>{market}</option>
                )}
              </select>
            </div>
            <div>
              <span style={label}>Seleção</span>
              <input value={selection} onChange={e => setSelection(e.target.value)}
                placeholder="Flamengo / Over 2.5" style={field} required />
            </div>
          </div>

          {/* Casa + Odd + Stake */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 84px 84px', gap: 12 }}>
            <div>
              <span style={label}>Casa de Apostas</span>
              <input value={book} onChange={e => setBook(e.target.value)}
                placeholder="Bet365" style={field} required />
            </div>
            <div>
              <span style={label}>Odd</span>
              <input type="number" step="0.01" min="1.01" value={odd}
                onChange={e => setOdd(e.target.value)}
                placeholder="2.10" style={field} required />
            </div>
            <div>
              <span style={label}>Stake R$</span>
              <input type="number" step="1" min="1" value={stake}
                onChange={e => setStake(e.target.value)}
                placeholder="50" style={field} required />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: '10px 0', borderRadius: 8, background: 'var(--s2)',
                border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 13,
                fontWeight: 700, cursor: 'pointer' }}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-lime" style={{ flex: 2, padding: '10px 0', fontSize: 13 }}>
              Adicionar Aposta →
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
