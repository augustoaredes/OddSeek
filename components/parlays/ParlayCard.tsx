'use client';

import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { RiskBadge } from './RiskBadge';
import { EVBadge } from '@/components/odds/EVBadge';
import { sanitizeEV } from '@/lib/analytics/ev';
import type { SuggestedParlay } from '@/lib/tips/parlay-suggestions';

const BOOK_COLORS: Record<string, { bg: string; text: string }> = {
  'Bet365':            { bg: '#00843D', text: '#fff' },
  'Betano':            { bg: '#E30613', text: '#fff' },
  'Sportingbet':       { bg: '#1155CC', text: '#fff' },
  'Pixbet':            { bg: '#0057FF', text: '#fff' },
  'Superbet':          { bg: '#7B1FA2', text: '#fff' },
  'Esportes da Sorte': { bg: '#FF6B00', text: '#fff' },
};

interface ParlayCardProps {
  parlay: SuggestedParlay;
}

export function ParlayCard({ parlay }: ParlayCardProps) {
  const { analysis } = parlay;
  const router = useRouter();
  const locale = useLocale();

  function handleSelect() {
    const legs = parlay.legs.map(l => l.tip.id).join(',');
    router.push(`/${locale}/banca/apostas?parlay=${legs}`);
  }

  return (
    <article
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {/* Header: legs count + risk + EV */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
            }}
          >
            {parlay.legs.length} pernas
          </span>
          <RiskBadge riskLevel={analysis.riskLevel as 'low' | 'medium' | 'blocked'} />
        </div>
        <EVBadge ev={analysis.ev} showNegative />
      </div>

      {/* Legs list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {parlay.legs.map(({ tip }, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 12px',
              background: 'var(--s2)',
              borderRadius: 8,
              border: '1px solid var(--border)',
            }}
          >
            <span
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: 'var(--dim)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 800,
                color: 'var(--muted)',
                flexShrink: 0,
              }}
            >
              {i + 1}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: 'var(--text)', opacity: 0.7, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {tip.matchLabel.replace(/^[^\s]+\s/, '')}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>
                {tip.selection}{' '}
                <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: 12 }}>
                  — {tip.market}
                </span>
              </div>
              {tip.book && (() => {
                const bs = BOOK_COLORS[tip.book] ?? { bg: '#3A3D45', text: '#fff' };
                return (
                  <span style={{
                    display: 'inline-block', marginTop: 4,
                    fontSize: 9, fontWeight: 700, letterSpacing: '0.05em',
                    padding: '2px 6px', borderRadius: 3,
                    background: bs.bg, color: bs.text,
                  }}>
                    {tip.book}
                  </span>
                );
              })()}
            </div>
            <span
              style={{
                fontSize: 16,
                fontWeight: 900,
                fontFamily: 'var(--font-cond), Barlow Condensed, sans-serif',
                color: 'var(--lime)',
                letterSpacing: '-0.01em',
                flexShrink: 0,
              }}
            >
              {tip.odd.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Summary stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
          paddingTop: 12,
          borderTop: '1px solid var(--border)',
        }}
      >
        {[
          { label: 'Odd Total',   value: analysis.parlayOdd.toFixed(2) },
          { label: 'Prob. Comb.', value: `${(analysis.combinedProbability * 100).toFixed(1)}%` },
          { label: 'EV Total',    value: `${sanitizeEV(analysis.ev) >= 0 ? '+' : ''}${(sanitizeEV(analysis.ev) * 100).toFixed(1)}%` },
        ].map(stat => (
          <div key={stat.label} style={{ textAlign: 'center' }}>
            <div
              style={{
                fontFamily: 'var(--font-cond), Barlow Condensed, sans-serif',
                fontSize: 20,
                fontWeight: 800,
                color: 'var(--text)',
                lineHeight: 1,
              }}
            >
              {stat.value}
            </div>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div style={{ display: 'flex', gap: 8 }}>
        {parlay.legs[0]?.tip?.affiliateUrl && (
          <a
            href={parlay.legs[0].tip.affiliateUrl}
            target="_blank"
            rel="sponsored noopener noreferrer"
            style={{
              flex: 1,
              padding: '12px 0',
              borderRadius: 8,
              background: 'var(--surface)',
              border: '1px solid var(--lime)',
              color: 'var(--lime)',
              fontSize: 13,
              fontWeight: 800,
              fontFamily: 'var(--font-cond), Barlow Condensed, sans-serif',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              textDecoration: 'none',
              textAlign: 'center',
              display: 'block',
            }}
          >
            Apostar →
          </a>
        )}
        <button
          onClick={handleSelect}
          style={{
            flex: 1,
            padding: '12px 0',
            borderRadius: 8,
            background: 'var(--lime)',
            border: 'none',
            color: '#000',
            fontSize: 13,
            fontWeight: 800,
            fontFamily: 'var(--font-cond), Barlow Condensed, sans-serif',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
          type="button"
        >
          + Banca
        </button>
      </div>
    </article>
  );
}
