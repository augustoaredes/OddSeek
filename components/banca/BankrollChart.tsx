'use client';

import { useMemo } from 'react';

interface Point {
  date: string;
  balance: number;
}

interface BankrollChartProps {
  data: Point[];
  height?: number;
}

export function BankrollChart({ data, height = 140 }: BankrollChartProps) {
  const { pathD, fillD, labels, minY, maxY, w, h } = useMemo(() => {
    const w = 560;
    const h = height;
    const pad = { top: 16, bottom: 28, left: 8, right: 8 };
    const chartW = w - pad.left - pad.right;
    const chartH = h - pad.top - pad.bottom;

    const values = data.map(d => d.balance);
    const minY = Math.min(...values) * 0.98;
    const maxY = Math.max(...values) * 1.02;
    const range = maxY - minY || 1;

    const toX = (i: number) => pad.left + (i / (data.length - 1)) * chartW;
    const toY = (v: number) => pad.top + chartH - ((v - minY) / range) * chartH;

    const pts = data.map((d, i) => ({ x: toX(i), y: toY(d.balance) }));

    // Smooth line via catmull-rom
    let pathD = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const p0 = pts[Math.max(i - 2, 0)];
      const p1 = pts[i - 1];
      const p2 = pts[i];
      const p3 = pts[Math.min(i + 1, pts.length - 1)];
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    const last = pts[pts.length - 1];
    const fillD = `${pathD} L ${last.x} ${h - pad.bottom} L ${pts[0].x} ${h - pad.bottom} Z`;

    // Show 4 evenly spaced date labels
    const step = Math.floor((data.length - 1) / 3);
    const labels = [0, step, step * 2, data.length - 1].map(i => ({
      x: toX(i),
      label: data[i].date,
    }));

    return { pathD, fillD, labels, minY, maxY, w, h };
  }, [data, height]);

  const gradId = 'brchart-grad';

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      style={{ width: '100%', height, display: 'block' }}
      preserveAspectRatio="none"
      aria-label="Evolução da banca"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#CCFF00" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#CCFF00" stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* Fill area */}
      <path d={fillD} fill={`url(#${gradId})`} />

      {/* Line */}
      <path d={pathD} fill="none" stroke="#CCFF00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Dot at last point */}
      {data.length > 0 && (
        <>
          <circle
            cx={w - 8}
            cy={8 + (h - 44) * (1 - (data[data.length - 1].balance - minY) / Math.max(maxY - minY, 1))}
            r={4}
            fill="#CCFF00"
          />
          <circle
            cx={w - 8}
            cy={8 + (h - 44) * (1 - (data[data.length - 1].balance - minY) / Math.max(maxY - minY, 1))}
            r={8}
            fill="#CCFF00"
            opacity={0.2}
          />
        </>
      )}

      {/* Date labels */}
      {labels.map(l => (
        <text
          key={l.label + l.x}
          x={l.x}
          y={h - 4}
          textAnchor="middle"
          fontSize={9}
          fill="#686560"
          fontFamily="'Space Grotesk', system-ui"
        >
          {l.label}
        </text>
      ))}
    </svg>
  );
}
