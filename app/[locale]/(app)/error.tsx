'use client';

import Link from 'next/link';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
        <h2 style={{ fontFamily: 'var(--font-cond)', fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 8, letterSpacing: '-0.01em', textTransform: 'uppercase' }}>
          Erro na página
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20 }}>
          {error.digest ? `Ref: ${error.digest}` : 'Ocorreu um erro inesperado.'}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button
            onClick={reset}
            style={{ padding: '9px 22px', borderRadius: 8, background: 'var(--lime)', color: '#000', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}
          >
            Tentar novamente
          </button>
          <Link
            href="/dashboard"
            style={{ padding: '9px 22px', borderRadius: 8, background: 'var(--surface)', color: 'var(--text)', fontWeight: 600, fontSize: 13, border: '1px solid var(--border)', textDecoration: 'none' }}
          >
            Ir ao dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
