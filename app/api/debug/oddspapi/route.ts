import { NextResponse } from 'next/server';

const API_BASE = 'https://api.oddspapi.io/v4';

// Only accessible with a secret header so it doesn't expose data publicly
export async function GET(req: Request) {
  const secret = req.headers.get('x-debug-secret');
  if (secret !== (process.env.AUTH_SECRET ?? '')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.ODDSPAPI_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'ODDSPAPI_KEY not set' }, { status: 400 });
  }

  const results: Record<string, unknown> = {};

  // Test 1: fixtures for Brasileirao (tournamentId=325)
  try {
    const url = `${API_BASE}/fixtures?apiKey=${apiKey}&tournamentId=325&hasOdds=true`;
    const res = await fetch(url, { cache: 'no-store' });
    const text = await res.text();
    let data: unknown;
    try { data = JSON.parse(text); } catch { data = text; }
    results.fixtures_325 = { status: res.status, ok: res.ok, sample: Array.isArray(data) ? (data as unknown[]).slice(0, 2) : data };
  } catch (e) {
    results.fixtures_325 = { error: String(e) };
  }

  // Test 2: odds for Brasileirao via bet365
  try {
    const url = `${API_BASE}/odds-by-tournaments?apiKey=${apiKey}&tournamentIds=325&bookmaker=bet365&oddsFormat=decimal`;
    const res = await fetch(url, { cache: 'no-store' });
    const text = await res.text();
    let data: unknown;
    try { data = JSON.parse(text); } catch { data = text; }
    results.odds_325_bet365 = { status: res.status, ok: res.ok, sample: Array.isArray(data) ? (data as unknown[]).slice(0, 1) : data };
  } catch (e) {
    results.odds_325_bet365 = { error: String(e) };
  }

  // Test 3: sports list
  try {
    const url = `${API_BASE}/sports?apiKey=${apiKey}`;
    const res = await fetch(url, { cache: 'no-store' });
    const text = await res.text();
    let data: unknown;
    try { data = JSON.parse(text); } catch { data = text; }
    results.sports = { status: res.status, ok: res.ok, data };
  } catch (e) {
    results.sports = { error: String(e) };
  }

  return NextResponse.json(results);
}
