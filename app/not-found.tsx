import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: '#08080a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 96, fontWeight: 900, color: '#CCFF00', lineHeight: 1, marginBottom: 8 }}>404</div>
        <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 24, fontWeight: 800, color: '#eee9e2', marginBottom: 8, letterSpacing: '-0.01em', textTransform: 'uppercase' }}>
          Página não encontrada
        </h1>
        <p style={{ color: '#686560', fontSize: 14, marginBottom: 28 }}>
          O endereço que você acessou não existe.
        </p>
        <Link
          href="/"
          style={{ padding: '10px 28px', borderRadius: 8, background: '#CCFF00', color: '#000', fontWeight: 700, fontSize: 14, textDecoration: 'none', display: 'inline-block' }}
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
