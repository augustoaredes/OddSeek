import Link from 'next/link';
import type { Tip } from '@/lib/tips/mock-data';

interface TipRowProps {
  tip: Tip;
  locale: string;
  isLast: boolean;
}

function timeUntil(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return 'Exp.';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return h > 0 ? `${h}h${m}m` : `${m}m`;
}

const SPORT_ICONS: Record<string, string> = {
  football:   '⚽',
  basketball: '🏀',
  tennis:     '🎾',
  mma:        '🥊',
  baseball:   '⚾',
  hockey:     '🏒',
};

const BAND_COLOR: Record<string, string> = {
  elite:  'var(--lime)',
  high:   'var(--green)',
  medium: 'var(--amber)',
  low:    'var(--muted)',
};

export function TipRow({ tip, locale, isLast }: TipRowProps) {
  const confColor = BAND_COLOR[tip.confidenceBand] ?? 'var(--muted)';
  const evColor = tip.ev >= 0.10 ? 'var(--lime)' : tip.ev >= 0.05 ? 'var(--green)' : tip.ev > 0 ? 'var(--amber)' : 'var(--red)';

  const r = 13;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - tip.confidence / 100);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '24px 1fr 100px 58px 68px 40px 96px',
        gap: 10,
        padding: '10px 16px',
        borderBottom: isLast ? 'none' : '1px solid var(--border)',
        alignItems: 'center',
        transition: 'background 0.12s',
      }}
      className="tip-row"
    >
      {/* Sport icon */}
      <span style={{ fontSize: 14, lineHeight: 1 }}>
        {SPORT_ICONS[tip.sport] ?? '🎯'}
      </span>

      {/* Match + market */}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {tip.matchLabel}
        </div>
        <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {tip.league} · {tip.market}
        </div>
      </div>

      {/* Selection */}
      <div style={{
        fontSize: 11, fontWeight: 700, color: confColor,
        background: `${confColor}18`,
        border: `1px solid ${confColor}44`,
        borderRadius: 5, padding: '3px 7px',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        textAlign: 'center',
      }}>
        {tip.selection}
      </div>

      {/* Odd */}
      <div style={{
        fontFamily: 'var(--font-cond), Barlow Condensed, sans-serif',
        fontSize: 18, fontWeight: 900, color: 'var(--lime)',
        letterSpacing: '-0.01em', textAlign: 'center', lineHeight: 1,
      }}>
        {tip.odd.toFixed(2)}
      </div>

      {/* EV badge */}
      <div style={{ textAlign: 'center' }}>
        <span style={{
          display: 'inline-block',
          fontSize: 11, fontWeight: 800,
          color: evColor,
          background: `${evColor}18`,
          border: `1px solid ${evColor}44`,
          borderRadius: 5, padding: '3px 7px',
          letterSpacing: '0.02em',
          fontFamily: 'var(--font-cond)',
        }}>
          {tip.ev >= 0 ? '+' : ''}{(tip.ev * 100).toFixed(1)}%
        </span>
      </div>

      {/* Confidence ring (mini) */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg width="30" height="30" viewBox="0 0 30 30" style={{ display: 'block' }}>
          <circle cx="15" cy="15" r={r} fill="none" stroke="var(--dim)" strokeWidth="2.5" />
          <circle
            cx="15" cy="15" r={r} fill="none"
            stroke={confColor} strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 15 15)"
          />
          <text x="15" y="16" textAnchor="middle" dominantBaseline="middle"
            fontSize="8" fontWeight="700" fill={confColor}
            fontFamily="var(--font-cond), Barlow Condensed, sans-serif">
            {tip.confidence}
          </text>
        </svg>
      </div>

      {/* Book + expiry + action */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
        <div style={{ fontSize: 10, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
          {tip.book} · {timeUntil(tip.expiresAt)}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <Link
            href={`/${locale}/banca/apostas?tipId=${tip.id}`}
            style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: 'var(--s2)', border: '1px solid var(--border)', color: 'var(--text)', textDecoration: 'none' }}
          >
            Banca
          </Link>
          <a
            href={tip.affiliateUrl}
            target="_blank"
            rel="sponsored noopener noreferrer"
            style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: 'oklch(80% 0.3 115 / 0.15)', border: '1px solid oklch(80% 0.3 115 / 0.4)', color: 'var(--lime)', textDecoration: 'none' }}
          >
            Apostar
          </a>
        </div>
      </div>
    </div>
  );
}
