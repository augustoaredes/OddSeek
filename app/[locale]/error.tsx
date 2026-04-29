'use client';

export default function LocaleError({
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
          Algo deu errado
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20 }}>
          {error.digest ? `Ref: ${error.digest}` : 'Tente novamente ou volte à página inicial.'}
        </p>
        <button
          onClick={reset}
          style={{ padding: '9px 22px', borderRadius: 8, background: 'var(--lime)', color: '#000', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
