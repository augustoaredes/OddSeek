import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { MOCK_LEADERBOARD, MOCK_POSTS } from '@/lib/community/mock-data';

interface Params {
  params: Promise<{ locale: string; handle: string }>;
}

export default async function PerfilPage({ params }: Params) {
  const { handle } = await params;
  const locale = await getLocale();

  const entry = MOCK_LEADERBOARD.find(e => e.user.handle === handle);
  if (!entry) notFound();

  const { user } = entry;
  const userPosts = MOCK_POSTS.filter(p => p.author.handle === handle);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Back */}
      <Link href={`/${locale}/comunidade`} style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'none', display: 'block', marginBottom: 20 }}>
        ← Comunidade
      </Link>

      {/* Profile header */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '28px 28px', marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
        <span style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--dim)', border: '2px solid var(--lime)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 900, color: 'var(--lime)', flexShrink: 0, fontFamily: 'var(--font-cond)' }}>
          {user.avatar}
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h1 style={{ fontFamily: 'var(--font-cond)', fontSize: 24, fontWeight: 900, color: 'var(--text)', margin: 0 }}>{user.name}</h1>
            {user.verified && <span style={{ fontSize: 12, color: 'var(--lime)', fontWeight: 800 }}>✓ Verificado</span>}
          </div>
          <div style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 14 }}>@{user.handle}</div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {[
              { label: 'ROI',         value: `+${entry.roi.toFixed(1)}%`,  color: 'var(--lime)' },
              { label: 'Taxa Acerto', value: `${(entry.hitRate * 100).toFixed(0)}%`, color: 'var(--text)' },
              { label: 'Lucro Total', value: `+R$${entry.totalProfit.toLocaleString('pt-BR')}`, color: 'var(--green)' },
              { label: 'Apostas',     value: entry.totalBets,             color: 'var(--text)' },
              { label: 'Ranking',     value: `#${entry.rank}`,            color: 'var(--amber)' },
            ].map(stat => (
              <div key={stat.label}>
                <div style={{ fontFamily: 'var(--font-cond)', fontSize: 22, fontWeight: 900, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <button type="button" style={{ padding: '8px 18px', borderRadius: 8, background: 'var(--s2)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
          Seguir
        </button>
      </div>

      {/* Posts */}
      <div style={{ marginBottom: 12, fontSize: 12, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        Publicações ({userPosts.length})
      </div>
      {userPosts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)', fontSize: 13 }}>
          Nenhuma publicação ainda.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {userPosts.map(post => (
            <div key={post.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px' }}>
              <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, margin: '0 0 10px' }}>{post.body}</p>
              <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'var(--dim)' }}>
                <span>♥ {post.likes}</span>
                <span>💬 {post.comments}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
