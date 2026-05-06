'use client';

import { useEffect, useState, useCallback } from 'react';
import type { ArbOpportunity, ArbLeg } from '@/lib/analytics/arbitrage';
import { calcArbStakes } from '@/lib/analytics/arbitrage';

const SPORT_ICONS: Record<string, string> = {
  football: '⚽',
  basketball: '🏀',
  tennis: '🎾',
  mma: '🥊',
  baseball: '⚾',
  hockey: '🏒',
};

const SPORT_LABELS: Record<string, string> = {
  football: 'Futebol',
  basketball: 'Basquete',
  tennis: 'Tênis',
  mma: 'MMA',
  baseball: 'Beisebol',
  hockey: 'Hockey',
};

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function ArbCard({ opp, stake }: { opp: ArbOpportunity; stake: number }) {
  const { stakes, profit } = calcArbStakes(opp.legs, stake);
  const profitPct = stake > 0 ? ((profit / stake) * 100).toFixed(2) : '0.00';

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Live badge + ARB badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {opp.status === 'live' && (
          <span
            style={{
              background: 'var(--red)',
              color: '#fff',
              fontSize: 10,
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: 4,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            AO VIVO
          </span>
        )}
        <span
          style={{
            background: 'rgba(204,255,0,0.12)',
            color: 'var(--lime)',
            fontSize: 11,
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: 4,
            letterSpacing: '0.04em',
          }}
        >
          ARB +{opp.arbPct}%
        </span>
        <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 'auto' }}>
          {SPORT_ICONS[opp.sport] ?? '🏅'} {SPORT_LABELS[opp.sport] ?? opp.sport} · {opp.league}
        </span>
      </div>

      {/* Event info */}
      <div>
        <div style={{ fontFamily: 'var(--font-cond)', fontWeight: 800, fontSize: 18, color: 'var(--text)', lineHeight: 1.2 }}>
          {opp.eventLabel}
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>
          {opp.marketLabel} · {formatTime(opp.startsAt)}
        </div>
      </div>

      {/* Legs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {opp.legs.map((leg: ArbLeg, i: number) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'var(--s2)',
              borderRadius: 8,
              padding: '9px 12px',
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{leg.label}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                {leg.book} ·{' '}
                <span style={{ color: 'var(--text)', fontWeight: 600 }}>
                  R$ {stakes[i]?.toFixed(2) ?? '-'}
                </span>
              </div>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-cond)',
                fontWeight: 800,
                fontSize: 20,
                color: 'var(--lime)',
                minWidth: 48,
                textAlign: 'right',
              }}
            >
              {leg.odd.toFixed(2)}
            </div>
            <a
              href={leg.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'var(--lime)',
                color: '#000',
                fontWeight: 800,
                fontSize: 11,
                padding: '5px 10px',
                borderRadius: 6,
                textDecoration: 'none',
                letterSpacing: '0.02em',
                whiteSpace: 'nowrap',
              }}
            >
              APOSTAR
            </a>
          </div>
        ))}
      </div>

      {/* Resultado garantido */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(204,255,0,0.06)',
          border: '1px solid rgba(204,255,0,0.15)',
          borderRadius: 8,
          padding: '10px 14px',
        }}
      >
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>
          Lucro garantido (R$ {stake.toFixed(0)} apostado)
        </div>
        <div style={{ fontFamily: 'var(--font-cond)', fontWeight: 800, fontSize: 18, color: 'var(--lime)' }}>
          +R$ {profit.toFixed(2)}{' '}
          <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 400 }}>({profitPct}%)</span>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
        textAlign: 'center',
        gap: 16,
      }}
    >
      <div style={{ fontSize: 56 }}>🔍</div>
      <div style={{ fontFamily: 'var(--font-cond)', fontWeight: 800, fontSize: 22, color: 'var(--text)' }}>
        Nenhuma arbitragem detectada
      </div>
      <div style={{ fontSize: 14, color: 'var(--muted)', maxWidth: 360 }}>
        Oportunidades de ARB aparecem quando uma casa oferece odds que, combinadas com outra, garantem lucro independente do resultado.
        <br /><br />
        Com odds reais, surgem constantemente. Aguarde a próxima atualização.
      </div>
    </div>
  );
}

