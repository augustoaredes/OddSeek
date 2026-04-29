import type React from 'react';
import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import { getSuggestedParlaysAsync } from '@/lib/tips/parlay-suggestions';
import { ParlayCard } from '@/components/parlays/ParlayCard';

export default async function MultiplasPage() {
  const locale = await getLocale();
  const parlays = await getSuggestedParlaysAsync();

  const positiveEV  = parlays.filter(p => p.analysis.ev > 0);
  const avgEV       = positiveEV.length > 0 ? positiveEV.reduce((s, p) => s + p.analysis.ev, 0) / positiveEV.length : 0;
  const bestParlay  = parlays.reduce((a, p) => p.analysis.ev > a.analysis.ev ? p : a, parlays[0]);
  const avgOdd      = parlays.length > 0 ? parlays.reduce((s, p) => s + p.analysis.parlayOdd, 0) / parlays.length : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── KPIs ─────────────────────────────────────────── */}
      <div className="kpi-row">
        {[
          { label: 'Múltiplas disponíveis', value: parlays.length,                                      accent: 'var(--lime)'  },
          { label: 'EV positivo',           value: positiveEV.length,                                   accent: 'var(--green)' },
          { label: 'EV médio',              value: avgEV > 0 ? `+${(avgEV * 100).toFixed(1)}%` : '—',  accent: 'var(--lime)'  },
          { label: 'Odd média',             value: avgOdd > 0 ? avgOdd.toFixed(2) : '—',               accent: 'var(--amber)' },
        ].map(s => (
          <div key={s.label} className="kpi" style={{ '--kpi-accent': s.accent } as React.CSSProperties}>
            <div className="kpi-label">{s.label}</div>
            <div className="kpi-val" style={{ color: s.accent }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)' }}>
        <button className="tab on" style={{ borderBottom: '2px solid var(--lime)', borderRadius: 0, paddingBottom: 10 }}>Sugeridas</button>
        <button className="tab" style={{ borderBottom: '2px solid transparent', borderRadius: 0, paddingBottom: 10 }}>Construir</button>
      </div>

      {/* ── Main: grid + sidebar ─────────────────────────── */}
      <div className="page-grid" style={{ '--pg-cols': '1fr 264px', gap: 14 } as React.CSSProperties}>

        {/* Parlays grid */}
        <div>
          {parlays.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)', fontSize: 14 }}>
              Nenhuma múltipla disponível no momento.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
              {parlays.map(parlay => (
                <ParlayCard key={parlay.id} parlay={parlay} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="page-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Best parlay highlight */}
          {bestParlay && (
            <div className="card" style={{ boxShadow: '0 0 0 1px oklch(80% 0.3 115 / 0.2), 0 8px 24px oklch(80% 0.3 115 / 0.08)' }}>
              <div className="card-head">
                <div className="card-title">🔥 Melhor Múltipla</div>
                <span className="ev-badge lime">+{(bestParlay.analysis.ev * 100).toFixed(1)}%</span>
              </div>
              <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {bestParlay.legs.map(({ tip }, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted)', fontFamily: 'var(--font-cond)', width: 14, flexShrink: 0 }}>{i + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tip.selection}</div>
                      <div style={{ fontSize: 10, color: 'var(--muted)' }}>{tip.matchLabel}</div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-cond)', fontSize: 14, fontWeight: 900, color: 'var(--lime)' }}>{tip.odd.toFixed(2)}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>Odd total</span>
                  <span style={{ fontFamily: 'var(--font-cond)', fontSize: 20, fontWeight: 900, color: 'var(--lime)' }}>
                    {bestParlay.analysis.parlayOdd.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* How it works */}
          <div className="card" style={{ padding: '14px 16px' }}>
            <div className="card-title" style={{ marginBottom: 10 }}>Como funciona</div>
            {[
              { icon: '✅', text: 'Apenas tips com EV+ são combinadas' },
              { icon: '🎯', text: 'Eventos distintos — sem correlação' },
              { icon: '🚫', text: 'Bloqueado se prob. < 15% ou EV negativo' },
              { icon: '📊', text: 'Probabilidade combinada assume independência' },
            ].map(item => (
              <div key={item.icon} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 12, flexShrink: 0 }}>{item.icon}</span>
                <span style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>{item.text}</span>
              </div>
            ))}
          </div>

          {/* Risk legend */}
          <div className="card" style={{ padding: '14px 16px' }}>
            <div className="card-title" style={{ marginBottom: 10 }}>Nível de Risco</div>
            {[
              { color: 'var(--green)', label: 'Baixo',  desc: '≤2 pernas, prob ≥ 40%' },
              { color: 'var(--amber)', label: 'Médio',  desc: '3 pernas ou prob 20-40%' },
              { color: 'var(--red)',   label: 'Alto',   desc: 'Bloqueado — não sugerido' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: item.color, width: 44, flexShrink: 0 }}>{item.label}</span>
                <span style={{ fontSize: 10, color: 'var(--muted)' }}>{item.desc}</span>
              </div>
            ))}
          </div>

          {/* Link to tips */}
          <Link href={`/${locale}/tips`}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 16px', borderRadius: 8, background: 'var(--s2)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
            Ver Todas as Tips →
          </Link>

        </div>
      </div>

    </div>
  );
}
