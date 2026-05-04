import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { z } from 'zod';

const VALID_BOOKS = ['Bet365', 'Betano', 'Sportingbet', 'Pixbet', 'Superbet'] as const;

const ClickSchema = z.object({
  book:       z.enum(VALID_BOOKS),
  targetUrl:  z.string().url(),
  eventId:    z.string().optional(),
  tipId:      z.string().optional(),
  referrer:   z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ClickSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
    }

    const { book, targetUrl, eventId, tipId, referrer } = parsed.data;

    // Hash the IP for LGPD compliance (no raw IP stored)
    const rawIP = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
    const ipHash = createHash('sha256').update(rawIP).digest('hex').slice(0, 16);

    // In production, persist to affiliate_clicks table here
    // For MVP: log the click and return the URL
    console.log(JSON.stringify({
      event: 'affiliate_click',
      book,
      eventId,
      tipId,
      referrer: referrer ?? req.headers.get('referer'),
      ipHash,
      ts: new Date().toISOString(),
    }));

    return NextResponse.json({ url: targetUrl });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
