import type { Metadata } from 'next';
import Link from 'next/link';
import { getLocale } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'Sobre a OddSeek — Inteligência de apostas esportivas',
  description: 'Conheça a missão, equipe e tecnologia por trás da OddSeek.',
};

const VALORES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
      </svg>
    ),
    title: 'Transparência',
    desc: 'Mostramos todos os cálculos. EV, probabilidade implícita, margem da casa — sem caixas pretas.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    ),
    title: 'Dados, não feeling',
    desc: 'Cada tip é baseada em modelos estatísticos e consensus de odds — não em opiniões ou palpites.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: 'Jogo responsável',
    desc: 'Apostas são risco. Fornecemos alertas de banca, limites Kelly e educação para apostadores.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: 'Comunidade',
    desc: 'Apostadores compartilham histórico, aprendem com acertos e erros — e constroem edge juntos.',
  },
];

const STATS = [
  { value: '12.000+', label: 'apostadores ativos' },
  { value: '4 casas',  label: 'monitoradas em tempo real' },
  { value: '60+',      label: 'eventos diários analisados' },
  { value: '2024',     label: 'ano de fundação' },
];

export default async function SobrePage() {
  const locale = await getLocale();

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '80px 32px 120px' }}>

      {/* Hero */}
      <div style={{ marginBottom: 80 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--lime)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 20, height: 2, background: 'var(--lime)', display: 'inline-block', borderRadius: 2 }} />
          Sobre a OddSeek
        </div>
        <h1 style={{ fontFamily: 'var(--font-cond)', fontSize: 'clamp(48px, 7vw, 80px)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-.02em', lineHeight: .95, color: 'var(--text)', margin: '0 0 24px' }}>
          Inteligência para<br />
          <span style={{ color: 'transparent', WebkitTextStroke: '1.5px var(--muted)' }}>apostadores sérios.</span>
        </h1>
        <p style={{ fontSize: 17, color: 'var(--muted)', lineHeight: 1.7, maxWidth: 600 }}>
          A OddSeek é uma plataforma de análise de odds esportivas. Não somos uma casa de apostas — somos a ferramenta que você precisa para tomar decisões baseadas em dados, não em instinto.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, background: 'var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 80 }}>
        {STATS.map(s => (
          <div key={s.label} style={{ background: 'var(--surface)', padding: '28px 20px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-cond)', fontSize: 36, fontWeight: 900, color: 'var(--lime)', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Missão */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginBottom: 80, alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--lime)', marginBottom: 12 }}>Nossa missão</div>
          <h2 style={{ fontFamily: 'var(--font-cond)', fontSize: 32, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-.01em', color: 'var(--text)', margin: '0 0 16px' }}>
            Nivelar o campo de jogo
          </h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.8, margin: '0 0 16px' }}>
            As casas de apostas têm modelos quantitativos sofisticados. Os apostadores individuais apostam no feeling. A OddSeek muda esse equilíbrio.
          </p>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.8 }}>
            Agregamos odds de múltiplas casas, calculamos o EV de cada mercado em tempo real e entregamos as melhores oportunidades diretamente para você — com gestão de banca integrada.
          </p>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '32px 28px' }}>
          <div style={{ fontFamily: 'var(--font-cond)', fontSize: 13, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--lime)', marginBottom: 20 }}>Como funciona o EV</div>
          {[
            { step: '01', text: 'Coletamos odds de múltiplas casas para cada mercado' },
            { step: '02', text: 'Removemos a margem (vig) usando o Power Method' },
            { step: '03', text: 'Calculamos a probabilidade implícita de consensus' },
            { step: '04', text: 'Identificamos mercados onde a odd supera essa probabilidade' },
          ].map(item => (
            <div key={item.step} style={{ display: 'flex', gap: 14, marginBottom: 16, alignItems: 'flex-start' }}>
              <span style={{ fontFamily: 'var(--font-cond)', fontSize: 18, fontWeight: 900, color: 'var(--lime)', opacity: .4, lineHeight: 1, flexShrink: 0 }}>{item.step}</span>
              <span style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Valores */}
      <div style={{ marginBottom: 80 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--lime)', marginBottom: 12 }}>Valores</div>
        <h2 style={{ fontFamily: 'var(--font-cond)', fontSize: 32, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-.01em', color: 'var(--text)', margin: '0 0 32px' }}>
          O que nos guia
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, background: 'var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          {VALORES.map(v => (
            <div key={v.title} style={{ background: 'var(--surface)', padding: '28px 24px' }}>
              <div style={{ color: 'var(--lime)', marginBottom: 12 }}>{v.icon}</div>
              <div style={{ fontFamily: 'var(--font-cond)', fontSize: 18, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-.01em', color: 'var(--text)', marginBottom: 8 }}>{v.title}</div>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 10, padding: '20px 24px', marginBottom: 48 }}>
        <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>
          <strong style={{ color: 'var(--text)' }}>A OddSeek não é uma casa de apostas.</strong> Não operamos como operadora de jogos e não recebemos dinheiro de apostas. Todas as apostas são realizadas diretamente nas plataformas parceiras. Apostas envolvem risco de perda — jogue com responsabilidade. Proibido para menores de 18 anos.
        </p>
      </div>

      {/* CTA */}
      <div style={{ display: 'flex', gap: 12 }}>
        <Link href={`/${locale}/registro`} style={{ fontFamily: 'var(--font-cond)', fontWeight: 800, fontSize: 13, letterSpacing: '.06em', textTransform: 'uppercase', background: 'var(--lime)', color: '#000', padding: '12px 24px', borderRadius: 8, textDecoration: 'none' }}>
          Criar conta grátis
        </Link>
        <Link href={`/${locale}/contato`} style={{ fontFamily: 'var(--font-cond)', fontWeight: 700, fontSize: 13, letterSpacing: '.06em', textTransform: 'uppercase', background: 'var(--surface)', color: 'var(--text)', padding: '12px 24px', borderRadius: 8, textDecoration: 'none', border: '1px solid var(--border)' }}>
          Falar conosco
        </Link>
      </div>
    </div>
  );
}
