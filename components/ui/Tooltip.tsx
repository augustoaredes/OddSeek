'use client';
import { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [open, setOpen] = useState(false);
  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 3, cursor: 'help' }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      <span style={{
        width: 13, height: 13, borderRadius: '50%',
        background: 'var(--dim)', color: 'var(--muted)',
        fontSize: 9, fontWeight: 800, display: 'inline-flex',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>?</span>
      {open && (
        <span style={{
          position: 'absolute', bottom: '100%', left: '50%',
          transform: 'translateX(-50%)', marginBottom: 6,
          background: 'var(--s2)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '8px 12px',
          fontSize: 12, color: 'var(--text)', lineHeight: 1.5,
          width: 220, textAlign: 'left', zIndex: 999,
          boxShadow: '0 4px 20px #0008',
          pointerEvents: 'none', whiteSpace: 'normal',
        }}>
          {content}
        </span>
      )}
    </span>
  );
}
