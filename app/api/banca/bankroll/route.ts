import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db/client';
import { bankrolls } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const [bankroll] = await db
    .select()
    .from(bankrolls)
    .where(eq(bankrolls.userId, session.user.id))
    .orderBy(bankrolls.createdAt)
    .limit(1);

  if (bankroll) return Response.json(bankroll);

  const [created] = await db.insert(bankrolls).values({
    userId: session.user.id,
    initialAmount: 2000,
    currentAmount: 2000,
    riskProfile: 'moderado',
    isDefault: true,
  }).returning();

  return Response.json(created);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as { initialAmount?: number; riskProfile?: string };
  const db = getDb();

  const [bankroll] = await db
    .select()
    .from(bankrolls)
    .where(eq(bankrolls.userId, session.user.id))
    .limit(1);

  if (!bankroll) return Response.json({ error: 'Not found' }, { status: 404 });

  const [updated] = await db
    .update(bankrolls)
    .set({
      ...(body.initialAmount != null ? { initialAmount: body.initialAmount } : {}),
      ...(body.riskProfile ? { riskProfile: body.riskProfile as 'conservador' | 'moderado' | 'agressivo' } : {}),
    })
    .where(eq(bankrolls.id, bankroll.id))
    .returning();

  return Response.json(updated);
}
