const BOOK_COLORS: Record<string, { bg: string; text: string }> = {
  Bet365:      { bg: '#00570e', text: '#fff' },
  Betano:      { bg: '#0a2463', text: '#fff' },
  Sportingbet: { bg: '#1a1a2e', text: '#e9b84a' },
  Stake:       { bg: '#213743', text: '#57b3f1' },
  Pinnacle:    { bg: '#2d2d2d', text: '#f5a623' },
};

const DEFAULT_STYLE = { bg: '#232529', text: 'var(--text)' };

interface BookmakerBadgeProps {
  book: string;
  size?: 'sm' | 'md';
}

export function BookmakerBadge({ book, size = 'sm' }: BookmakerBadgeProps) {
  const style = BOOK_COLORS[book] ?? DEFAULT_STYLE;
  const fontSize = size === 'sm' ? 10 : 12;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: size === 'sm' ? '2px 6px' : '3px 9px',
        borderRadius: 4,
        fontSize,
        fontWeight: 700,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        background: style.bg,
        color: style.text,
        whiteSpace: 'nowrap',
      }}
    >
      {book}
    </span>
  );
}
