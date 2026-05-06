import { NextResponse } from 'next/server';
import { getEvents } from '@/lib/odds/fetcher';
import { findAllArb } from '@/lib/analytics/arbitrage';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const events = await getEvents();
    const opportunities = findAllArb(events);

    return NextResponse.json({
      count: opportunities.length,
      opportunities,
    });
  } catch (err) {
    console.error('[api/arbitrage] error:', err);
    return NextResponse.json({ error: 'Erro ao buscar oportunidades de arbitragem' }, { status: 500 });
  }
}
