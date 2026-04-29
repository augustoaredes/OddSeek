import Link from 'next/link';
import { ConfidenceRing } from './ConfidenceRing';
import { EVBadge } from '@/components/odds/EVBadge';
import { BookmakerBadge } from '@/components/odds/BookmakerBadge';
import type { Tip } from '@/lib/tips/mock-data';

interface TipCardProps {
  tip: Tip;
  locale: string;
}

const BAND_LABELS = {
  low:    'BAIXA',
  medium: 'MÉDIA',
  high:   'ALTA',
  elite:  'ELITE',
};

function timeUntil(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return 'Expirou';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function TipCard({ tip, locale }: TipCardProps) {
  return (
    <article
      style={{
        background: 'var(--surface)',
        border: `1px solid ${tip.evBand !== 'negative' ? 'var(--border)' : 'var(--border)'}`,
        borderRadius: 12,
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {/* Top row: sport / league / expiry */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
            }}
          >
            {tip.sport}
          </span>
          <span style={{ color: 'var(--dim)', fontSize: 11 }}>·</span>
          <span style={{ fontSize: 11, color: 'var(--muted)', fontStyle: 'italic' }}>
            {tip.league}
          </span>
        </div>
        <span style={{ fontSize: 11, color: 'var(--dim)' }}>
          ⏱ {timeUntil(tip.expiresAt)}
        </span>
      </div>

      {/* Match label */}
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>
        {tip.matchLabel}
      </div>

      {/* Main row: ring + selection + badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <ConfidenceRing value={tip.confidence} size={48} />

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Market */}
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 3 }}>
            {tip.market}
          </div>
          {/* Selection */}
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              fontFamily: 'var(--font-cond), Barlow Condensed, sans-serif',
              color: 'var(--text)',
              letterSpacing: '-0.01em',
            }}
          >
            {tip.selection}
          </div>
          {/* Confidence band label */}
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              color:
                tip.confidenceBand === 'elite' ? 'var(--lime)' :
                tip.confidenceBand === 'high'  ? 'var(--green)' :
                tip.confidenceBand === 'medium'? 'var(--amber)' :
                'var(--muted)',
              marginTop: 2,
            }}
          >
            {BAND_LABELS[tip.confidenceBand]}
          </div>
        </div>

        {/* Right side: odd + EV */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div
            style={{
              fontSize: 24,
              fontWeight: 900,
              fontFamily: 'var(--font-cond), Barlow Condensed, sans-serif',
              color: 'var(--lime)',
              letterSpacing: '-0.01em',
              lineHeight: 1,
            }}
          >
            {tip.odd.toFixed(2)}
          </div>
          <div style={{ marginTop: 4 }}>
            <EVBadge ev={tip.ev} showNegative />
          </div>
        </div>
      </div>

      {/* Bottom row: book + CTA buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          paddingTop: 12,
          borderTop: '1px solid var(--border)',
        }}
      >
        <BookmakerBadge book={tip.book} />

        <div style={{ display: 'flex', gap: 8 }}>
          {/* Add to bankroll */}
          <Link
            href={`/${locale}/banca/apostas?tipId=${tip.id}`}
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '6px 12px',
              borderRadius: 6,
              background: 'var(--s2)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              textDecoration: 'none',
              letterSpacing: '0.03em',
            }}
          >
            + Banca
          </Link>
          {/* Bet now → affiliate redirect */}
          <a
            href={tip.affiliateUrl}
            target="_blank"
            rel="sponsored noopener noreferrer"
            className="btn btn-lime"
            style={{ fontSize: 11, padding: '6px 14px' }}
          >
            Apostar
          </a>
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ fontSize: 10, color: 'var(--dim)', lineHeight: 1.5 }}>
        Análise estatística. Sem garantia de resultado.
      </div>
    </article>
  );
}
