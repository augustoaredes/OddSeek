'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { signIn } from 'next-auth/react';

interface Props {
  locale: string;
  defaultEmail?: string;
  defaultPlan?: string;
}

const PLANS = [
  {
    id: 'free',
    label: 'Grátis',
    price: 'R$0',
    cta: 'Criar conta grátis',
    features: ['5 apostas por dia', 'Score de confiança', 'Futebol brasileiro'],
  },
  {
    id: 'pro',
    label: 'Pro',
    price: 'R$49/mês',
    cta: 'Começar com Pro',
    features: ['Apostas ilimitadas', 'Vantagem em tempo real', 'Todos os esportes', 'Controle de banca', 'Múltiplas inteligentes'],
  },
  {
    id: 'elite',
    label: 'Elite',
    price: 'R$129/mês',
    cta: 'Começar com Elite',
    features: ['Tudo do Pro', 'Comunidade + ranking', 'API + integrações', 'Suporte dedicado'],
  },
];

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: 'var(--border)' };
  let s = 0;
  if (pw.length >= 8)  s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 1) return { score: s, label: 'Fraca', color: 'var(--red)' };
  if (s <= 3) return { score: s, label: 'Média', color: 'var(--amber)' };
  return { score: s, label: 'Forte', color: 'var(--green)' };
}

