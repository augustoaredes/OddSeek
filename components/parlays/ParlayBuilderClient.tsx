'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import type { Tip } from '@/lib/tips/mock-data';

interface Props {
  tips: Tip[];
  locale: string;
}

function calcEV(prob: number, odd: number): number {
  const safeProp = Math.max(0, Math.min(1, prob || 0));
  const safeOdd  = Math.max(1.01, Math.min(1000, odd || 1.01));
  const raw = safeProp * safeOdd - 1;
  return isFinite(raw) && Math.abs(raw) <= 9.99 ? raw : -1;
}

export function ParlayBuilderClient({ tips }: Props) {
  const locale = useLocale();
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return tips.filter(t =>
      !q ||
      t.matchLabel.toLowerCase().includes(q) ||
      t.selection.toLowerCase().includes(q) ||
      t.league.toLowerCase().includes(q)
    );
  }, [tips, search]);

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 8) next.add(id);
      return next;
    });
  }

  const legs = useMemo(() =>
    tips.filter(t => selected.has(t.id)),
    [tips, selected]);

  const combinedOdd = useMemo(() =>
    legs.reduce((acc, t) => acc * t.odd, 1),
    [legs]);

  const combinedProb = useMemo(() =>
    legs.reduce((acc, t) => acc * t.probability, 1),
    [legs]);

  const ev = legs.length >= 2 ? calcEV(combinedProb, combinedOdd) : null;

  function handleRegister() {
    if (legs.length < 2) return;
    const ids = legs.map(l => l.id).join(',');
    router.push(`/${locale}/banca/apostas?parlay=${ids}`);
  }

  const evColor = ev === null ? 'var(--text)' : ev >= 0.05 ? 'var(--lime)' : ev >= 0 ? 'var(--green)' : 'var(--red)';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>

      {/* Left: tip list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Search */}
        <input
          type="text"
          placeholder="Buscar por partida, seleção ou liga…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '10px 14px',
            fontSize: 13,
            color: 'var(--text)',
            outline: 'none',
            width: '100%',
          }}
        />

        <div style={{ fontSize: 11, color: 'var(--text)', opacity: 0.7 }}>
          {filtered.length} tips disponíveis · Selecione de 2 a 8 pernas
        </div>

        {/* Tips */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.map(tip => {
            const isSelected = selected.has(tip.id);
            const tipEV = calcEV(tip.probability, tip.odd);
            return (
              <button
                key={tip.id}
                onClick={() => toggle(tip.id)}
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  background: isSelected ? 'oklch(80% 0.3 115 / 0.08)' : 'var(--surface)',
                  border: `1px solid ${isSelected ? 'oklch(80% 0.3 115 / 0.4)' : 'var(--border)'}`,
                  borderRadius: 8,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.12s',
                  width: '100%',
                }}
              >
                {/* Checkbox */}
                <div style={{
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  border: `1.5px solid ${isSelected ? 'var(--lime)' : 'var(--border)'}`,
                  background: isSelected ? 'var(--lime)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.12s',
                }}>
                  {isSelected && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M1.5 5l2.5 2.5 5-5" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 10, fontFamily: 'var(--font-cond)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text)', opacity: 0.6 }}>
                      {tip.league}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {tip.matchLabel.replace(/^[^\s]+\s/, '')}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text)', opacity: 0.75, marginTop: 1 }}>
                    {tip.selection} — {tip.market}
                  </div>
                </div>

                {/* Odd + EV */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'var(--font-cond)', fontSize: 18, fontWeight: 900, color: 'var(--lime)', lineHeight: 1 }}>
                    {tip.odd.toFixed(2)}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: tipEV >= 0 ? 'var(--green)' : 'var(--red)', marginTop: 2 }}>
                    EV {tipEV >= 0 ? '+' : ''}{(tipEV * 100).toFixed(1)}%
                  </div>
                </div>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text)', opacity: 0.6, fontSize: 13 }}>
              Nenhuma tip encontrada.
            </div>
          )}
        </div>
      </div>

      {/* Right: builder summary */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, position: 'sticky', top: 16, alignSelf: 'start' }}>
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          overflow: 'hidden',
        }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-cond)', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text)', opacity: 0.8 }}>
              Minha Múltipla
            </span>
            <span style={{ fontSize: 11, color: 'var(--text)', opacity: 0.6 }}>
              {legs.length}/8 pernas
            </span>
          </div>

          {legs.length === 0 ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text)', opacity: 0.55, fontSize: 13 }}>
              Selecione pelo menos 2 tips da lista ao lado.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {legs.map((leg, i) => (
                <div key={leg.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text)', opacity: 0.5, fontFamily: 'var(--font-cond)', width: 14, flexShrink: 0 }}>{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{leg.selection}</div>
                    <div style={{ fontSize: 10, color: 'var(--text)', opacity: 0.6 }}>{leg.matchLabel.replace(/^[^\s]+\s/, '')}</div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-cond)', fontSize: 14, fontWeight: 900, color: 'var(--lime)', flexShrink: 0 }}>{leg.odd.toFixed(2)}</span>
                  <button
                    onClick={() => toggle(leg.id)}
                    type="button"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', opacity: 0.4, padding: '2px 4px', flexShrink: 0 }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Summary stats */}
          {legs.length >= 2 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--border)', borderTop: '1px solid var(--border)' }}>
              {[
                { label: 'Odd Total', value: combinedOdd.toFixed(2), color: 'var(--text)' },
                { label: 'Prob. Comb.', value: `${(combinedProb * 100).toFixed(1)}%`, color: 'var(--text)' },
                { label: 'EV Total', value: `${ev! >= 0 ? '+' : ''}${(ev! * 100).toFixed(1)}%`, color: evColor },
                { label: 'Pernas', value: `${legs.length}`, color: 'var(--text)' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--surface)', padding: '10px 14px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-cond)', fontSize: 18, fontWeight: 900, color: s.color, lineHeight: 1, marginBottom: 3 }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: 'var(--text)', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <div style={{ padding: '12px 16px' }}>
            <button
              onClick={handleRegister}
              disabled={legs.length < 2}
              type="button"
              style={{
                width: '100%',
                padding: '12px 0',
                borderRadius: 8,
                background: legs.length >= 2 ? 'var(--lime)' : 'var(--dim)',
                border: 'none',
                color: legs.length >= 2 ? '#000' : 'var(--text)',
                fontSize: 13,
                fontWeight: 800,
                fontFamily: 'var(--font-cond)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: legs.length >= 2 ? 'pointer' : 'not-allowed',
                opacity: legs.length >= 2 ? 1 : 0.5,
                transition: 'all 0.15s',
              }}
            >
              {legs.length < 2 ? `Selecione ${2 - legs.length} tip${legs.length === 1 ? '' : 's'} mais` : 'Registrar Múltipla na Banca →'}
            </button>
            {legs.length >= 2 && ev !== null && ev < 0 && (
              <div style={{ marginTop: 8, fontSize: 11, color: 'var(--amber)', textAlign: 'center' }}>
                ⚠ EV negativo — esta múltipla não tem edge estatístico.
              </div>
            )}
          </div>
        </div>

        <div style={{ fontSize: 11, color: 'var(--text)', opacity: 0.55, lineHeight: 1.6, padding: '0 2px' }}>
          Prob. combinada assume independência entre eventos. Evite pernas do mesmo jogo.
        </div>
      </div>
    </div>
  );
}
