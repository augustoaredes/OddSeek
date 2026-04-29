import type { ReactNode } from 'react';
import Link from 'next/link';
import { OddSeekMark } from '@/components/brand/OddSeekMark';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="theme-app"
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      <Link
        href="/"
        style={{
          marginBottom: 36,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
          textDecoration: 'none',
        }}
      >
        <OddSeekMark size="xl" />
        <span className="lw" style={{ fontSize: 28 }}>
          <span className="lw-bet">Odd</span>
          <span className="lw-mind">Seek</span>
        </span>
      </Link>

      <div style={{ width: '100%', maxWidth: 420 }}>{children}</div>
    </div>
  );
}
