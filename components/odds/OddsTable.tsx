import { BookmakerBadge } from './BookmakerBadge';
import { OddCell } from './OddCell';
import type { OddsMarket } from '@/lib/odds/types';

interface OddsTableProps {
  markets: OddsMarket[];
  /** Show only this market (if provided) */
  activeMarket?: string;
}

export function OddsTable({ markets, activeMarket }: OddsTableProps) {
  const visibleMarkets = activeMarket
    ? markets.filter(m => m.market === activeMarket)
    : markets;

  if (visibleMarkets.length === 0) {
    return (
      <div
        style={{
          padding: '32px 24px',
          textAlign: 'center',
          color: 'var(--muted)',
          fontSize: 13,
        }}
      >
        Nenhuma odd disponível para este mercado.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {visibleMarkets.map(market => {
        const bookCount = market.selections[0]?.books.length ?? 0;
        const minTableWidth = 150 + bookCount * 74;
        return (
          <div key={market.market}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                marginBottom: 12,
              }}
            >
              {market.label}
            </div>

            {/* Scrollable wrapper */}
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <div style={{ minWidth: minTableWidth }}>
                {/* Book header row */}
                {market.selections.length > 0 && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `150px repeat(${bookCount}, minmax(68px, 1fr))`,
                      gap: 6,
                      marginBottom: 6,
                    }}
                  >
                    <div />
                    {market.selections[0].books.map(b => (
                      <div
                        key={b.book}
                        style={{ display: 'flex', justifyContent: 'center' }}
                      >
                        <BookmakerBadge book={b.book} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Selection rows */}
                {market.selections.map(sel => (
                  <div
                    key={sel.label}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `150px repeat(${sel.books.length}, minmax(68px, 1fr))`,
                      gap: 6,
                      marginBottom: 6,
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.2 }}>
                        {sel.label}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>
                        prob. {(sel.consensusProb * 100).toFixed(1)}%
                      </div>
                    </div>

                    {sel.books.map(b => (
                      <OddCell
                        key={b.book}
                        odd={b.odd}
                        ev={b.ev}
                        isBest={b.isBest}
                        affiliateUrl={b.affiliateUrl}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
