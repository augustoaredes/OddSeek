'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { signIn } from 'next-auth/react';

interface Props {
  locale: string;
}

export function RegisterForm({ locale }: Props) {
  const t = useTranslations('auth');
  const tc = useTranslations('compliance');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

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

  const inputStyle: React.CSSProperties = {
    background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 7,
    padding: '10px 14px', color: 'var(--text)', fontSize: 14, outline: 'none',
    transition: 'border-color 0.15s',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12, color: 'var(--muted)', letterSpacing: '0.04em', textTransform: 'uppercase',
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={labelStyle}>{t('name')}</label>
        <input name="name" type="text" required autoComplete="name" style={inputStyle} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={labelStyle}>{t('email')}</label>
        <input name="email" type="email" required autoComplete="email" style={inputStyle} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={labelStyle}>{t('password')}</label>
        <input name="password" type="password" required minLength={8} autoComplete="new-password" style={inputStyle} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={labelStyle}>{t('confirm_password')}</label>
        <input name="confirm_password" type="password" required autoComplete="new-password" style={inputStyle} />
      </div>

      {/* Age gate */}
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
        <input
          name="age_confirm"
          type="checkbox"
          style={{ marginTop: 2, accentColor: 'var(--lime)', flexShrink: 0 }}
        />
        <span style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
          {tc('age_confirm')}
        </span>
      </label>

      {/* LGPD consent */}
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
        <input
          name="lgpd_confirm"
          type="checkbox"
          style={{ marginTop: 2, accentColor: 'var(--lime)', flexShrink: 0 }}
        />
        <span style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
          {t('lgpd_confirm')}
        </span>
      </label>

      {error && (
        <p style={{ fontSize: 12, color: 'var(--red)', textAlign: 'center' }}>{error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="btn-lime"
        style={{
          height: 44, borderRadius: 7, fontFamily: 'var(--font-cond)', fontSize: 14,
          fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase',
          cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.7 : 1,
          width: '100%', border: 'none',
        }}
      >
        {isPending ? '…' : t('register_cta')}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <span style={{ fontSize: 11, color: 'var(--dim)' }}>{t('or')}</span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      <button
        type="button"
        onClick={() => signIn('google', { callbackUrl: `/${locale}/dashboard` })}
        className="btn-ghost"
        style={{
          height: 44, borderRadius: 7, fontFamily: 'var(--font-cond)', fontSize: 13,
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
