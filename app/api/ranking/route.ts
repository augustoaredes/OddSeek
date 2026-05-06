import { getDb } from '@/lib/db/client';
import { bets, users, bankrolls } from '@/lib/db/schema';
import { eq, and, sql, ne } from 'drizzle-orm';

export async function GET() {
  const db = getDb();

  const rows = await db
    .select({
      userId:   users.id,
      name:     users.name,
      handle:   users.handle,
      totalBets: sql<number>`count(${bets.id})`,
      wins:     sql<number>`sum(case when ${bets.status} = 'won' then 1 else 0 end)`,
      losses:   sql<number>`sum(case when ${bets.status} = 'lost' then 1 else 0 end)`,
      totalStake: sql<number>`coalesce(sum(${bets.stake}), 0)`,
      totalProfit: sql<number>`coalesce(sum(${bets.profit}), 0)`,
    })
    .from(users)
    .leftJoin(bets, and(eq(bets.userId, users.id), ne(bets.status, 'pending')))
    .groupBy(users.id, users.name, users.handle)
    .having(sql`count(${bets.id}) > 0`);

  const leaderboard = rows
    .map(r => {
      const settled = Number(r.wins) + Number(r.losses);
      const roi = settled > 0 && Number(r.totalStake) > 0
        ? (Number(r.totalProfit) / Number(r.totalStake)) * 100
        : 0;
      const hitRate = settled > 0 ? (Number(r.wins) / settled) * 100 : 0;
      return {
        userId:   r.userId,
        name:     r.name ?? 'Usuário',
        handle:   r.handle ?? '',
        bets:     Number(r.totalBets),
        wins:     Number(r.wins),
        losses:   Number(r.losses),
        profit:   Number(r.totalProfit),
        roi:      parseFloat(roi.toFixed(1)),
        hitRate:  parseFloat(hitRate.toFixed(1)),
      };
    })
    .sort((a, b) => b.roi - a.roi)
    .slice(0, 50);

  return Response.json(leaderboard, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
  });
}
