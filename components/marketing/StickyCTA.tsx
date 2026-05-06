'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Props { locale: string }

export function StickyCTA({ locale }: Props) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [email, setEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (dismissed) return;
    function onScroll() {
      setVisible(window.scrollY > 500);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [dismissed]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (email) params.set('email', email);
    router.push(`/${locale}/registro?${params}`);
  }

  return (
    <>
      {visible && !dismissed && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 200,
            background: 'var(--bg2)',
            borderTop: '1px solid var(--bd2)',
            boxShadow: '0 -8px 40px #000a',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
            animation: 'fadeUp 0.3s ease-out',
          }}
        >
          {/* Left: copy */}
          <div style={{ flex: '1 1 180px', minWidth: 0 }}>
            <div style={{
              fontFamily: 'var(--font-cond)',
              fontSize: 15,
              fontWeight: 900,
              color: 'var(--text)',
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
              textTransform: 'uppercase',
            }}>
              Encontre apostas com EV+
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
              Grátis para sempre · sem cartão
            </div>
          </div>

          {/* Center: email form */}
          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', gap: 6, flex: '1 1 280px', maxWidth: 420 }}
          >
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              style={{
                flex: 1,
                background: 'var(--s2)',
                border: '1px solid var(--border)',
                borderRadius: 7,
                padding: '9px 12px',
                color: 'var(--text)',
                fontSize: 13,
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                background: 'var(--lime)',
                border: 'none',
                borderRadius: 7,
                padding: '9px 18px',
                color: '#000',
                fontSize: 13,
                fontWeight: 800,
                fontFamily: 'var(--font-cond)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Criar conta →
            </button>
          </form>

          {/* Close */}
          <button
            onClick={() => setDismissed(true)}
            type="button"
            aria-label="Fechar"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--dim)',
              cursor: 'pointer',
              padding: '4px 6px',
              fontSize: 18,
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
