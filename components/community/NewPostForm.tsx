'use client';

import { useState, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function NewPostForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const [text, setText] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  if (!session?.user) return null;

  const MAX = 500;
  const remaining = MAX - text.length;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (trimmed.length < 1) return;
    setError('');

    startTransition(async () => {
      const res = await fetch('/api/comunidade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: trimmed }),
      });
      if (res.ok) {
        setText('');
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Erro ao publicar');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 4 }}>
      <textarea
        value={text}
        onChange={e => setText(e.target.value.slice(0, MAX))}
        placeholder="Compartilhe uma análise, tip ou insight…"
        rows={3}
        style={{
          background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 8,
          padding: '10px 12px', color: 'var(--text)', fontSize: 13, lineHeight: 1.6,
          resize: 'none', outline: 'none', width: '100%', boxSizing: 'border-box',
          fontFamily: 'inherit',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <span style={{ fontSize: 11, color: remaining < 50 ? 'var(--amber)' : 'var(--dim)' }}>
          {remaining} caracteres restantes
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {error && <span style={{ fontSize: 11, color: 'var(--red)' }}>{error}</span>}
          <button
            type="submit"
            disabled={isPending || text.trim().length === 0}
            style={{
              padding: '8px 20px', borderRadius: 8, background: 'var(--lime)', border: 'none',
              color: '#000', fontSize: 12, fontWeight: 800, fontFamily: 'var(--font-cond)',
              letterSpacing: '0.05em', textTransform: 'uppercase', cursor: isPending ? 'not-allowed' : 'pointer',
              opacity: isPending || text.trim().length === 0 ? 0.6 : 1,
            }}
          >
            {isPending ? 'Publicando…' : 'Publicar'}
          </button>
        </div>
      </div>
    </form>
  );
}
