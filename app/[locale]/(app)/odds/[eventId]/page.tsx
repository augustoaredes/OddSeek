import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { getEventById } from '@/lib/odds/fetcher';
import { OddsTable } from '@/components/odds/OddsTable';
import { EVBadge } from '@/components/odds/EVBadge';
import type { Market } from '@/lib/odds/types';
import { formatDateTimeBRT } from '@/lib/utils/date';

const MARKET_LABELS: Record<Market, string> = {
  match_winner:  'Resultado Final',
  over_under:    'Total de Gols/Pontos',
  handicap:      'Handicap Asiático',
  btts:          'Ambas Marcam',
  double_chance: 'Dupla Hipótese',
};

interface Params {
  params: Promise<{ locale: string; eventId: string }>;
}

export default async function EventDetailPage({ params }: Params) {
  const { eventId } = await params;
  const locale = await getLocale();
  const event = await getEventById(eventId);

  if (!event) notFound();

  // Best EV across all markets
  let bestEV = -Infinity;
  for (const m of event.markets) {
    for (const s of m.selections) {
      for (const b of s.books) {
        if (b.ev > bestEV) bestEV = b.ev;
      }
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <Link
          href={`/${locale}/odds`}
          style={{
            fontSize: 12,
            color: 'var(--muted)',
            textDecoration: 'none',
            letterSpacing: '0.04em',
          }}
        >
          ← Comparador
        </Link>
        <span style={{ color: 'var(--dim)' }}>/</span>
        <span style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>
          {event.league}
        </span>
      </div>

      {/* Event header */}
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: '24px 28px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 24,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            {event.status === 'live' ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  borderRadius: 20,
                  background: 'oklch(50% 0.2 25 / 0.2)',
                  border: '1px solid oklch(50% 0.2 25 / 0.4)',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: 'var(--red)',
                }}
              >
                <span className="live-dot" />
                AO VIVO · {event.elapsed}&apos;
              </span>
            ) : (
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: 20,
                  background: 'var(--s2)',
                  border: '1px solid var(--border)',
                  fontSize: 11,
                  color: 'var(--muted)',
                }}
              >
                {formatDateTimeBRT(event.startsAt)}
              </span>
            )}
            <span style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>
              {event.league}
            </span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-cond), Barlow Condensed, sans-serif',
              fontSize: 32,
              fontWeight: 900,
              letterSpacing: '-0.01em',
              textTransform: 'uppercase',
              color: 'var(--text)',
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            {event.home}{' '}
            <span style={{ color: 'var(--dim)', fontWeight: 400 }}>vs</span>{' '}
            {event.away}
          </h1>
        </div>

        {/* Best EV summary */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 6,
          }}
        >
          <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.05em' }}>
            MELHOR EV DISPONÍVEL
          </div>
          <EVBadge ev={bestEV} showNegative />
        </div>
      </div>

      {/* Market tabs + odds table */}
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          overflow: 'hidden',
        }}
      >
        {/* Market labels */}
        <div
          style={{
            display: 'flex',
            gap: 0,
            borderBottom: '1px solid var(--border)',
            overflowX: 'auto',
          }}
        >
          {event.markets.map((m, i) => (
            <div
              key={m.market}
              style={{
                padding: '12px 20px',
                fontSize: 12,
                fontWeight: 600,
                color: i === 0 ? 'var(--lime)' : 'var(--muted)',
                borderBottom: i === 0 ? '2px solid var(--lime)' : '2px solid transparent',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              {MARKET_LABELS[m.market] ?? m.label}
            </div>
          ))}
        </div>

        {/* Show all markets */}
        <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 28 }}>
          {event.markets.map(m => (
            <div key={m.market}>
              <OddsTable markets={[m]} eventId={event.id} />
            </div>
          ))}
        </div>
      </div>

      {/* Tips CTA */}
      <div
        style={{
          marginTop: 20,
          padding: '16px 20px',
          background: 'oklch(80% 0.3 115 / 0.07)',
          border: '1px solid oklch(80% 0.3 115 / 0.2)',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
            Ver tips para este evento
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            Análise EV+ com recomendação de stake (Kelly)
          </div>
        </div>
        <Link
          href={`/${locale}/tips`}
          className="btn btn-lime"
          style={{ fontSize: 12 }}
        >
          Ver Tips
        </Link>
      </div>
    </div>
  );
}
