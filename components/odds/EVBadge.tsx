import type { RiskBand } from '@/lib/odds/types';

interface EVBadgeProps {
  ev: number;
  /** Show "no value" state for negative EV */
  showNegative?: boolean;
}

function classifyEV(ev: number): RiskBand {
  if (ev <= 0)    return 'negative';
  if (ev < 0.05)  return 'value';
  if (ev < 0.10)  return 'highlight';
  return 'high';
}

const COLORS: Record<RiskBand, string> = {
  negative:  'var(--muted)',
  value:     'var(--green)',
  highlight: 'var(--lime)',
  high:      'var(--lime)',
};

const BG: Record<RiskBand, string> = {
  negative:  'transparent',
  value:     'oklch(55% 0.18 155 / 0.15)',
  highlight: 'oklch(80% 0.3 115 / 0.18)',
  high:      'oklch(80% 0.3 115 / 0.25)',
};

export function EVBadge({ ev, showNegative = false }: EVBadgeProps) {
  const band = classifyEV(ev);
  if (band === 'negative' && !showNegative) return null;

  const sign = ev > 0 ? '+' : '';
  const label = `${sign}${(ev * 100).toFixed(1)}%`;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 7px',
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.04em',
        fontFamily: 'var(--font-cond), Barlow Condensed, sans-serif',
        color: COLORS[band],
        background: BG[band],
        border: band !== 'negative' ? `1px solid ${COLORS[band]}33` : 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}
