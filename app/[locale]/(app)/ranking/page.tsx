import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import { getDb } from '@/lib/db/client';
import { bets, users } from '@/lib/db/schema';
import { eq, and, ne, sql } from 'drizzle-orm';
import { MOCK_LEADERBOARD } from '@/lib/community/mock-data';

interface RankEntry {
  userId: string;
  name: string;
  handle: string;
  totalBets: number;
  wins: number;
  losses: number;
  profit: number;
  roi: number;
  hitRate: number;
  rank?: number;
}

async function getLeaderboard(): Promise<RankEntry[]> {
  try {
    const db = getDb();
    const rows = await db
      .select({
        userId:      users.id,
        name:        users.name,
        handle:      users.handle,
        totalBets:   sql<number>`count(${bets.id})`,
        wins:        sql<number>`sum(case when ${bets.status} = 'won' then 1 else 0 end)`,
        losses:      sql<number>`sum(case when ${bets.status} = 'lost' then 1 else 0 end)`,
        totalStake:  sql<number>`coalesce(sum(${bets.stake}), 0)`,
        totalProfit: sql<number>`coalesce(sum(${bets.profit}), 0)`,
      })
      .from(users)
      .leftJoin(bets, and(eq(bets.userId, users.id), ne(bets.status, 'pending')))
      .groupBy(users.id, users.name, users.handle)
      .having(sql`count(${bets.id}) > 0`);

    if (rows.length === 0) throw new Error('empty');

    return rows.map(r => {
      const settled = Number(r.wins) + Number(r.losses);
      const totalStake = Number(r.totalStake);
      const profit = Number(r.totalProfit);
      const roi = settled > 0 && totalStake > 0 ? (profit / totalStake) * 100 : 0;
      const hitRate = settled > 0 ? (Number(r.wins) / settled) * 100 : 0;
      return {
        userId:    r.userId,
        name:      r.name ?? 'Usuário',
        handle:    r.handle ?? r.userId.slice(0, 8),
        totalBets: Number(r.totalBets),
        wins:      Number(r.wins),
        losses:    Number(r.losses),
        profit,
        roi:       parseFloat(roi.toFixed(1)),
        hitRate:   parseFloat(hitRate.toFixed(1)),
      };
    });
  } catch {
    return MOCK_LEADERBOARD.map(e => ({
      userId:    e.user.handle,
      name:      e.user.name,
      handle:    e.user.handle,
      totalBets: e.totalBets,
      wins:      Math.round(e.totalBets * e.hitRate),
      losses:    e.totalBets - Math.round(e.totalBets * e.hitRate),
      profit:    e.totalProfit,
      roi:       e.roi,
      hitRate:   e.hitRate * 100,
    }));
  }
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
}

interface Props {
  searchParams: Promise<{ period?: string; sort?: string }>;
}

