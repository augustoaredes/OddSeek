import {
  pgTable,
  text,
  timestamp,
  integer,
  real,
  boolean,
  pgEnum,
  index,
  primaryKey,
  uuid,
  jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── ENUMS ────────────────────────────────────────────────────────────────────

export const roleEnum = pgEnum('user_role', ['user', 'admin']);
export const riskProfileEnum = pgEnum('risk_profile', ['conservador', 'moderado', 'agressivo']);
export const betStatusEnum = pgEnum('bet_status', ['pending', 'won', 'lost', 'void', 'cashout']);
export const betSourceEnum = pgEnum('bet_source', ['manual', 'tip', 'parlay']);
export const eventStatusEnum = pgEnum('event_status', ['scheduled', 'live', 'finished', 'cancelled']);
export const riskLevelEnum = pgEnum('risk_level', ['low', 'medium', 'high', 'blocked']);
export const confidenceBandEnum = pgEnum('confidence_band', ['value', 'highlight', 'high']);
export const alertKindEnum = pgEnum('alert_kind', [
  'consecutive_losses',
  'stake_too_high',
  'daily_drawdown',
  'critical_drawdown',
  'tip_expired',
  'tip_result',
]);

// ─── USERS (Auth.js v5 compatible) ────────────────────────────────────────────

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  passwordHash: text('password_hash'),
  handle: text('handle').unique(),
  role: roleEnum('role').default('user').notNull(),
  locale: text('locale').default('pt-BR').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { mode: 'date' }),
});

export const accounts = pgTable(
  'accounts',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })]
);

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })]
);

// ─── BANKROLLS ────────────────────────────────────────────────────────────────

export const bankrolls = pgTable('bankrolls', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').default('Principal').notNull(),
  initialAmount: real('initial_amount').notNull(),
  currentAmount: real('current_amount').notNull(),
  currency: text('currency').default('BRL').notNull(),
  unit: real('unit').default(100).notNull(),
  riskProfile: riskProfileEnum('risk_profile').default('moderado').notNull(),
  isDefault: boolean('is_default').default(true).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// ─── EVENTS ───────────────────────────────────────────────────────────────────

export const events = pgTable(
  'events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sport: text('sport').notNull(),
    league: text('league').notNull(),
    home: text('home').notNull(),
    away: text('away').notNull(),
    startsAt: timestamp('starts_at', { mode: 'date' }).notNull(),
    status: eventStatusEnum('status').default('scheduled').notNull(),
    homeScore: integer('home_score'),
    awayScore: integer('away_score'),
    elapsedMinutes: integer('elapsed_minutes'),
    sourceIds: jsonb('source_ids').$type<Record<string, string>>(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (t) => [
    index('events_sport_idx').on(t.sport),
    index('events_status_idx').on(t.status),
    index('events_starts_at_idx').on(t.startsAt),
  ]
);

// ─── ODDS SNAPSHOTS ───────────────────────────────────────────────────────────

export const oddsSnapshots = pgTable(
  'odds_snapshots',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    market: text('market').notNull(),
    selection: text('selection').notNull(),
    book: text('book').notNull(),
    odd: real('odd').notNull(),
    capturedAt: timestamp('captured_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (t) => [
    index('odds_event_idx').on(t.eventId),
    index('odds_captured_at_idx').on(t.capturedAt),
  ]
);

// ─── TIPS ─────────────────────────────────────────────────────────────────────

export const tips = pgTable(
  'tips',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    market: text('market').notNull(),
    selection: text('selection').notNull(),
    book: text('book').notNull(),
    odd: real('odd').notNull(),
    probability: real('probability').notNull(),
    ev: real('ev').notNull(),
    confidenceBand: confidenceBandEnum('confidence_band').notNull(),
    expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (t) => [
    index('tips_ev_idx').on(t.ev),
    index('tips_expires_at_idx').on(t.expiresAt),
  ]
);

// ─── PARLAYS ──────────────────────────────────────────────────────────────────

export const parlays = pgTable('parlays', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: text('owner_id').references(() => users.id, { onDelete: 'set null' }),
  totalOdd: real('total_odd').notNull(),
  combinedProbability: real('combined_probability').notNull(),
  ev: real('ev').notNull(),
  riskLevel: riskLevelEnum('risk_level').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export const parlayLegs = pgTable('parlay_legs', {
  parlayId: uuid('parlay_id')
    .notNull()
    .references(() => parlays.id, { onDelete: 'cascade' }),
  legIndex: integer('leg_index').notNull(),
  tipId: uuid('tip_id')
    .notNull()
    .references(() => tips.id, { onDelete: 'cascade' }),
  odd: real('odd').notNull(),
});

// ─── BETS ─────────────────────────────────────────────────────────────────────

export const bets = pgTable(
  'bets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    bankrollId: uuid('bankroll_id')
      .notNull()
      .references(() => bankrolls.id, { onDelete: 'cascade' }),
    sport: text('sport').notNull(),
    league: text('league').notNull(),
    eventLabel: text('event_label').notNull(),
    market: text('market').notNull(),
    selection: text('selection').notNull(),
    book: text('book').notNull(),
    odd: real('odd').notNull(),
    stake: real('stake').notNull(),
    status: betStatusEnum('status').default('pending').notNull(),
    profit: real('profit'),
    source: betSourceEnum('source').default('manual').notNull(),
    tipId: uuid('tip_id').references(() => tips.id, { onDelete: 'set null' }),
    parlayId: uuid('parlay_id').references(() => parlays.id, { onDelete: 'set null' }),
    placedAt: timestamp('placed_at', { mode: 'date' }).defaultNow().notNull(),
    settledAt: timestamp('settled_at', { mode: 'date' }),
  },
  (t) => [
    index('bets_user_idx').on(t.userId),
    index('bets_status_idx').on(t.status),
    index('bets_placed_at_idx').on(t.placedAt),
  ]
);

// ─── AFFILIATE ────────────────────────────────────────────────────────────────

export const affiliateLinks = pgTable('affiliate_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  book: text('book').notNull().unique(),
  country: text('country').default('BR').notNull(),
  baseUrl: text('base_url').notNull(),
  params: jsonb('params').$type<Record<string, string>>(),
  active: boolean('active').default(true).notNull(),
});

export const affiliateClicks = pgTable(
  'affiliate_clicks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
    book: text('book').notNull(),
    targetUrl: text('target_url').notNull(),
    referrer: text('referrer'),
    ipHash: text('ip_hash'),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (t) => [index('affiliate_clicks_book_idx').on(t.book)]
);

// ─── COMMUNITY ────────────────────────────────────────────────────────────────

export const posts = pgTable(
  'posts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    body: text('body').notNull(),
    attachedBetId: uuid('attached_bet_id').references(() => bets.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (t) => [index('posts_user_idx').on(t.userId)]
);

export const comments = pgTable(
  'comments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    postId: uuid('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    body: text('body').notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (t) => [index('comments_post_idx').on(t.postId)]
);

export const follows = pgTable(
  'follows',
  {
    followerId: text('follower_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    followedId: text('followed_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.followerId, t.followedId] })]
);

