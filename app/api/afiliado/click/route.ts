import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db/client';
import { affiliateClicks } from '@/lib/db/schema';
import { affiliateRatelimit, checkRateLimit } from '@/lib/ratelimit';

const VALID_BOOKS = ['Bet365', 'Betano', 'Sportingbet', 'Pixbet', 'Superbet', 'Esportes da Sorte'] as const;

const ClickSchema = z.object({
  book:      z.enum(VALID_BOOKS),
  targetUrl: z.string().url(),
  eventId:   z.string().optional(),
  tipId:     z.string().optional(),
  referrer:  z.string().optional(),
});

export async function POST(req: NextRequest) {
  const rawIP = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  const ipHash = createHash('sha256').update(rawIP).digest('hex').slice(0, 16);

  const rl = await checkRateLimit(affiliateRatelimit, ipHash);
  if (!rl.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const body = await req.json().catch(() => ({}));
  const parsed = ClickSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  const { book, targetUrl, eventId, tipId, referrer } = parsed.data;

  const session = await auth();

  try {
    if (process.env.DATABASE_URL) {
      const db = getDb();
      await db.insert(affiliateClicks).values({
        userId:    session?.user?.id ?? null,
        book,
        targetUrl,
        referrer:  referrer ?? req.headers.get('referer') ?? null,
        ipHash,
      });
    }
  } catch {
    // não bloqueia o redirect em caso de falha de persistência
  }

  return NextResponse.json({ url: targetUrl });
}
