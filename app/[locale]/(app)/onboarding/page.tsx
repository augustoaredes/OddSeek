'use client';

import { useState, useTransition } from 'react';
import { useRouter, useParams } from 'next/navigation';

const PROFILES = [
  {
    id: 'conservador',
    label: 'Conservador',
    icon: '🛡️',
    desc: 'Stake máx 1% da banca por aposta. Indicado para quem está começando.',
    color: 'var(--blue)',
  },
  {
    id: 'moderado',
    label: 'Moderado',
    icon: '⚖️',
    desc: 'Stake máx 3% da banca. Equilíbrio entre crescimento e proteção.',
    color: 'var(--lime)',
  },
  {
    id: 'agressivo',
    label: 'Agressivo',
    icon: '🚀',
    desc: 'Stake máx 5% da banca. Para quem tem experiência e aceita maior risco.',
    color: 'var(--amber)',
  },
] as const;

const PRESETS = [500, 1000, 2000, 5000, 10000];

export default function OnboardingPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) ?? 'pt-BR';

  const [step,        setStep]        = useState(1);
  const [bankroll,    setBankroll]    = useState('2000');
  const [profile,     setProfile]     = useState<'conservador' | 'moderado' | 'agressivo'>('moderado');
  const [isPending,   startTransition] = useTransition();
  const [error,       setError]       = useState('');

  const amount = parseFloat(bankroll.replace(/\./g, '').replace(',', '.')) || 0;

  function handleFinish() {
    if (amount < 10) { setError('Valor mínimo: R$10'); return; }
    setError('');

    startTransition(async () => {
      try {
        await fetch('/api/banca/bankroll', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initialAmount: amount, riskProfile: profile }),
        });
      } catch { /* não bloqueia — bankroll padrão já foi criado */ }
      router.push(`/${locale}/dashboard`);
    });
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--s2)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text)',
    fontSize: 24,
    fontFamily: 'var(--font-cond)',
    fontWeight: 800,
    padding: '14px 18px',
    outline: 'none',
    boxSizing: 'border-box',
    textAlign: 'center',
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      gap: 32,
    }}>
      {/* Progress */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {[1, 2].map(s => (
          <div key={s} style={{
            width: s === step ? 32 : 8,
            height: 8,
            borderRadius: 4,
            background: s <= step ? 'var(--lime)' : 'var(--border)',
            transition: 'all 0.3s',
          }} />
        ))}
      </div>

      <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 24 }}>

        {step === 1 && (
          <>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💰</div>
              <h1 style={{
                fontFamily: 'var(--font-cond)', fontSize: 28, fontWeight: 900,
                textTransform: 'uppercase', letterSpacing: '-0.01em',
                color: 'var(--text)', margin: '0 0 8px',
              }}>
                Qual é a sua banca inicial?
              </h1>
              <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
                Defina o valor que você vai destinar às apostas. Pode alterar depois.
              </p>
            </div>

            {/* Presets */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              {PRESETS.map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setBankroll(String(v))}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: `1px solid ${amount === v ? 'var(--lime)' : 'var(--border)'}`,
                    background: amount === v ? 'oklch(80% 0.3 115 / 0.1)' : 'var(--surface)',
                    color: amount === v ? 'var(--lime)' : 'var(--muted)',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-cond)',
                  }}
                >
                  R${v.toLocaleString('pt-BR')}
                </button>
              ))}
            </div>

            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.07em', textTransform: 'uppercase', display: 'block', marginBottom: 8, textAlign: 'center' }}>
                Ou digite o valor
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', fontSize: 18, fontWeight: 800, color: 'var(--muted)', fontFamily: 'var(--font-cond)' }}>R$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={bankroll}
                  onChange={e => setBankroll(e.target.value.replace(/[^0-9.,]/g, ''))}
                  style={{ ...inputStyle, paddingLeft: 52 }}
                />
              </div>
              {error && <p style={{ color: 'var(--red)', fontSize: 12, marginTop: 6, textAlign: 'center' }}>{error}</p>}
            </div>

            <button
              type="button"
              onClick={() => { if (amount < 10) { setError('Valor mínimo: R$10'); return; } setError(''); setStep(2); }}
              className="btn btn-lime"
              style={{ width: '100%', padding: '14px 0', fontSize: 15 }}
            >
              Continuar →
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
              <h1 style={{
                fontFamily: 'var(--font-cond)', fontSize: 28, fontWeight: 900,
                textTransform: 'uppercase', letterSpacing: '-0.01em',
                color: 'var(--text)', margin: '0 0 8px',
              }}>
                Perfil de risco
              </h1>
              <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
                Isso define o tamanho máximo das suas apostas (Kelly fraction).
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {PROFILES.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProfile(p.id)}
                  style={{
                    padding: '16px 20px',
                    borderRadius: 12,
                    border: `1px solid ${profile === p.id ? p.color : 'var(--border)'}`,
                    background: profile === p.id ? `${p.color}11` : 'var(--surface)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                  }}
                >
                  <span style={{ fontSize: 28, flexShrink: 0 }}>{p.icon}</span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: profile === p.id ? p.color : 'var(--text)', fontFamily: 'var(--font-cond)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {p.label}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{p.desc}</div>
                  </div>
                  {profile === p.id && (
                    <div style={{ marginLeft: 'auto', width: 20, height: 20, borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2 2 4-4" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Summary */}
            <div style={{ background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 18px', display: 'flex', justifyContent: 'space-around', gap: 16 }}>
              {[
                { label: 'Banca inicial', value: `R$${amount.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}` },
                { label: 'Perfil', value: PROFILES.find(p => p.id === profile)?.label ?? '' },
                { label: 'Stake máx/aposta', value: `R$${Math.round(amount * (profile === 'conservador' ? 0.01 : profile === 'moderado' ? 0.03 : 0.05)).toLocaleString('pt-BR')}` },
              ].map(item => (
                <div key={item.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-cond)', fontSize: 18, fontWeight: 800, color: 'var(--lime)' }}>{item.value}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>{item.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ flex: 1, padding: '12px 0', borderRadius: 8, background: 'var(--s2)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                ← Voltar
              </button>
              <button
                type="button"
                onClick={handleFinish}
                disabled={isPending}
                className="btn btn-lime"
                style={{ flex: 2, padding: '12px 0', fontSize: 14, opacity: isPending ? 0.7 : 1 }}
              >
                {isPending ? 'Configurando...' : 'Começar a usar →'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
