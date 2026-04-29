'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ margin: 0, background: '#09090a', color: '#eee9e2', fontFamily: 'system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.01em' }}>Algo deu errado</h1>
          <p style={{ color: '#686560', fontSize: 14, marginBottom: 24 }}>
            {error.digest ? `Código: ${error.digest}` : 'Erro inesperado na aplicação.'}
          </p>
          <button
            onClick={reset}
            style={{ padding: '10px 24px', borderRadius: 8, background: '#CCFF00', color: '#000', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