export default async function RankingPage({ searchParams }: Props) {
  const locale = await getLocale();
  const sp     = await searchParams;
  const period = sp.period ?? '30';
  const sort   = sp.sort   ?? 'roi';

  const medals = ['🥇', '🥈', '🥉'];

  const data = await getLeaderboard();
  const entries = [...data]
    .sort((a, b) => {
      if (sort === 'acerto') return b.hitRate - a.hitRate;
      if (sort === 'lucro')  return b.profit - a.profit;
      return b.roi - a.roi;
    })
    .map((e, i) => ({ ...e, rank: i + 1 }));

  function periodHref(p: string) {
    const params = new URLSearchParams();
    params.set('period', p);
    if (sort !== 'roi') params.set('sort', sort);
    return `/${locale}/ranking?${params.toString()}`;
  }

  function sortHref(s: string) {
    const params = new URLSearchParams();
    if (period !== '30') params.set('period', period);
    params.set('sort', s);
    return `/${locale}/ranking?${params.toString()}`;
  }

  function Avatar({ name, size = 36 }: { name: string; size?: number }) {
    return (
      <span style={{ width: size, height: size, borderRadius: '50%', background: 'var(--dim)', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.35, fontWeight: 800, color: 'var(--lime)', flexShrink: 0, fontFamily: 'var(--font-cond)' }}>
        {initials(name)}
      </span>
    );
  }

  const fmtProfit = (v: number) =>
    v >= 0 ? `+R$${v.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}` : `-R$${Math.abs(v).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ marginBottom: 10 }}>
        <h1 style={{ fontFamily: 'var(--font-cond)', fontSize: 28, fontWeight: 800, letterSpacing: '-0.01em', textTransform: 'uppercase', color: 'var(--text)', margin: 0 }}>
          Ranking Global
        </h1>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
          Top traders por ROI · últimos {period === '7' ? '7' : period === 'all' ? 'todos os' : '30'} dias
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {[{ label: '7 dias', value: '7' }, { label: '30 dias', value: '30' }, { label: 'Tudo', value: 'all' }].map(p => (
          <Link key={p.value} href={periodHref(p.value)} className={`f-tab${period === p.value ? ' on' : ''}`}>{p.label}</Link>
        ))}
        <span className="f-sep" />
        {[{ label: 'ROI', value: 'roi' }, { label: 'Acerto', value: 'acerto' }, { label: 'Lucro', value: 'lucro' }].map(s => (
          <Link key={s.value} href={sortHref(s.value)} className={`f-tab${sort === s.value ? ' on' : ''}`}>{s.label}</Link>
        ))}
      </div>

      {/* Top 3 cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14, marginBottom: 24 }}>
        {entries.slice(0, 3).map(entry => (
          <Link key={entry.handle} href={`/${locale}/perfil/${entry.handle}`} style={{ textDecoration: 'none' }}>
            <div style={{ background: 'var(--surface)', border: `1px solid ${entry.rank === 1 ? 'oklch(80% 0.3 115 / 0.4)' : 'var(--border)'}`, borderRadius: 12, padding: '20px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{ fontSize: 24 }}>{medals[entry.rank! - 1]}</div>
              <Avatar name={entry.name} size={44} />
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{entry.name}</div>
              <div style={{ fontFamily: 'var(--font-cond)', fontSize: 28, fontWeight: 900, color: 'var(--lime)', lineHeight: 1 }}>
                {sort === 'acerto' ? `${entry.hitRate.toFixed(0)}%` : sort === 'lucro' ? fmtProfit(entry.profit) : `+${entry.roi.toFixed(1)}%`}
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                {sort === 'acerto' ? 'Taxa de acerto' : sort === 'lucro' ? 'Lucro total' : 'ROI'} · {entry.totalBets} apostas
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Full table */}
      <div className="table-wrap wide">
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr 80px 80px 90px 70px', gap: 12, padding: '10px 20px', background: 'var(--s2)', borderBottom: '1px solid var(--border)', fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--muted)' }}>
            <div>#</div><div>Trader</div><div style={{ textAlign: 'right' }}>ROI</div><div style={{ textAlign: 'right' }}>Acerto</div><div style={{ textAlign: 'right' }}>Lucro</div><div style={{ textAlign: 'right' }}>Apostas</div>
          </div>
          {entries.map((entry, i) => (
            <Link key={entry.handle} href={`/${locale}/perfil/${entry.handle}`} style={{ textDecoration: 'none' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr 80px 80px 90px 70px', gap: 12, padding: '12px 20px', borderBottom: i < entries.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 900, fontFamily: 'var(--font-cond)', color: (entry.rank ?? 0) <= 3 ? 'var(--lime)' : 'var(--muted)', textAlign: 'center' }}>
                  {(entry.rank ?? 0) <= 3 ? medals[(entry.rank ?? 0) - 1] : entry.rank}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar name={entry.name} size={32} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{entry.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>@{entry.handle}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: 14, fontWeight: 800, color: 'var(--lime)', fontFamily: 'var(--font-cond)' }}>{entry.roi >= 0 ? '+' : ''}{entry.roi.toFixed(1)}%</div>
                <div style={{ textAlign: 'right', fontSize: 13, color: 'var(--text)' }}>{entry.hitRate.toFixed(0)}%</div>
                <div style={{ textAlign: 'right', fontSize: 13, color: entry.profit >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>{fmtProfit(entry.profit)}</div>
                <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--muted)' }}>{entry.totalBets}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
