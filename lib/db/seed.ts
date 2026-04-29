import { faker } from '@faker-js/faker/locale/pt_BR';
import { hash } from 'argon2';
import { getDb } from './client';
import {
  users, bankrolls, events, oddsSnapshots, tips, parlays, parlayLegs,
  bets, affiliateLinks, posts, comments, follows, alerts,
} from './schema';

const db = getDb();

const SPORTS = ['Futebol', 'Basquete', 'Tênis', 'MMA', 'Vôlei', 'Rugby'];
const LEAGUES: Record<string, string[]> = {
  Futebol: ['Brasileirão Série A', 'Premier League', 'La Liga', 'Champions League'],
  Basquete: ['NBA', 'NBB', 'EuroLeague', 'FIBA'],
  Tênis: ['ATP Tour', 'WTA Tour', 'Roland Garros', 'Wimbledon'],
  MMA: ['UFC', 'Bellator', 'ONE Championship', 'PFL'],
  Vôlei: ['Superliga', 'CEV Champions', 'FIVB World League', 'LNL'],
  Rugby: ['Top 14', 'Premiership', 'Super Rugby', 'Six Nations'],
};
const BOOKS = ['Bet365', 'Betano', 'Sportingbet', 'Stake'];
const MARKETS = ['1X2', 'Handicap Asiático', 'Over/Under', 'Ambos Marcam', 'Vencedor do Set'];
const FOOTBALL_TEAMS = [
  'Flamengo', 'Corinthians', 'Palmeiras', 'São Paulo', 'Santos', 'Grêmio',
  'Internacional', 'Cruzeiro', 'Atletico MG', 'Vasco',
  'Arsenal', 'Chelsea', 'Man City', 'Man United', 'Liverpool', 'Tottenham',
  'Real Madrid', 'Barcelona', 'Atletico Madrid', 'Valencia',
];

function randomTeam() {
  return FOOTBALL_TEAMS[Math.floor(Math.random() * FOOTBALL_TEAMS.length)];
}

function oddsForSelection(isValue: boolean): number {
  if (isValue) return 1.5 + Math.random() * 1.5;
  return 1.2 + Math.random() * 0.8;
}

