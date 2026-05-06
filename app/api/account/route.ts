import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db/client';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const patchSchema = z.object({
  name:   z.string().min(1).max(80).optional(),
  handle: z.string().min(2).max(30).regex(/^[a-z0-9_]+$/, 'Apenas letras minúsculas, números e _').optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const [user] = await db
    .select({ id: users.id, name: users.name, email: users.email, handle: users.handle, image: users.image, role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json(user);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

  const db = getDb();
  const [updated] = await db
    .update(users)
    .set({ ...parsed.data })
    .where(eq(users.id, session.user.id))
    .returning({ name: users.name, handle: users.handle });

  return Response.json(updated);
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  // Anonimiza em vez de hard-delete — preserva integridade contábil
  await db
    .update(users)
    .set({
      name:         'Usuário Removido',
      email:        `deleted_${session.user.id}@oddseek.removed`,
      handle:       null,
      image:        null,
      passwordHash: null,
      deletedAt:    new Date(),
    })
    .where(eq(users.id, session.user.id));

  return Response.json({ ok: true });
}
