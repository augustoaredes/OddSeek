interface ConfidenceRingProps {
  value: number; // 0-100
  size?: number;
}

/**
 * SVG circular confidence ring — port of the .cring element from dashboard.html.
 * Lime stroke for high confidence, amber for medium, muted for low.
 */
export function ConfidenceRing({ value, size = 44 }: ConfidenceRingProps) {
  const r = (size - 6) / 2;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - value / 100);

  const color =
    value >= 70 ? 'var(--lime)' :
    value >= 50 ? 'var(--amber)' :
    'var(--muted)';

  const cx = size / 2;
  const cy = size / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ flexShrink: 0, display: 'block' }}
      aria-label={`Confiança: ${value}%`}
    >
      {/* Track */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="var(--dim)"
        strokeWidth={3}
      />
      {/* Progress */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dashoffset 0.4s ease' }}
      />
      {/* Label */}
      <text
        x={cx}
        y={cy + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={size < 40 ? 9 : 11}
        fontWeight={700}
        fill={color}
        fontFamily="var(--font-cond), Barlow Condensed, sans-serif"
      >
        {value}%
      </text>
    </svg>
  );
}
