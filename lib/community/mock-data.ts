export interface CommunityUser {
  handle: string;
  name: string;
  avatar: string; // initials fallback
  verified: boolean;
}

export interface Post {
  id: string;
  author: CommunityUser;
  body: string;
  attachedBet?: {
    matchLabel: string;
    selection: string;
    odd: number;
    status: 'won' | 'lost' | 'pending';
  };
  likes: number;
  comments: number;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  user: CommunityUser;
  roi: number;
  hitRate: number;
  totalProfit: number;
  totalBets: number;
  streak: number;
}

const now = Date.now();
const ago = (h: number) => new Date(now - h * 3_600_000).toISOString();

export const COMMUNITY_USERS: CommunityUser[] = [
  { handle: 'pedroev',    name: 'Pedro EV+',       avatar: 'PE', verified: true },
  { handle: 'anabets',    name: 'Ana Bets',         avatar: 'AB', verified: true },
  { handle: 'rafavalue',  name: 'Rafael Value',     avatar: 'RV', verified: false },
  { handle: 'luizsharp',  name: 'Luiz Sharp',       avatar: 'LS', verified: true },
  { handle: 'camilaodds', name: 'Camila Odds',      avatar: 'CO', verified: false },
  { handle: 'guilhermeK', name: 'Guilherme K.',     avatar: 'GK', verified: true },
  { handle: 'marinaEV',   name: 'Marina EV',        avatar: 'ME', verified: false },
  { handle: 'demo',       name: 'Demo User',        avatar: 'DU', verified: false },
];

export const MOCK_POSTS: Post[] = [
  {
    id: 'p01',
    author: COMMUNITY_USERS[0],
    body: '🔥 Real Madrid com EV +8.3% na Bet365 hoje. Odd 2.20 enquanto o mercado está precificando em 2.05. Janela curta, vai fechar rápido.',
    attachedBet: { matchLabel: 'Real Madrid vs PSG', selection: 'Real Madrid', odd: 2.20, status: 'pending' },
    likes: 47, comments: 12, createdAt: ago(1),
  },
  {
    id: 'p02',
    author: COMMUNITY_USERS[1],
    body: 'Alcaraz no saibro de Roland Garros com 63% de prob real vs 55% implícita. EV +14.5%. Adicionar à banca com 3% de stake (Kelly moderado).',
    attachedBet: { matchLabel: 'Djokovic vs Alcaraz', selection: 'Alcaraz', odd: 1.82, status: 'won' },
    likes: 89, comments: 23, createdAt: ago(3),
  },
  {
    id: 'p03',
    author: COMMUNITY_USERS[3],
    body: 'Lakers encerrou uma sequência de 4 vitórias seguidas hoje. Mercado reage demais a momentum, criando EV negativo em Lakers agora. Aguardando recalibração antes de entrar.',
    likes: 31, comments: 8, createdAt: ago(5),
  },
  {
    id: 'p04',
    author: COMMUNITY_USERS[5],
    body: 'Método Kelly funcionando: fechei o mês com +18.4% ROI usando half-Kelly em apostas com EV > 5%. Disciplina > predição.',
    likes: 124, comments: 34, createdAt: ago(8),
  },
  {
    id: 'p05',
    author: COMMUNITY_USERS[2],
    body: 'Devigorização das odds do Brasileirão hoje: Flamengo com 52% de prob real, odds do mercado implicam 46%. Bet clara mas liquidez baixa na Superbet.',
    attachedBet: { matchLabel: 'Flamengo vs Palmeiras', selection: 'Flamengo', odd: 2.35, status: 'pending' },
    likes: 28, comments: 6, createdAt: ago(12),
  },
  {
    id: 'p06',
    author: COMMUNITY_USERS[4],
    body: 'Dica para iniciantes: nunca aposte mais de 5% da banca em um único evento, independente do EV. O variance em amostras pequenas é brutal.',
    likes: 203, comments: 45, createdAt: ago(20),
  },
  {
    id: 'p07',
    author: COMMUNITY_USERS[1],
    body: 'UFC 300: Jones com 72% prob real vs 64% implícita na Pixbet. EV +12.5%. Tamanho: 2.5% banca (conservador por ser MMA — alta variância).',
    attachedBet: { matchLabel: 'Jones vs Miocic', selection: 'Jones', odd: 1.57, status: 'won' },
    likes: 67, comments: 19, createdAt: ago(28),
  },
  {
    id: 'p08',
    author: COMMUNITY_USERS[6],
    body: 'Fechei meu primeiro mês na plataforma: +11.2% ROI, 62% de acerto, 28 apostas. O motor de EV realmente funciona quando você tem disciplina para não desviar.',
    likes: 156, comments: 41, createdAt: ago(36),
  },
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, user: COMMUNITY_USERS[1], roi: 34.8, hitRate: 0.71, totalProfit: 2940, totalBets: 48, streak: 7 },
  { rank: 2, user: COMMUNITY_USERS[0], roi: 28.4, hitRate: 0.67, totalProfit: 1820, totalBets: 52, streak: 4 },
  { rank: 3, user: COMMUNITY_USERS[5], roi: 22.1, hitRate: 0.64, totalProfit: 1650, totalBets: 61, streak: 3 },
  { rank: 4, user: COMMUNITY_USERS[3], roi: 18.9, hitRate: 0.62, totalProfit: 1120, totalBets: 44, streak: 2 },
  { rank: 5, user: COMMUNITY_USERS[6], roi: 14.5, hitRate: 0.60, totalProfit:  870, totalBets: 38, streak: 5 },
  { rank: 6, user: COMMUNITY_USERS[2], roi: 11.2, hitRate: 0.57, totalProfit:  540, totalBets: 35, streak: 1 },
  { rank: 7, user: COMMUNITY_USERS[4], roi:  8.7, hitRate: 0.55, totalProfit:  390, totalBets: 29, streak: 0 },
  { rank: 8, user: COMMUNITY_USERS[7], roi:  5.2, hitRate: 0.52, totalProfit:  210, totalBets: 27, streak: 2 },
];

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return 'agora';
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  return `${d}d atrás`;
}
