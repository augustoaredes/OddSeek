import type { Metadata } from 'next';
import Link from 'next/link';
import { getLocale } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'Programa de Afiliados — OddSeek',
  description: 'Ganhe comissão indicando a OddSeek para outros apostadores.',
};

const STEPS = [
  { n: '01', title: 'Crie sua conta',   desc: 'Registre-se gratuitamente e acesse seu painel de afiliado.' },
  { n: '02', title: 'Compartilhe',      desc: 'Use seu link exclusivo em redes sociais, grupos ou conteúdo.' },
  { n: '03', title: 'Acompanhe',        desc: 'Veja cliques, registros e comissões em tempo real no painel.' },
  { n: '04', title: 'Receba',           desc: 'Comissões pagas mensalmente via PIX ou transferência.' },
];

const PLANOS = [
  {
    tier: 'Starter',
    comissao: '20%',
    desc: 'Para criadores iniciantes',
    reqs: '0–50 indicações/mês',
    perks: ['Link de afiliado exclusivo', 'Dashboard de conversões', 'Suporte por email'],
    color: 'var(--muted)',
  },
  {
    tier: 'Pro',
    comissao: '30%',
    desc: 'Para criadores de conteúdo',
    reqs: '51–200 indicações/mês',
    perks: ['Tudo do Starter', 'Materiais exclusivos', 'Gerente dedicado', 'Acesso Pro gratuito'],
    color: 'var(--lime)',
    highlight: true,
  },
  {
    tier: 'Elite',
    comissao: '40%',
    desc: 'Para influenciadores',
    reqs: '200+ indicações/mês',
    perks: ['Tudo do Pro', 'Comissão recorrente', 'Co-marketing', 'Relatórios avançados'],
    color: 'var(--amber)',
  },
];

export default async function AfiadosPage() {
  const locale = await getLocale();

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '80px 32px 120px' }}>

      {/* Hero */}
      <div style={{ marginBottom: 72 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--lime)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 20, height: 2, background: 'var(--lime)', display: 'inline-block', borderRadius: 2 }} />
          Programa de Afiliados
        </div>
        <h1 style={{ fontFamily: 'var(--font-cond)', fontSize: 'clamp(44px, 6.5vw, 76px)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-.02em', lineHeight: .95, color: 'var(--text)', margin: '0 0 20px' }}>
          Ganhe com cada<br />
          <span style={{ color: 'var(--lime)' }}>indicação.</span>
        </h1>
        <p style={{ fontSize: 16, color: 'var(--muted)', lineHeight: 1.7, maxWidth: 540, marginBottom: 32 }}>
          Monetize sua audiência indicando a OddSeek. Comissões recorrentes, painel de acompanhamento em tempo real e suporte dedicado.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href={`/${locale}/registro`} style={{ fontFamily: 'var(--font-cond)', fontWeight: 800, fontSize: 13, letterSpacing: '.06em', textTransform: 'uppercase', background: 'var(--lime)', color: '#000', padding: '13px 28px', borderRadius: 8, textDecoration: 'none' }}>
            Quero ser afiliado →
          </Link>
          <Link href={`/${locale}/contato`} style={{ fontFamily: 'var(--font-cond)', fontWeight: 700, fontSize: 13, letterSpacing: '.06em', textTransform: 'uppercase', background: 'var(--surface)', color: 'var(--text)', padding: '13px 24px', borderRadius: 8, textDecoration: 'none', border: '1px solid var(--border)' }}>
            Falar com gerente
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, background: 'var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 80 }}>
        {[
          { v: 'até 40%', l: 'de comissão recorrente' },
          { v: '30 dias', l: 'de cookie de atribuição' },
          { v: 'Mensal',  l: 'frequência de pagamento' },
        ].map(s => (
          <div key={s.l} style={{ background: 'var(--surface)', padding: '28px 24px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-cond)', fontSize: 36, fontWeight: 900, color: 'var(--lime)', lineHeight: 1 }}>{s.v}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Como funciona */}
      <div style={{ marginBottom: 80 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--lime)', marginBottom: 12 }}>Como funciona</div>
        <h2 style={{ fontFamily: 'var(--font-cond)', fontSize: 32, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-.01em', color: 'var(--text)', margin: '0 0 36px' }}>
          Simples assim
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, background: 'var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          {STEPS.map(s => (
            <div key={s.n} style={{ background: 'var(--surface)', padding: '24px 20px' }}>
              <div style={{ fontFamily: 'var(--font-cond)', fontSize: 32, fontWeight: 900, color: 'var(--lime)', opacity: .3, lineHeight: 1, marginBottom: 12 }}>{s.n}</div>
              <div style={{ fontFamily: 'var(--font-cond)', fontSize: 15, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-.01em', color: 'var(--text)', marginBottom: 8 }}>{s.title}</div>
              <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Planos */}
      <div style={{ marginBottom: 80 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--lime)', marginBottom: 12 }}>Comissões</div>
        <h2 style={{ fontFamily: 'var(--font-cond)', fontSize: 32, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-.01em', color: 'var(--text)', margin: '0 0 32px' }}>
          Escala com você
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {PLANOS.map(p => (
            <div key={p.tier} style={{
              background: p.highlight ? 'oklch(80% 0.3 115 / 0.06)' : 'var(--surface)',
              border: `1px solid ${p.highlight ? 'oklch(80% 0.3 115 / 0.35)' : 'var(--border)'}`,
              borderRadius: 12, padding: '28px 22px',
            }}>
              <div style={{ fontFamily: 'var(--font-cond)', fontSize: 12, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: p.color, marginBottom: 4 }}>{p.tier}</div>
              <div style={{ fontFamily: 'var(--font-cond)', fontSize: 48, fontWeight: 900, color: p.color, lineHeight: 1, marginBottom: 4 }}>{p.comissao}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>{p.desc}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--dim)', letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>{p.reqs}</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {p.perks.map(perk => (
                  <li key={perk} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--muted)' }}>
                    <span style={{ color: p.color, fontSize: 14, lineHeight: 1 }}>✓</span>
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 10, padding: '18px 22px' }}>
        <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>
          <strong style={{ color: 'var(--text)' }}>Sobre links de afiliado:</strong> Links afiliados levam usuários a casas de apostas parceiras. A OddSeek pode receber comissão por referências. Isso não influencia nossas análises de EV — recomendamos baseados em dados, independente de parceria comercial. Apostas envolvem risco de perda.
        </p>
      </div>
    </div>
  );
}
