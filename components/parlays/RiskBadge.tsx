interface RiskBadgeProps {
  riskLevel: 'low' | 'medium' | 'blocked';
}

const CONFIG = {
  low:     { label: 'BAIXO RISCO',   color: 'var(--green)', bg: 'oklch(55% 0.18 155 / 0.15)' },
  medium:  { label: 'RISCO MÉDIO',   color: 'var(--amber)', bg: 'oklch(75% 0.18 75 / 0.15)' },
  blocked: { label: 'BLOQUEADO',     color: 'var(--red)',   bg: 'oklch(55% 0.2 25 / 0.15)' },
};

export function RiskBadge({ riskLevel }: RiskBadgeProps) {
  const { label, color, bg } = CONFIG[riskLevel];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 10px',
        borderRadius: 5,
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
        color,
        background: bg,
        border: `1px solid ${color}44`,
      }}
    >
      {riskLevel === 'low' && '●'}
      {riskLevel === 'medium' && '◆'}
      {riskLevel === 'blocked' && '✕'}
      {label}
    </span>
  );
}
