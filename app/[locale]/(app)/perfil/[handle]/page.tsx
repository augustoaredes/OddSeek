import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { getDb } from '@/lib/db/client';
import { users, bets, posts } from '@/lib/db/schema';
import { eq, and, isNull, sql, desc } from 'drizzle-orm';

interface Params {
  params: Promise<{ locale: string; handle: string }>;
}

function initials(name: string | null): string {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
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

export default async function PerfilPage({ params }: Params) {
  const { handle } = await params;
  const locale = await getLocale();

  if (!process.env.DATABASE_URL) notFound();

  const db = getDb();

  // Load user by handle
  const [user] = await db
    .select({ id: users.id, name: users.name, handle: users.handle, image: users.image })
    .from(users)
    .where(and(eq(users.handle, handle), isNull(users.deletedAt)))
    .limit(1)
    .catch(() => []);

  if (!user) notFound();

  // Load bets stats
  const [stats] = await db
    .select({
      totalBets: sql<number>`count(${bets.id})`,
      wins:      sql<number>`sum(case when ${bets.status} = 'won' then 1 else 0 end)`,
      losses:    sql<number>`sum(case when ${bets.status} = 'lost' then 1 else 0 end)`,
      profit:    sql<number>`coalesce(sum(${bets.profit}), 0)`,
      staked:    sql<number>`coalesce(sum(case when ${bets.status} in ('won','lost') then ${bets.stake} else 0 end), 0)`,
    })
    .from(bets)
    .where(eq(bets.userId, user.id));

  const totalBets  = Number(stats?.totalBets  ?? 0);
  const wins       = Number(stats?.wins       ?? 0);
  const profit     = Number(stats?.profit     ?? 0);
  const staked     = Number(stats?.staked     ?? 0);
  const hitRate    = totalBets > 0 ? wins / Math.max(wins + Number(stats?.losses ?? 0), 1) : 0;
  const roi        = staked > 0 ? (profit / staked) * 100 : 0;

  // Load recent posts
  const userPosts = await db
    .select({ id: posts.id, body: posts.body, createdAt: posts.createdAt })
    .from(posts)
    .where(eq(posts.userId, user.id))
    .orderBy(desc(posts.createdAt))
    .limit(10)
    .catch(() => []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Link href={`/${locale}/comunidade`} style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'none', display: 'block', marginBottom: 8 }}>
        ← Comunidade
      </Link>

      {/* Profile header */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '28px', display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
        <span style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'var(--dim)', border: '2px solid var(--lime)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, fontWeight: 900, color: 'var(--lime)',
          flexShrink: 0, fontFamily: 'var(--font-cond)',
        }}>
          {initials(user.name)}
        </span>

        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: 'var(--font-cond)', fontSize: 24, fontWeight: 900, color: 'var(--text)', margin: '0 0 4px' }}>
            {user.name ?? handle}
          </h1>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 18 }}>@{user.handle}</div>

          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {[
              { label: 'ROI',         value: `${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%`,     color: roi >= 0 ? 'var(--lime)' : 'var(--red)' },
              { label: 'Taxa Acerto', value: `${(hitRate * 100).toFixed(0)}%`,                color: 'var(--text)' },
              { label: 'Lucro Total', value: `${profit >= 0 ? '+' : ''}R$${Math.abs(profit).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`, color: profit >= 0 ? 'var(--green)' : 'var(--red)' },
              { label: 'Apostas',     value: totalBets,                                       color: 'var(--text)' },
            ].map(stat => (
              <div key={stat.label}>
                <div style={{ fontFamily: 'var(--font-cond)', fontSize: 22, fontWeight: 900, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Posts */}
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 8 }}>
        Publicações ({userPosts.length})
      </div>

      {userPosts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)', fontSize: 13, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }}>
          Nenhuma publicação ainda.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {userPosts.map(post => (
            <div key={post.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px' }}>
              <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, margin: '0 0 8px' }}>{post.body}</p>
              <div style={{ fontSize: 11, color: 'var(--dim)' }}>{timeAgo(post.createdAt)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
