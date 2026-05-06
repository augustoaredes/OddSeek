'use client';

interface Props {
  book: string;
  affiliateUrl: string;
  tipId?: string;
  eventId?: string;
  label: string;
  highlight?: boolean;
  ev?: number;
}

export function AffiliateButton({ book, affiliateUrl, tipId, eventId, label, highlight, ev = 0 }: Props) {
  async function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    try {
      const res = await fetch('/api/afiliado/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ book, targetUrl: affiliateUrl, tipId, eventId, referrer: window.location.href }),
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
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 6, padding: '11px 16px', borderRadius: 8,
        background: highlight ? 'var(--lime)' : ev >= 0.05 ? '#00E87A22' : 'var(--s2)',
        border: highlight ? 'none' : `1px solid ${ev >= 0.05 ? 'var(--green)' : 'var(--border)'}`,
        color: highlight ? '#000' : ev >= 0.05 ? 'var(--green)' : 'var(--text)',
        fontSize: 12, fontWeight: 800,
        fontFamily: 'var(--font-cond)', letterSpacing: '0.04em',
        textTransform: 'uppercase', textDecoration: 'none',
        transition: 'opacity .15s',
        cursor: 'pointer',
      }}
    >
      {label}
    </a>
  );
}
