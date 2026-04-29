import type React from 'react';
import { getLocale } from 'next-intl/server';
import { getTips } from '@/lib/tips/fetcher';
import { TipRow } from '@/components/tips/TipRow';

const SPORT_OPTIONS = [
  { value: 'all',        label: 'Todos' },
  { value: 'football',  label: '⚽ Futebol' },
  { value: 'basketball',label: '🏀 Basquete' },
  { value: 'tennis',    label: '🎾 Tênis' },
  { value: 'mma',       label: '🥊 MMA' },
];

const EV_OPTIONS = [
  { value: '',     label: 'Qualquer EV' },
  { value: '0',    label: 'EV+' },
  { value: '0.05', label: 'EV > 5%' },
  { value: '0.10', label: 'EV > 10%' },
];

export default async function TipsPage() {
  const locale = await getLocale();
  const tips = await getTips();
  const positiveEV = tips.filter(t => t.ev > 0);
  const elite = tips.filter(t => t.confidenceBand === 'elite');
  const avgEV = positiveEV.length > 0
    ? positiveEV.reduce((s, t) => s + t.ev, 0) / positiveEV.length
    : 0;
  const topTip = positiveEV[0];

  const sportIcons: Record<string, string> = { football: '⚽', basketball: '🏀', tennis: '🎾', mma: '🥊' };
  const sportLabels: Record<string, string> = { football: 'Futebol', basketball: 'Basquete', tennis: 'Tênis', mma: 'MMA' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── KPIs ────────────────────────────────────────────── */}
      <div className="kpi-row">
        {[
          { label: 'Tips disponíveis', value: tips.length,                              accent: 'var(--lime)'  },
          { label: 'EV positivo',      value: positiveEV.length,                        accent: 'var(--green)' },
          { label: 'EV médio',         value: `+${(avgEV * 100).toFixed(1)}%`,           accent: 'var(--lime)'  },
          { label: 'Elite',            value: elite.length,                             accent: 'var(--amber)' },
        ].map(s => (
          <div key={s.label} className="kpi" style={{ '--kpi-accent': s.accent } as React.CSSProperties}>
            <div className="kpi-label">{s.label}</div>
            <div className="kpi-val" style={{ color: s.accent }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── Filters ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        {SPORT_OPTIONS.map((o, i) => (
          <button key={o.value} className={`stab${i === 0 ? ' on' : ''}`}>{o.label}</button>
        ))}
        <span style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px', flexShrink: 0 }} />
        {EV_OPTIONS.map((o, i) => (
          <button key={o.value} className={`stab${i === 0 ? ' on' : ''}`}>{o.label}</button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--dim)' }}>
          {positiveEV.length} com EV+
        </span>
      </div>

      {/* ── Main: list + sidebar ────────────────────────────── */}
      <div className="page-grid" style={{ '--pg-cols': '1fr 272px', gap: 14 } as React.CSSProperties}>

        {/* Tips list */}
        <div className="table-wrap">
          <div className="card" style={{ overflow: 'hidden' }}>
            {/* Table header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '24px 1fr 100px 58px 68px 40px 96px',
              gap: 10, padding: '9px 16px',
              background: 'var(--s2)', borderBottom: '1px solid var(--border)',
              fontSize: 10, fontWeight: 700, letterSpacing: '0.07em',
              textTransform: 'uppercase', color: 'var(--muted)',
            }}>
              <div />
              <div>Partida · Mercado</div>
              <div>Seleção</div>
              <div style={{ textAlign: 'center' }}>Odd</div>
              <div style={{ textAlign: 'center' }}>EV</div>
              <div style={{ textAlign: 'center' }}>Conf</div>
              <div style={{ textAlign: 'right' }}>Casa · Exp.</div>
            </div>
            {tips.map((tip, i) => (
              <TipRow key={tip.id} tip={tip} locale={locale} isLast={i === tips.length - 1} />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="page-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Best EV highlight */}
          {topTip && (
            <div className="card" style={{ boxShadow: '0 0 0 1px oklch(80% 0.3 115 / 0.2), 0 8px 24px oklch(80% 0.3 115 / 0.08)' }}>
              <div className="card-head">
                <div className="card-title">🔥 Melhor EV</div>
                <span className="ev-badge lime">+{(topTip.ev * 100).toFixed(1)}%</span>
              </div>
              <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{topTip.matchLabel}</div>
                <div style={{ fontSize: 14, fontWeight: 800, fontFamily: 'var(--font-cond)', color: 'var(--text)' }}>
                  {topTip.selection}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>{topTip.market} · {topTip.book}</span>
                  <span style={{ fontFamily: 'var(--font-cond)', fontSize: 22, fontWeight: 900, color: 'var(--lime)' }}>
                    @{topTip.odd.toFixed(2)}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 2 }}>
                  <a href={topTip.affiliateUrl} target="_blank" rel="sponsored noopener noreferrer"
                    className="btn btn-lime"
                    style={{ fontSize: 11, textAlign: 'center', textDecoration: 'none', padding: '7px 0' }}>
                    Apostar →
                  </a>
                  <a href={`/${locale}/banca/apostas?tipId=${topTip.id}`}
                    style={{ fontSize: 11, fontWeight: 700, textAlign: 'center', padding: '7px 0', borderRadius: 7, border: '1px solid var(--border)', color: 'var(--text)', background: 'var(--s2)', textDecoration: 'none' }}>
                    + Banca
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Elite tips */}
          {elite.length > 0 && (
            <div className="card" style={{ overflow: 'hidden' }}>
              <div className="card-head">
                <div className="card-title">⭐ Tips Elite</div>
                <span className="ev-badge lime">{elite.length}</span>
              </div>
              {elite.slice(0, 4).map((tip, i) => (
                <div key={tip.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px',
                  borderBottom: i < Math.min(elite.length, 4) - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {tip.matchLabel}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {tip.selection}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'var(--font-cond)', fontSize: 15, fontWeight: 900, color: 'var(--lime)' }}>
                      {tip.odd.toFixed(2)}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--green)', fontWeight: 700 }}>
                      +{(tip.ev * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Por esporte */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="card-head">
              <div className="card-title">Por Esporte</div>
            </div>
            {(['football', 'basketball', 'tennis', 'mma'] as const).map((sport, i, arr) => {
              const count = tips.filter(t => t.sport === sport).length;
              const evPos  = tips.filter(t => t.sport === sport && t.ev > 0).length;
              return (
                <div key={sport} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px',
                  borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <span style={{ fontSize: 14 }}>{sportIcons[sport]}</span>
                  <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{sportLabels[sport]}</span>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>{count}</span>
                  {evPos > 0 && <span className="ev-badge lime" style={{ fontSize: 9 }}>{evPos} EV+</span>}
                </div>
              );
            })}
          </div>

          <div style={{ fontSize: 10, color: 'var(--dim)', lineHeight: 1.6, padding: '0 2px' }}>
            Análise estatística via consensus devigorizado. Sem garantia de resultado.
          </div>
        </div>

      </div>
    </div>
  );
}
