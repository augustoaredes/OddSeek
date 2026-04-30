import type React from 'react';
import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import { MOCK_POSTS, MOCK_LEADERBOARD, timeAgo } from '@/lib/community/mock-data';

export default async function ComunidadePage() {
  const locale = await getLocale();
  const posts = MOCK_POSTS;
  const top3 = MOCK_LEADERBOARD.slice(0, 3);

  const statusColor = (s: string) =>
    s === 'won' ? 'var(--green)' : s === 'lost' ? 'var(--red)' : 'var(--amber)';
  const statusLabel = (s: string) =>
    ({ won: 'GANHOU', lost: 'PERDEU', pending: 'EM JOGO' }[s] ?? s.toUpperCase());

  function Avatar({ initials, size = 36 }: { initials: string; size?: number }) {
    return (
      <span style={{ width: size, height: size, borderRadius: '50%', background: 'var(--dim)', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.35, fontWeight: 800, color: 'var(--lime)', flexShrink: 0, fontFamily: 'var(--font-cond)' }}>
        {initials}
      </span>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ marginBottom: 10 }}>
        <h1 style={{ fontFamily: 'var(--font-cond)', fontSize: 28, fontWeight: 800, letterSpacing: '-0.01em', textTransform: 'uppercase', color: 'var(--text)', margin: 0 }}>
          Comunidade
        </h1>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
          Compartilhe análises · discuta EV+ · aprenda com os melhores
        </p>
      </div>

      <div className="page-grid" style={{ '--pg-cols': '1fr 280px', gap: 24 } as React.CSSProperties}>
        {/* Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {posts.map(post => (
            <article key={post.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Author row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar initials={post.author.avatar} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{post.author.name}</span>
                    {post.author.verified && (
                      <span style={{ fontSize: 10, color: 'var(--lime)', fontWeight: 800 }}>✓</span>
                    )}
                    <Link href={`/${locale}/perfil/${post.author.handle}`} style={{ fontSize: 11, color: 'var(--muted)', textDecoration: 'none' }}>
                      @{post.author.handle}
                    </Link>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{timeAgo(post.createdAt)}</div>
                </div>
              </div>

              {/* Body */}
              <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>{post.body}</p>

              {/* Attached bet */}
              {post.attachedBet && (
                <div style={{ padding: '10px 14px', background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{post.attachedBet.matchLabel}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                      {post.attachedBet.selection}
                      <span style={{ color: 'var(--lime)', fontFamily: 'var(--font-cond)', fontWeight: 900, marginLeft: 8 }}>@ {post.attachedBet.odd.toFixed(2)}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: statusColor(post.attachedBet.status), background: `${statusColor(post.attachedBet.status)}22`, padding: '3px 8px', borderRadius: 4 }}>
                    {statusLabel(post.attachedBet.status)}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                <button type="button" style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                  ♥ {post.likes}
                </button>
                <button type="button" style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                  💬 {post.comments}
                </button>
                <button type="button" style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 12, cursor: 'pointer', marginLeft: 'auto' }}>
                  ↗ Compartilhar
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Sidebar: mini leaderboard */}
        <div className="page-sidebar">
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Top Traders</span>
              <Link href={`/${locale}/ranking`} style={{ fontSize: 11, color: 'var(--lime)', fontWeight: 700, textDecoration: 'none' }}>Ver todos →</Link>
            </div>
            {top3.map(entry => (
              <div key={entry.user.handle} style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 16, fontWeight: 900, fontFamily: 'var(--font-cond)', color: 'var(--muted)', width: 20, textAlign: 'center' }}>{entry.rank}</span>
                <Avatar initials={entry.user.avatar} size={30} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.user.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)' }}>{entry.totalBets} apostas</div>
                </div>
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--lime)', fontFamily: 'var(--font-cond)' }}>+{entry.roi.toFixed(1)}%</span>
              </div>
            ))}
            <div style={{ padding: '12px 18px' }}>
              <Link href={`/${locale}/ranking`} style={{ display: 'block', textAlign: 'center', fontSize: 12, color: 'var(--muted)', textDecoration: 'none', fontWeight: 600 }}>
                Ver ranking completo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
