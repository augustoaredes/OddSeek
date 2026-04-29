import { EVBadge } from './EVBadge';

interface OddCellProps {
  odd: number;
  ev: number;
  isBest: boolean;
  affiliateUrl: string;
}

export function OddCell({ odd, ev, isBest, affiliateUrl }: OddCellProps) {
  return (
    <a
      href={affiliateUrl}
      target="_blank"
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
      title={`Apostar na ${isBest ? 'melhor odd' : ''} ${odd}`}
    >
      <span
        style={{
          fontSize: 17,
          fontWeight: 800,
          fontFamily: 'var(--font-cond), Barlow Condensed, sans-serif',
          color: isBest ? 'var(--lime)' : 'var(--text)',
          letterSpacing: '-0.01em',
          lineHeight: 1,
        }}
      >
        {odd.toFixed(2)}
      </span>
      <EVBadge ev={ev} showNegative={false} />
      {isBest && (
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--lime)',
            opacity: 0.8,
          }}
        >
          MELHOR
        </span>
      )}
    </a>
  );
}
