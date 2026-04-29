import { NextResponse } from 'next/server';
import { hash } from 'argon2';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { getDb } from '@/lib/db/client';
import { users } from '@/lib/db/schema';
import { registerRatelimit, checkRateLimit } from '@/lib/ratelimit';
import { logger } from '@/lib/logger';

const schema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  const { success } = await checkRateLimit(registerRatelimit, ip);
  if (!success) {
    return NextResponse.json({ message: 'Muitas tentativas. Aguarde um minuto.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Requisição inválida.' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Dados inválidos.', errors: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { name, email, password } = parsed.data;
  const db = getDb();

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    return NextResponse.json({ message: 'E-mail já cadastrado.' }, { status: 409 });
  }

  const passwordHash = await hash(password, { memoryCost: 65536, timeCost: 3, parallelism: 1 });

  const handle = email.split('@')[0]?.replace(/[^a-z0-9_]/gi, '').slice(0, 20) ?? 'user';

  const [newUser] = await db
    .insert(users)
    .values({ name, email, passwordHash, handle: `${handle}_${Date.now().toString(36)}` })
    .returning({ id: users.id });

  logger.info({ userId: newUser?.id }, 'New user registered');

  return NextResponse.json({ ok: true }, { status: 201 });
}