// ─── ALERTS ───────────────────────────────────────────────────────────────────

export const alerts = pgTable(
  'alerts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    kind: alertKindEnum('kind').notNull(),
    payload: jsonb('payload'),
    readAt: timestamp('read_at', { mode: 'date' }),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (t) => [index('alerts_user_idx').on(t.userId)]
);

// ─── AUDIT LOG ────────────────────────────────────────────────────────────────

export const auditLog = pgTable(
  'audit_log',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
    action: text('action').notNull(),
    target: text('target'),
    meta: jsonb('meta'),
    ipHash: text('ip_hash'),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (t) => [index('audit_log_user_idx').on(t.userId)]
);

// ─── RELATIONS ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  bankrolls: many(bankrolls),
  bets: many(bets),
  posts: many(posts),
  comments: many(comments),
  alerts: many(alerts),
  followers: many(follows, { relationName: 'followed' }),
  following: many(follows, { relationName: 'follower' }),
}));

export const bankrollsRelations = relations(bankrolls, ({ one, many }) => ({
  user: one(users, { fields: [bankrolls.userId], references: [users.id] }),
  bets: many(bets),
}));

export const betsRelations = relations(bets, ({ one }) => ({
  user: one(users, { fields: [bets.userId], references: [users.id] }),
  bankroll: one(bankrolls, { fields: [bets.bankrollId], references: [bankrolls.id] }),
  tip: one(tips, { fields: [bets.tipId], references: [tips.id] }),
  parlay: one(parlays, { fields: [bets.parlayId], references: [parlays.id] }),
}));

export const eventsRelations = relations(events, ({ many }) => ({
  oddsSnapshots: many(oddsSnapshots),
  tips: many(tips),
}));

export const tipsRelations = relations(tips, ({ one, many }) => ({
  event: one(events, { fields: [tips.eventId], references: [events.id] }),
  parlayLegs: many(parlayLegs),
  bets: many(bets),
}));

export const parlaysRelations = relations(parlays, ({ one, many }) => ({
  owner: one(users, { fields: [parlays.ownerId], references: [users.id] }),
  legs: many(parlayLegs),
}));

export const parlayLegsRelations = relations(parlayLegs, ({ one }) => ({
  parlay: one(parlays, { fields: [parlayLegs.parlayId], references: [parlays.id] }),
  tip: one(tips, { fields: [parlayLegs.tipId], references: [tips.id] }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, { fields: [posts.userId], references: [users.id] }),
  comments: many(comments),
  attachedBet: one(bets, { fields: [posts.attachedBetId], references: [bets.id] }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, { fields: [comments.postId], references: [posts.id] }),
  user: one(users, { fields: [comments.userId], references: [users.id] }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: 'follower',
  }),
  followed: one(users, {
    fields: [follows.followedId],
    references: [users.id],
    relationName: 'followed',
  }),
}));