async function main() {
  console.log('Seeding database…');

  // ── Demo user ──────────────────────────────────────────────────────────────
  const demoPass = await hash('demo1234', { memoryCost: 65536, timeCost: 3, parallelism: 1 });
  const [demoUser] = await db.insert(users).values({
    id: 'demo-user-001',
    name: 'Demo User',
    email: 'demo@oddseek.app',
    passwordHash: demoPass,
    handle: 'demo',
    role: 'user',
  }).returning().onConflictDoNothing();

  // ── Extra users (leaderboard) ──────────────────────────────────────────────
  const extraUserData = Array.from({ length: 8 }, (_, i) => ({
    id: `user-${String(i + 2).padStart(3, '0')}`,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    handle: faker.internet.username().toLowerCase().slice(0, 16),
    role: 'user' as const,
  }));
  await db.insert(users).values(extraUserData).onConflictDoNothing();

  // ── Affiliate links ────────────────────────────────────────────────────────
  const bookLinks = BOOKS.map((book) => ({
    book,
    country: 'BR',
    baseUrl: `https://www.${book.toLowerCase()}.com/pt-br/`,
    params: { affid: `oddseek_${book.toLowerCase()}` },
    active: true,
  }));
  await db.insert(affiliateLinks).values(bookLinks).onConflictDoNothing();

  // ── Events ────────────────────────────────────────────────────────────────
  const now = new Date();
  const eventRows = [];
  for (let i = 0; i < 60; i++) {
    const sport = SPORTS[Math.floor(Math.random() * SPORTS.length)];
    const league = LEAGUES[sport][Math.floor(Math.random() * LEAGUES[sport].length)];
    const isLive = i < 10;
    const startsAt = isLive
      ? new Date(now.getTime() - Math.random() * 60 * 60 * 1000)
      : new Date(now.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000);
    eventRows.push({
      sport,
      league,
      home: randomTeam(),
      away: randomTeam(),
      startsAt,
      status: isLive ? ('live' as const) : ('scheduled' as const),
      homeScore: isLive ? Math.floor(Math.random() * 3) : null,
      awayScore: isLive ? Math.floor(Math.random() * 3) : null,
      elapsedMinutes: isLive ? Math.floor(Math.random() * 90) : null,
    });
  }
  const insertedEvents = await db.insert(events).values(eventRows).returning();

  // ── Odds snapshots ─────────────────────────────────────────────────────────
  const oddsRows = [];
  for (const evt of insertedEvents) {
    const market = MARKETS[Math.floor(Math.random() * MARKETS.length)];
    for (const book of BOOKS) {
      oddsRows.push({
        eventId: evt.id,
        market,
        selection: 'Home',
        book,
        odd: parseFloat((1.4 + Math.random() * 2).toFixed(2)),
      });
    }
  }
  await db.insert(oddsSnapshots).values(oddsRows);

  // ── Tips ──────────────────────────────────────────────────────────────────
  const tipRows = [];
  for (let i = 0; i < 25; i++) {
    const evt = insertedEvents[Math.floor(Math.random() * insertedEvents.length)];
    const odd = parseFloat((1.5 + Math.random() * 2).toFixed(2));
    const probability = parseFloat((0.35 + Math.random() * 0.3).toFixed(4));
    const ev = parseFloat((probability * odd - 1).toFixed(4));
    if (ev <= 0) continue;
    const confidenceBand =
      ev > 0.1 ? ('high' as const) : ev > 0.05 ? ('highlight' as const) : ('value' as const);
    const expiresAt = new Date(evt.startsAt.getTime() + 90 * 60 * 1000);
    tipRows.push({
      eventId: evt.id,
      market: MARKETS[Math.floor(Math.random() * MARKETS.length)],
      selection: 'Home',
      book: BOOKS[Math.floor(Math.random() * BOOKS.length)],
      odd,
      probability,
      ev,
      confidenceBand,
      expiresAt,
    });
  }
  const insertedTips = tipRows.length
    ? await db.insert(tips).values(tipRows).returning()
    : [];

  // ── Parlays ───────────────────────────────────────────────────────────────
  if (insertedTips.length >= 3) {
    const parlayRows = [];
    const parlayLegRows: Array<{ parlayId: string; legIndex: number; tipId: string; odd: number }> = [];
    for (let i = 0; i < 6; i++) {
      const numLegs = i < 3 ? 2 : 3;
      const legTips = insertedTips.slice(i * 2, i * 2 + numLegs);
      if (legTips.length < 2) continue;
      const totalOdd = parseFloat(legTips.reduce((acc, t) => acc * t.odd, 1).toFixed(2));
      const combinedProbability = parseFloat(legTips.reduce((acc, t) => acc * t.probability, 1).toFixed(4));
      const ev = parseFloat((combinedProbability * totalOdd - 1).toFixed(4));
      const riskLevel = combinedProbability >= 0.4 ? ('low' as const) : combinedProbability >= 0.2 ? ('medium' as const) : ('high' as const);
      parlayRows.push({ totalOdd, combinedProbability, ev, riskLevel });
      const [insertedParlay] = await db.insert(parlays).values({ totalOdd, combinedProbability, ev, riskLevel }).returning();
      for (let j = 0; j < legTips.length; j++) {
        parlayLegRows.push({ parlayId: insertedParlay.id, legIndex: j, tipId: legTips[j].id, odd: legTips[j].odd });
      }
    }
    if (parlayLegRows.length) {
      await db.insert(parlayLegs).values(parlayLegRows);
    }
  }

  // ── Demo bankroll + bets ──────────────────────────────────────────────────
  const demoUserId = demoUser?.id ?? 'demo-user-001';
  const [demoBankroll] = await db.insert(bankrolls).values({
    userId: demoUserId,
    name: 'Banca Principal',
    initialAmount: 1000,
    currentAmount: 1247.50,
    currency: 'BRL',
    unit: 100,
    riskProfile: 'moderado',
    isDefault: true,
  }).returning();

  const betStatuses = ['won', 'won', 'lost', 'won', 'lost', 'won', 'won', 'lost', 'won', 'won'] as const;
  const betRows = betStatuses.map((status, i) => {
    const odd = parseFloat((1.5 + Math.random() * 1.5).toFixed(2));
    const stake = parseFloat((50 + Math.random() * 100).toFixed(2));
    const profit = status === 'won' ? parseFloat((stake * (odd - 1)).toFixed(2)) : -stake;
    const placedAt = new Date(now.getTime() - (betStatuses.length - i) * 2 * 24 * 60 * 60 * 1000);
    return {
      userId: demoUserId,
      bankrollId: demoBankroll.id,
      sport: SPORTS[i % SPORTS.length],
      league: 'Brasileirão Série A',
      eventLabel: `${randomTeam()} vs ${randomTeam()}`,
      market: '1X2',
      selection: 'Home',
      book: BOOKS[i % BOOKS.length],
      odd,
      stake,
      status,
      profit,
      source: 'manual' as const,
      placedAt,
      settledAt: new Date(placedAt.getTime() + 120 * 60 * 1000),
    };
  });
  await db.insert(bets).values(betRows);

  // ── Extra bankrolls for other users ──────────────────────────────────────
  for (const u of extraUserData) {
    const initial = 500 + Math.floor(Math.random() * 2000);
    const profit = (Math.random() - 0.3) * initial * 0.4;
    await db.insert(bankrolls).values({
      userId: u.id,
      name: 'Banca Principal',
      initialAmount: initial,
      currentAmount: parseFloat((initial + profit).toFixed(2)),
      currency: 'BRL',
      unit: initial / 10,
      riskProfile: ['conservador', 'moderado', 'agressivo'][Math.floor(Math.random() * 3)] as 'conservador' | 'moderado' | 'agressivo',
      isDefault: true,
    });
  }

  // ── Community posts ───────────────────────────────────────────────────────
  const communityUserIds = [demoUserId, ...extraUserData.map((u) => u.id)];
  const postMessages = [
    'Boa entrada no Flamengo hoje, odds de 2.10 na Betano com EV+8%. Vamos ver.',
    'Encerrei o mês com +12% ROI. Disciplina na banca é tudo.',
    'Análise do clássico: Corinthians tem histórico de vitórias em casa nessa fase.',
    'Multipla de 3 pernas com EV+ combinado de +6%. Risco calculado.',
    'Gestão de banca é mais importante que qualquer dica. Nunca aposte mais de 3% por jogo.',
    'Interessante o movimento de odds no Over 2.5 desse jogo. Mercado sabe algo.',
    'Hit rate de 64% nas últimas 50 apostas. Processo é mais importante que resultado individual.',
    'Primeira semana usando OddSeek. Já encontrei 3 entradas com EV+ que eu teria ignorado.',
    'NBA hoje tem várias oportunidades com spread. Veja os insights.',
    'Minha estratégia de flat betting revisitada — quando Kelly não faz sentido.',
    'Real Madrid vs Barcelona: odds muito próximas, mercado equilibrado. Evitando.',
    'Champions League semi — Under 2.5 tem valor histórico nesses confrontos.',
  ];
  const insertedPosts = await db.insert(posts).values(
    postMessages.map((body, i) => ({
      userId: communityUserIds[i % communityUserIds.length],
      body,
    }))
  ).returning();

  // Comments
  const commentMessages = [
    'Concordo, eu vi isso também.', 'Boa análise!', 'Obrigado pelo compartilhamento.',
    'Vou seguir essa entrada.', 'Cuidado com o movimento de odds às vezes é trap.',
    'Faz sentido, mercado asiático confirma.', 'Bela estratégia.',
    'Qual plataforma você usa para acompanhar ao vivo?', 'Assim que deve ser feito!',
  ];
  const commentRows = insertedPosts.flatMap((post, pi) =>
    Array.from({ length: pi % 4 }, (_, ci) => ({
      postId: post.id,
      userId: communityUserIds[(pi + ci + 1) % communityUserIds.length],
      body: commentMessages[(pi + ci) % commentMessages.length],
    }))
  );
  if (commentRows.length) await db.insert(comments).values(commentRows);

  // Follows
  const followRows = extraUserData.flatMap((u) => [
    { followerId: demoUserId, followedId: u.id },
  ]).slice(0, 5);
  if (followRows.length) await db.insert(follows).values(followRows).onConflictDoNothing();

  console.log('Seed complete.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
