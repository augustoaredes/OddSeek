import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db/client';
import { bets, bankrolls } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';

const createBetSchema = z.object({
  sport:      z.string().min(1),
  league:     z.string().min(1),
  eventLabel: z.string().min(1),
  market:     z.string().min(1),
  selection:  z.string().min(1),
  book:       z.string().min(1),
  odd:        z.number().min(1.01).max(30),
  stake:      z.number().positive(),
  source:     z.enum(['manual', 'tip', 'parlay']).default('manual'),
  tipId:      z.string().uuid().optional(),
});

async function getOrCreateBankroll(userId: string) {
  const db = getDb();
  const [existing] = await db
    .select()
    .from(bankrolls)
    .where(eq(bankrolls.userId, userId))
    .limit(1);

  if (existing) return existing;

  const [created] = await db.insert(bankrolls).values({
    userId,
    initialAmount: 2000,
    currentAmount: 2000,
    riskProfile: 'moderado',
    isDefault: true,
  }).returning();

  return created;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const rows = await db
    .select()
    .from(bets)
    .where(eq(bets.userId, session.user.id))
    .orderBy(desc(bets.placedAt))
    .limit(200);

  return Response.json(rows);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = createBetSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

  const bankroll = await getOrCreateBankroll(session.user.id);
  const db = getDb();

  const [bet] = await db.insert(bets).values({
    userId:     session.user.id,
    bankrollId: bankroll.id,
    ...parsed.data,
    tipId: parsed.data.tipId ?? null,
    status: 'pending',
  }).returning();

  return Response.json(bet, { status: 201 });
}
