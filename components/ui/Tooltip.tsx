'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [open, setOpen]     = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const show = useCallback(() => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const TOOLTIP_W = 240;
    // centre above the ? icon, clamped so it never leaves the viewport
    let left = r.left + r.width / 2;
    left = Math.max(TOOLTIP_W / 2 + 8, Math.min(left, window.innerWidth - TOOLTIP_W / 2 - 8));
    setCoords({ top: r.top + window.scrollY - 10, left });
    setOpen(true);
  }, []);

  const hide = useCallback(() => setOpen(false), []);

  const tooltip = open && mounted && (
    <span
      style={{
        position:  'absolute',
        top:       coords.top,
        left:      coords.left,
        transform: 'translate(-50%, -100%)',
        zIndex:    99999,
        background: 'var(--s3, #1C1D21)',
        border:    '1px solid var(--bd2, #282B31)',
        borderRadius: 8,
        padding:   '9px 13px',
        fontSize:  12,
        color:     'var(--text, #EDEAE3)',
        lineHeight: 1.55,
        width:     240,
        textAlign: 'left',
        boxShadow: '0 8px 32px #000c',
        pointerEvents: 'none',
        whiteSpace: 'normal',
      }}
    >
      {content}
      {/* arrow */}
      <span style={{
        position:   'absolute',
        bottom:     -5,
        left:       '50%',
        transform:  'translateX(-50%) rotate(45deg)',
        width:      8,
        height:     8,
        background: 'var(--s3, #1C1D21)',
        borderRight: '1px solid var(--bd2, #282B31)',
        borderBottom: '1px solid var(--bd2, #282B31)',
      }} />
    </span>
  );

  return (
    <span
      ref={ref}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 3 }}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      <span
        aria-label={content}
        style={{
          width: 15, height: 15, borderRadius: '50%',
          background: 'var(--bd2)', color: 'var(--text)',
          fontSize: 9, fontWeight: 800,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, cursor: 'help', userSelect: 'none',
        }}
      >
        ?
      </span>
      {mounted && tooltip && createPortal(tooltip, document.body)}
    </span>
  );
}
