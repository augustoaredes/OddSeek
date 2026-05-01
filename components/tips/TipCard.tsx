import Link from 'next/link';
import { ConfidenceRing } from './ConfidenceRing';
import { BookmakerBadge } from '@/components/odds/BookmakerBadge';
import { sanitizeEV } from '@/lib/analytics/ev';
import { kellyFraction } from '@/lib/banca/stake';
import type { Tip } from '@/lib/tips/mock-data';

interface TipCardProps {
  tip: Tip;
  locale: string;
  rank?: number;
  highlight?: boolean;
  bankroll?: number;
}

function timeUntil(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return 'Expirou';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function suggestedR$(probability: number, odd: number, bankroll = 1000): number {
  const b = odd - 1;
  const kelly = kellyFraction(probability, b);
  if (kelly <= 0) return 0;
  const half = kelly * 0.5;
  const capped = Math.min(half, 0.03);
  return Math.round(bankroll * capped);
}

function evBorderStyle(ev: number): { borderColor: string; boxShadow: string } {
  const safe = sanitizeEV(ev);
  if (safe >= 0.10) return {
    borderColor: 'oklch(80% 0.3 115 / 0.6)',
    boxShadow: '0 0 0 1px oklch(80% 0.3 115 / 0.2), 0 4px 20px oklch(80% 0.3 115 / 0.10)',
  };
  if (safe >= 0.05) return {
    borderColor: 'oklch(65% 0.2 150 / 0.5)',
    boxShadow: '0 0 0 1px oklch(65% 0.2 150 / 0.15)',
  };
  return { borderColor: 'var(--border)', boxShadow: 'none' };
}

const RANK_COLORS = ['#CCFF00', '#00DC6E', '#4FA3FF'];

export function TipCard({ tip, locale, rank, highlight, bankroll = 1000 }: TipCardProps) {
  const ev = sanitizeEV(tip.ev);
  const border = evBorderStyle(ev);
  const stake = suggestedR$(tip.probability, tip.odd, bankroll);
  const isExpired = new Date(tip.expiresAt).getTime() <= Date.now();
  const timeLeft = timeUntil(tip.expiresAt);
  const isUrgent = !isExpired && new Date(tip.expiresAt).getTime() - Date.now() < 30 * 60000;

  return (
    <article
      className="tip-card"
      style={{
        background: highlight ? 'oklch(80% 0.3 115 / 0.04)' : 'var(--surface)',
        border: `1px solid ${border.borderColor}`,
        boxShadow: border.boxShadow,
        borderRadius: 12,
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Rank badge */}
      {rank !== undefined && rank <= 3 && (
        <span style={{
          position: 'absolute', top: 12, right: 12,
          background: RANK_COLORS[rank - 1] ?? 'var(--dim)',
          color: '#000',
          fontSize: 9, fontWeight: 900,
          letterSpacing: '0.06em',
          padding: '2px 7px', borderRadius: 4,
          fontFamily: 'var(--font-cond)',
          textTransform: 'uppercase',
        }}>
          #{rank} EV
        </span>
      )}

      {/* Header: sport / league / timer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--muted)' }}>
          {tip.sport}
        </span>
        <span style={{ color: 'var(--dim)', fontSize: 11 }}>·</span>
        <span style={{ fontSize: 11, color: 'var(--muted)', fontStyle: 'italic', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {tip.league}
        </span>
        <span style={{
          fontSize: 10, fontWeight: 700,
          color: isUrgent ? 'var(--amber)' : 'var(--dim)',
          display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0,
        }}>
          {isUrgent && <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--amber)', animation: 'pulse 1.2s ease-in-out infinite' }} />}
          ⏱ {timeLeft}
        </span>
      </div>

      {/* Match */}
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>
        {tip.matchLabel.replace(/^[^\s]+\s/, '')}
      </div>

      {/* EV + Odd + Confidence row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <div style={{ background: 'var(--s2)', borderRadius: 8, padding: '8px 10px', textAlign: 'center', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'var(--font-cond)', color: ev >= 0.10 ? 'var(--lime)' : ev >= 0.05 ? 'var(--green)' : 'var(--text)', lineHeight: 1 }}>
            {ev >= 0 ? '+' : ''}{(ev * 100).toFixed(1)}%
          </div>
          <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 3, letterSpacing: '0.06em', textTransform: 'uppercase' }}>EV</div>
        </div>
        <div style={{ background: 'var(--s2)', borderRadius: 8, padding: '8px 10px', textAlign: 'center', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'var(--font-cond)', color: 'var(--text)', lineHeight: 1 }}>
            {tip.odd.toFixed(2)}
          </div>
          <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 3, letterSpacing: '0.06em', textTransform: 'uppercase' }}>ODD</div>
        </div>
        <div style={{ background: 'var(--s2)', borderRadius: 8, padding: '8px 10px', textAlign: 'center', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <ConfidenceRing value={tip.confidence} size={34} />
          <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 2, letterSpacing: '0.06em', textTransform: 'uppercase' }}>CONF.</div>
        </div>
      </div>

      {/* Selection + market */}
      <div>
        <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 2 }}>{tip.market}</div>
        <div style={{ fontSize: 14, fontWeight: 800, fontFamily: 'var(--font-cond)', color: 'var(--text)', letterSpacing: '-0.01em' }}>
          {tip.selection}
        </div>
      </div>

      {/* Book + secondary action */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <BookmakerBadge book={tip.book} />
        <Link
          href={`/${locale}/banca/apostas?tipId=${tip.id}`}
          style={{ fontSize: 11, fontWeight: 700, padding: '5px 10px', borderRadius: 6, background: 'var(--s2)', border: '1px solid var(--border)', color: 'var(--text)', textDecoration: 'none' }}
        >
          + Banca
        </Link>
      </div>

      {/* CTA principal */}
      <a
        href={tip.affiliateUrl}
        target="_blank"
        rel="sponsored noopener noreferrer"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 6, padding: '11px 16px', borderRadius: 8,
          background: ev >= 0.10 ? 'var(--lime)' : ev >= 0.05 ? '#00E87A22' : 'var(--s2)',
          border: ev >= 0.10 ? 'none' : `1px solid ${ev >= 0.05 ? 'var(--green)' : 'var(--border)'}`,
          color: ev >= 0.10 ? '#000' : ev >= 0.05 ? 'var(--green)' : 'var(--text)',
          fontSize: 12, fontWeight: 800,
          fontFamily: 'var(--font-cond)', letterSpacing: '0.04em',
          textTransform: 'uppercase', textDecoration: 'none',
          transition: 'opacity .15s',
        }}
      >
        {stake > 0
          ? `Apostar com vantagem · R$${stake} na ${tip.book} →`
          : `Apostar na ${tip.book} →`}
      </a>

      <div style={{ fontSize: 10, color: 'var(--dim)', lineHeight: 1.4 }}>
        Análise estatística. Sem garantia de resultado.
      </div>
    </article>
  );
}
