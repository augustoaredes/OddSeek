'use client';

import { EVBadge } from './EVBadge';

interface OddCellProps {
  odd: number;
  ev: number;
  isBest: boolean;
  affiliateUrl: string;
  book: string;
  eventId?: string;
}

export function OddCell({ odd, ev, isBest, affiliateUrl, book, eventId }: OddCellProps) {
  async function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    try {
      const res = await fetch('/api/afiliado/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ book, targetUrl: affiliateUrl, eventId }),
      });
      const data = await res.json().catch(() => ({}));
      window.open(data.url ?? affiliateUrl, '_blank', 'noopener,noreferrer');
    } catch {
      window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
    }
  }

  return (
    <a
      href={affiliateUrl}
      onClick={handleClick}
      rel="sponsored noopener noreferrer"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        padding: '10px 8px',
        borderRadius: 8,
        background: isBest ? 'oklch(80% 0.3 115 / 0.12)' : 'var(--s2)',
        border: `1px solid ${isBest ? 'oklch(80% 0.3 115 / 0.4)' : 'var(--border)'}`,
        textDecoration: 'none',
        transition: 'background 0.15s, border-color 0.15s',
        cursor: 'pointer',
        minWidth: 72,
      }}
      title={`Apostar ${odd.toFixed(2)} na ${book}`}
    >
      <span style={{ fontSize: 17, fontWeight: 800, fontFamily: 'var(--font-cond), Barlow Condensed, sans-serif', color: isBest ? 'var(--lime)' : 'var(--text)', letterSpacing: '-0.01em', lineHeight: 1 }}>
        {odd.toFixed(2)}
      </span>
      <EVBadge ev={ev} showNegative={false} />
      {isBest && (
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--lime)', opacity: 0.8 }}>
          MELHOR
        </span>
      )}
    </a>
  );
}