export default function ArbitragePage() {
  const [data, setData] = useState<{ count: number; opportunities: ArbOpportunity[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [stake, setStake] = useState(100);
  const [sportFilter, setSportFilter] = useState('all');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchArb = useCallback(async () => {
    try {
      const res = await fetch(`/api/arbitrage?_=${Date.now()}`);
      if (!res.ok) throw new Error('Falha na requisição');
      const json = await res.json();
      setData(json);
      setLastUpdated(new Date());
    } catch {
      // silently keep old data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArb();
    const interval = setInterval(fetchArb, 30_000); // poll every 30s
    return () => clearInterval(interval);
  }, [fetchArb]);

  const opportunities = data?.opportunities ?? [];
  const filtered = sportFilter === 'all'
    ? opportunities
    : opportunities.filter((o) => o.sport === sportFilter);

  const sports = ['all', ...Array.from(new Set(opportunities.map((o) => o.sport)))];

  return (
    <div style={{ padding: '24px 20px', maxWidth: 860, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h1
            style={{
              fontFamily: 'var(--font-cond)',
              fontWeight: 900,
              fontSize: 28,
              color: 'var(--text)',
              margin: 0,
              letterSpacing: '-0.01em',
              textTransform: 'uppercase',
            }}
          >
            Arbitragem
          </h1>
          {data && (
            <span
              style={{
                background: 'rgba(204,255,0,0.12)',
                color: 'var(--lime)',
                fontSize: 12,
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: 20,
              }}
            >
              {filtered.length} oportunidade{filtered.length !== 1 ? 's' : ''}
            </span>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            {lastUpdated && (
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                Atualizado {lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
            <button
              onClick={fetchArb}
              style={{
                background: 'var(--s2)',
                border: '1px solid var(--border)',
                borderRadius: 7,
                color: 'var(--text)',
                padding: '5px 12px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M11 6A5 5 0 1 1 6 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                <path d="M6 1l2 2-2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Atualizar
            </button>
          </div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6, marginBottom: 0 }}>
          Apostas sem risco — lucro garantido independente do resultado ao combinar odds de diferentes casas.
        </p>
      </div>

      {/* Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 24,
          flexWrap: 'wrap',
        }}
      >
        {/* Stake input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '6px 12px',
            gap: 6,
          }}
        >
          <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
            Banca total (R$)
          </span>
          <input
            type="number"
            value={stake}
            onChange={(e) => setStake(Math.max(1, Number(e.target.value)))}
            min={1}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text)',
              fontFamily: 'var(--font-cond)',
              fontWeight: 700,
              fontSize: 16,
              width: 80,
              textAlign: 'right',
            }}
          />
        </div>

        {/* Sport filter pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {sports.map((s) => (
            <button
              key={s}
              onClick={() => setSportFilter(s)}
              style={{
                background: sportFilter === s ? 'var(--lime)' : 'var(--surface)',
                color: sportFilter === s ? '#000' : 'var(--muted)',
                border: '1px solid',
                borderColor: sportFilter === s ? 'var(--lime)' : 'var(--border)',
                borderRadius: 20,
                padding: '4px 12px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {s === 'all' ? 'Todos' : `${SPORT_ICONS[s] ?? ''} ${SPORT_LABELS[s] ?? s}`}
            </button>
          ))}
        </div>
      </div>

      {/* Explainer box */}
      <div
        style={{
          background: 'rgba(79,163,255,0.07)',
          border: '1px solid rgba(79,163,255,0.18)',
          borderRadius: 10,
          padding: '12px 16px',
          marginBottom: 24,
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
          <circle cx="8" cy="8" r="7" stroke="var(--blue)" strokeWidth="1.2"/>
          <path d="M8 5v1M8 8v4" stroke="var(--blue)" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--text)' }}>Como funciona:</strong> Para cada oportunidade, apostas os valores sugeridos em cada casa. Independente do resultado, você recebe o retorno garantido. Ajuste a <em>Banca total</em> para ver os valores reais de stake.
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                height: 220,
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map((opp) => (
            <ArbCard key={`${opp.eventId}-${opp.market}`} opp={opp} stake={stake} />
          ))}
        </div>
      )}
    </div>
  );
}
