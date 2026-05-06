import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db/client';
import { bets, bankrolls } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const patchSchema = z.object({
  status: z.enum(['pending', 'won', 'lost', 'void', 'cashout']),
});

function calcProfit(stake: number, odd: number, status: string): number {
  if (status === 'won') return stake * (odd - 1);
  if (status === 'lost') return -stake;
  return 0;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

  const db = getDb();
  const [existing] = await db
    .select()
    .from(bets)
    .where(and(eq(bets.id, id), eq(bets.userId, session.user.id)))
    .limit(1);

  if (!existing) return Response.json({ error: 'Not found' }, { status: 404 });

  const newStatus = parsed.data.status;
  const profit = newStatus !== 'pending' ? calcProfit(existing.stake, existing.odd, newStatus) : null;
  const settledAt = newStatus !== 'pending' ? new Date() : null;

  const [updated] = await db
    .update(bets)
    .set({ status: newStatus, profit, settledAt })
    .where(eq(bets.id, id))
    .returning();

  // Update bankroll current_amount
  if (profit !== null) {
    const [bankroll] = await db
      .select()
      .from(bankrolls)
      .where(eq(bankrolls.id, existing.bankrollId))
      .limit(1);
    if (bankroll) {
      const prevProfit = existing.profit ?? 0;
      await db
        .update(bankrolls)
        .set({ currentAmount: bankroll.currentAmount - prevProfit + profit })
        .where(eq(bankrolls.id, bankroll.id));
    }
  }

  return Response.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const db = getDb();

  const [existing] = await db
    .select()
    .from(bets)
    .where(and(eq(bets.id, id), eq(bets.userId, session.user.id)))
    .limit(1);

  if (!existing) return Response.json({ error: 'Not found' }, { status: 404 });

  await db.delete(bets).where(eq(bets.id, id));
  return new Response(null, { status: 204 });
}
