const badges = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke="var(--lime)" strokeWidth="1.3" />
        <path d="M5 8l2 2 4-4" stroke="var(--lime)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    text: 'Grátis para sempre',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="3" y="6" width="10" height="8" rx="1.5" stroke="var(--green)" strokeWidth="1.3" />
        <path d="M5.5 6V4.5a2.5 2.5 0 015 0V6" stroke="var(--green)" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
    text: 'Sem cartão de crédito',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 2l1.5 4H14l-3.5 2.5 1.3 4L8 10 4.2 12.5l1.3-4L2 6h4.5z" stroke="var(--amber)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    text: '12.000+ apostadores',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 2C5 2 3 5 3 8s1.5 5.5 5 5.5S13 11 13 8 11 2 8 2z" stroke="var(--blue)" strokeWidth="1.3" />
        <path d="M8 5v3.5l2 1.5" stroke="var(--blue)" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
    text: 'Cancele quando quiser',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 2l2.5 3.5H14l-2.5 2 1 3.5L8 9 5.5 11l1-3.5L4 5.5h3.5z" stroke="var(--muted)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 13h12" stroke="var(--muted)" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
    text: 'Protegido pela LGPD',
  },
];

export function TrustBadges() {
  return (
    <div
      style={{
        background: 'var(--bg2)',
        borderBottom: '1px solid var(--border)',
        borderTop: '1px solid var(--border)',
        padding: '10px 24px',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 32,
          whiteSpace: 'nowrap',
        }}
      >
        {badges.map((b, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              flexShrink: 0,
            }}
          >
            {b.icon}
            <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>
              {b.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