export function RegisterForm({ locale, defaultEmail = '', defaultPlan = 'pro' }: Props) {
  const t  = useTranslations('auth');
  const tc = useTranslations('compliance');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError]     = useState('');
  const [plan, setPlan]       = useState(defaultPlan);
  const [password, setPassword] = useState('');
  const strength = passwordStrength(password);
  const selectedPlan = PLANS.find(p => p.id === plan) ?? PLANS[1];

  const inputStyle: React.CSSProperties = {
    background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 7,
    padding: '10px 14px', color: 'var(--text)', fontSize: 14, outline: 'none',
    transition: 'border-color 0.15s', width: '100%', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 11, color: 'var(--muted)', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600,
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const form = new FormData(e.currentTarget);

    if (!form.get('age_confirm')) {
      setError('Você deve confirmar que tem 18 anos ou mais.');
      return;
    }
    if (!form.get('lgpd_confirm')) {
      setError('Você deve aceitar os Termos e Política de Privacidade.');
      return;
    }
    if (form.get('password') !== form.get('confirm_password')) {
      setError('As senhas não coincidem.');
      return;
    }

    startTransition(async () => {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          email: form.get('email'),
          password: form.get('password'),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message ?? 'Erro ao criar conta. Tente novamente.');
        return;
      }

      await signIn('credentials', {
        email: form.get('email'),
        password: form.get('password'),
        redirect: false,
      });

      router.push(`/${locale}/dashboard`);
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Seletor de plano ───────────────────────── */}
      <div>
        <div style={labelStyle as React.CSSProperties}>Escolha seu plano</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          {PLANS.map(p => {
            const active = plan === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlan(p.id)}
                style={{
                  flex: 1, padding: '8px 4px', borderRadius: 8, cursor: 'pointer', textAlign: 'center',
                  fontFamily: 'var(--font-cond)', fontWeight: 800, fontSize: 13,
                  letterSpacing: '0.04em', textTransform: 'uppercase',
                  border: active
                    ? (p.id === 'pro' ? '1.5px solid var(--lime)' : '1.5px solid var(--bd2)')
                    : '1px solid var(--border)',
                  background: active
                    ? (p.id === 'pro' ? 'oklch(80% 0.3 115 / 0.08)' : 'var(--s2)')
                    : 'var(--s)',
                  color: active
                    ? (p.id === 'pro' ? 'var(--lime)' : 'var(--text)')
                    : 'var(--muted)',
                  transition: 'all .15s',
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Features do plano selecionado */}
        <div style={{
          marginTop: 8, padding: '10px 12px', borderRadius: 7,
          background: 'var(--s2)', border: '1px solid var(--border)',
          display: 'flex', flexWrap: 'wrap', gap: '4px 12px',
        }}>
          {selectedPlan.features.map(f => (
            <span key={f} style={{ fontSize: 11, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: 'var(--green)', fontSize: 10 }}>✓</span>
              {f}
            </span>
          ))}
          {plan !== 'free' && (
            <span style={{ fontSize: 10, color: 'var(--muted)', width: '100%', marginTop: 2 }}>
              14 dias grátis · sem cartão agora
            </span>
          )}
        </div>
      </div>

      {/* ── Campos ────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label style={labelStyle as React.CSSProperties}>{t('name')}</label>
          <input
            name="name" type="text" required autoComplete="name"
            placeholder="Seu nome completo"
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label style={labelStyle as React.CSSProperties}>{t('email')}</label>
          <input
            name="email" type="email" required autoComplete="email"
            placeholder="seu@email.com"
            defaultValue={defaultEmail}
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label style={labelStyle as React.CSSProperties}>{t('password')}</label>
          <input
            name="password" type="password" required minLength={8}
            autoComplete="new-password" placeholder="Mínimo 8 caracteres"
            style={inputStyle}
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          {/* Barra de força */}
          {password && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <div style={{ flex: 1, display: 'flex', gap: 3 }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} style={{
                    flex: 1, height: 3, borderRadius: 2,
                    background: i <= strength.score ? strength.color : 'var(--border)',
                    transition: 'background .2s',
                  }} />
                ))}
              </div>
              <span style={{ fontSize: 10, color: strength.color, fontWeight: 600, whiteSpace: 'nowrap' }}>
                {strength.label}
              </span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label style={labelStyle as React.CSSProperties}>{t('confirm_password')}</label>
          <input
            name="confirm_password" type="password" required
            autoComplete="new-password" placeholder="Repita a senha"
            style={inputStyle}
          />
        </div>
      </div>

      {/* ── Checkboxes ────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
          <input
            name="age_confirm" type="checkbox"
            style={{ marginTop: 2, accentColor: 'var(--lime)', flexShrink: 0 }}
          />
          <span style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
            {tc('age_confirm')}
          </span>
        </label>

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
          <input
            name="lgpd_confirm" type="checkbox"
            style={{ marginTop: 2, accentColor: 'var(--lime)', flexShrink: 0 }}
          />
          <span style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
            {t('lgpd_confirm')}
          </span>
        </label>
      </div>

      {error && (
        <p style={{ fontSize: 12, color: 'var(--red)', textAlign: 'center', margin: 0 }}>{error}</p>
      )}

      {/* ── CTA ──────────────────────────────────── */}
      <button
        type="submit"
        disabled={isPending}
        className="btn-lime"
        style={{
          height: 46, borderRadius: 8, fontFamily: 'var(--font-cond)', fontSize: 15,
          fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase',
          cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.7 : 1,
          width: '100%', border: 'none', marginTop: 2,
        }}
      >
        {isPending ? '…' : selectedPlan.cta}
      </button>

      {/* ── Social proof ─────────────────────────── */}
      <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', margin: 0 }}>
        +12.000 apostadores já usam o OddSeek
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <span style={{ fontSize: 11, color: 'var(--dim)' }}>{t('or')}</span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      {/* ── Google ───────────────────────────────── */}
      <button
        type="button"
        onClick={() => signIn('google', { callbackUrl: `/${locale}/dashboard` })}
        className="btn-ghost"
        style={{
          height: 44, borderRadius: 8, fontFamily: 'var(--font-cond)', fontSize: 13,
          fontWeight: 700, letterSpacing: '0.04em', cursor: 'pointer', width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M15.68 8.18c0-.57-.05-1.12-.14-1.64H8v3.1h4.3a3.67 3.67 0 01-1.59 2.41v2h2.57c1.5-1.38 2.4-3.42 2.4-5.87z" fill="#4285F4"/>
          <path d="M8 16c2.16 0 3.97-.71 5.3-1.93l-2.58-2a4.8 4.8 0 01-7.14-2.52H.76v2.07A8 8 0 008 16z" fill="#34A853"/>
          <path d="M3.58 9.55a4.8 4.8 0 010-3.1V4.38H.76a8 8 0 000 7.24l2.82-2.07z" fill="#FBBC05"/>
          <path d="M8 3.18a4.32 4.32 0 013.06 1.2l2.3-2.3A7.68 7.68 0 008 0 8 8 0 00.76 4.38l2.82 2.07A4.77 4.77 0 018 3.18z" fill="#EA4335"/>
        </svg>
        {t('google')}
      </button>

    </form>
  );
}
