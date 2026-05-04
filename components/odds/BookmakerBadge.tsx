const BOOK_COLORS: Record<string, { bg: string; text: string; border?: string }> = {
  'Bet365':      { bg: '#00843D', text: '#fff' },
  'Betano':      { bg: '#E30613', text: '#fff' },
  'Sportingbet': { bg: '#1155CC', text: '#fff' },
  'Pixbet':      { bg: '#0057FF', text: '#fff' },
  'Superbet':    { bg: '#7B1FA2', text: '#fff' },
};

const DEFAULT_STYLE = { bg: '#3A3D45', text: '#fff' };

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
