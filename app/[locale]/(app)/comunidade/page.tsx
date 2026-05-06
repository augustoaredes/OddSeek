import type React from 'react';
import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import { getDb } from '@/lib/db/client';
import { posts, users } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { MOCK_LEADERBOARD } from '@/lib/community/mock-data';

interface DbPost {
  id: string;
  body: string;
  createdAt: Date;
  userId: string;
  userName: string | null;
  userHandle: string | null;
  commentCount: number;
}

async function getPosts(): Promise<DbPost[]> {
  try {
    if (!process.env.DATABASE_URL) return [];
    const db = getDb();
    const rows = await db
      .select({
        id:           posts.id,
        body:         posts.body,
        createdAt:    posts.createdAt,
        userId:       posts.userId,
        userName:     users.name,
        userHandle:   users.handle,
        commentCount: sql<number>`(select count(*) from comments where comments.post_id = ${posts.id})`,
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .orderBy(desc(posts.createdAt))
      .limit(20);
    return rows as DbPost[];
  } catch {
    return [];
  }
}

function timeAgo(date: Date | string): string {
  const ms = Date.now() - new Date(date).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return 'agora';
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function initials(name: string | null): string {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

export default async function ComunidadePage() {
  const locale = await getLocale();
  const dbPosts = await getPosts();
  const top3 = MOCK_LEADERBOARD.slice(0, 3);

  function Avatar({ name, size = 36 }: { name: string | null; size?: number }) {
    return (
      <span style={{
        width: size, height: size, borderRadius: '50%',
        background: 'var(--dim)', border: '1px solid var(--border)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.35, fontWeight: 800, color: 'var(--lime)',
        flexShrink: 0, fontFamily: 'var(--font-cond)',
      }}>
        {initials(name)}
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
          {dbPosts.length === 0 && (
            <div style={{ padding: '48px 20px', textAlign: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>💬</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Ainda sem posts</div>
              <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>Seja o primeiro a compartilhar uma análise!</p>
            </div>
          )}
          {dbPosts.map(post => (
            <article key={post.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Author row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar name={post.userName} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                      {post.userName ?? 'Anônimo'}
                    </span>
                    {post.userHandle && (
                      <Link href={`/${locale}/perfil/${post.userHandle}`} style={{ fontSize: 11, color: 'var(--muted)', textDecoration: 'none' }}>
                        @{post.userHandle}
                      </Link>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{timeAgo(post.createdAt)}</div>
                </div>
              </div>

              {/* Body */}
              <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>{post.body}</p>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                <button type="button" style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                  💬 {post.commentCount}
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
            {top3.map((entry, i) => (
              <div key={entry.user.handle} style={{ padding: '12px 18px', borderBottom: i < 2 ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 16, fontWeight: 900, fontFamily: 'var(--font-cond)', color: 'var(--muted)', width: 20, textAlign: 'center' }}>{i + 1}</span>
                <Avatar name={entry.user.name} size={30} />
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
