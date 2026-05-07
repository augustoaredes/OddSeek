'use client';

import { useState, useTransition } from 'react';

const ASSUNTOS = [
  'Dúvida sobre a plataforma',
  'Problema técnico / bug',
  'Programa de afiliados',
  'Imprensa / parcerias',
  'Solicitação LGPD',
  'Outro',
];

export default function ContatoPage() {
  const [nome,    setNome]    = useState('');
  const [email,   setEmail]   = useState('');
  const [assunto, setAssunto] = useState(ASSUNTOS[0]);
  const [msg,     setMsg]     = useState('');
  const [sent,    setSent]    = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await new Promise(r => setTimeout(r, 800));
      setSent(true);
    });
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'var(--s2)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '11px 14px', color: 'var(--text)', fontSize: 13,
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  };

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '80px 32px 120px' }}>

      {/* Header */}
      <div style={{ marginBottom: 56 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--lime)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 20, height: 2, background: 'var(--lime)', display: 'inline-block', borderRadius: 2 }} />
          Contato
        </div>
        <h1 style={{ fontFamily: 'var(--font-cond)', fontSize: 'clamp(44px, 6vw, 68px)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-.02em', lineHeight: .95, color: 'var(--text)', margin: '0 0 16px' }}>
          Fale com a gente.
        </h1>
        <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.6 }}>
          Respondemos em até 24 horas úteis.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 48, alignItems: 'start' }}>

        {/* Form */}
        {sent ? (
          <div style={{ background: 'oklch(80% 0.3 115 / 0.08)', border: '1px solid oklch(80% 0.3 115 / 0.3)', borderRadius: 12, padding: '48px 36px', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>✓</div>
            <div style={{ fontFamily: 'var(--font-cond)', fontSize: 24, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-.01em', color: 'var(--lime)', marginBottom: 10 }}>
              Mensagem enviada!
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>
              Obrigado por entrar em contato, <strong style={{ color: 'var(--text)' }}>{nome}</strong>. Retornaremos para <strong style={{ color: 'var(--text)' }}>{email}</strong> em até 24 horas.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Nome</label>
                <input required value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Email</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Assunto</label>
              <select value={assunto} onChange={e => setAssunto(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                {ASSUNTOS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Mensagem</label>
              <textarea
                required
                value={msg}
                onChange={e => setMsg(e.target.value)}
                rows={6}
                placeholder="Descreva sua dúvida ou solicitação..."
                style={{ ...inputStyle, resize: 'vertical', minHeight: 120 }}
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              style={{
                fontFamily: 'var(--font-cond)', fontWeight: 800, fontSize: 13,
                letterSpacing: '.06em', textTransform: 'uppercase',
                background: isPending ? 'var(--dim)' : 'var(--lime)',
                color: '#000', padding: '13px 28px', borderRadius: 8,
                border: 'none', cursor: isPending ? 'not-allowed' : 'pointer',
                alignSelf: 'flex-start', transition: 'all .15s',
              }}
            >
              {isPending ? 'Enviando...' : 'Enviar mensagem →'}
            </button>
          </form>
        )}

        {/* Info sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[
            {
              icon: '✉',
              label: 'Email geral',
              value: 'contato@oddseek.app',
              href: 'mailto:contato@oddseek.app',
            },
            {
              icon: '⚖',
              label: 'DPO / LGPD',
              value: 'dpo@oddseek.app',
              href: 'mailto:dpo@oddseek.app',
            },
            {
              icon: '🤝',
              label: 'Afiliados / Parcerias',
              value: 'afiliados@oddseek.app',
              href: 'mailto:afiliados@oddseek.app',
            },
            {
              icon: '🕐',
              label: 'Horário de atendimento',
              value: 'Seg–Sex, 9h–18h (BRT)',
              href: null,
            },
          ].map(item => (
            <div key={item.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 2 }}>{item.label}</div>
                  {item.href ? (
                    <a href={item.href} style={{ fontSize: 13, color: 'var(--lime)', textDecoration: 'none', fontWeight: 600 }}>{item.value}</a>
                  ) : (
                    <div style={{ fontSize: 13, color: 'var(--text)' }}>{item.value}</div>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div style={{ background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px' }}>
            <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>
              Para solicitações de exclusão de dados (Art. 18 LGPD), acesse <strong style={{ color: 'var(--text)' }}>Configurações → Excluir conta</strong> ou envie email para dpo@oddseek.app.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
