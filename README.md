# OddSeek

Plataforma de inteligência de apostas esportivas. Agrega odds de múltiplas casas, identifica apostas com EV+ e oferece gestão de banca profissional. **Não é uma casa de apostas.**

## Stack

- **Next.js 16** (App Router, RSC, Server Actions, Turbopack)
- **Auth.js v5** — credenciais + Google OAuth
- **Drizzle ORM** + **Neon Postgres** (serverless)
- **Upstash Redis** — cache de odds + rate limiting
- **Tailwind CSS v4** + CSS variables (tema broadcast esportivo)

## Setup local

### 1. Pré-requisitos

- Node.js 20+
- pnpm (`npm i -g pnpm`)
- Conta na [Vercel](https://vercel.com) (para Neon + Upstash via Marketplace)

### 2. Instalar dependências

```bash
pnpm install
```

### 3. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais:

| Variável | Descrição | Onde obter |
|---|---|---|
| `DATABASE_URL` | URL Postgres Neon | Vercel Marketplace → Neon |
| `UPSTASH_REDIS_REST_URL` | URL REST Upstash | Vercel Marketplace → Upstash |
| `UPSTASH_REDIS_REST_TOKEN` | Token Upstash | Idem |
| `AUTH_SECRET` | Segredo JWT (32+ bytes) | `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID` | Client ID OAuth | Google Cloud Console |
| `AUTH_GOOGLE_SECRET` | Client Secret OAuth | Google Cloud Console |

### 4. Criar o banco de dados

```bash
# Aplicar o schema
pnpm db:push

# Popular com dados de demonstração
pnpm db:seed
```

### 5. Rodar em desenvolvimento

```bash
pnpm dev
```

Acesse `http://localhost:3000`. Login demo: `demo@oddseek.app` / `demo1234`.

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `pnpm dev` | Servidor de desenvolvimento (Turbopack) |
| `pnpm build` | Build de produção |
| `pnpm start` | Servidor de produção local |
| `pnpm lint` | ESLint |
| `pnpm test` | Testes unitários (Vitest) |
| `pnpm db:push` | Aplicar schema Drizzle no banco |
| `pnpm db:seed` | Popular banco com dados de demonstração |
| `pnpm db:studio` | Abrir Drizzle Studio (GUI do banco) |

## Deploy na Vercel

### 1. Instalar Vercel CLI e fazer login

```bash
npm i -g vercel
vercel login
vercel link
```

### 2. Provisionar banco e cache via Marketplace

No dashboard da Vercel, vá em **Storage** e adicione:
- **Neon** (Postgres) — selecione a região mais próxima
- **Upstash** (Redis) — selecione a mesma região

As variáveis de ambiente são injetadas automaticamente no projeto.

### 3. Configurar variáveis de ambiente restantes

```bash
vercel env add AUTH_SECRET production
vercel env add AUTH_GOOGLE_ID production
vercel env add AUTH_GOOGLE_SECRET production
```

### 4. Sincronizar env local

```bash
vercel env pull .env.local
```

### 5. Aplicar schema e seed

```bash
pnpm db:push
pnpm db:seed
```

### 6. Deploy

```bash
vercel --prod
```

## Estrutura de pastas

```
app/
  [locale]/
    (marketing)/     # Landing, termos, privacidade
    (auth)/          # Login, registro, recuperar senha
    (app)/           # Dashboard e páginas autenticadas
  api/               # Route Handlers
components/
  marketing/         # Seções da landing
  layout/            # Nav, sidebar, topbar, ticker
  brand/             # Logo, mascote, mark
  odds/              # OddsTable, EVBadge
  tips/              # TipCard, ConfidenceRing
  parlays/           # ParlayBuilder, ParlayCard
  banca/             # BancaDashboard, BankrollChart
  community/         # PostCard, LeaderboardRow
lib/
  analytics/         # ev.ts, probability.ts, parlay.ts
  banca/             # metrics.ts, stake.ts, alerts.ts
  db/                # schema.ts, client.ts, seed.ts
  odds/              # adapters, aggregator
```

## Motor de cálculo

- **EV+**: `impliedProbability(odd) = 1/odd` → `EV = p × odd − 1`
- **Devigorize**: Power method para remover margem da casa
- **Kelly**: `f = (p×b − (1−p)) / b` com half-Kelly e cap por perfil de risco
- **Parlay**: probabilidade combinada × odd combinada − 1

## Conformidade

- OddSeek **não** é casa de apostas e **não** recebe dinheiro de apostas
- Proibido para menores de 18 anos (AgeGate no registro)
- LGPD: consentimento explícito, exclusão de conta via `/configuracoes`
- Sem linguagem de "ganhos garantidos" em qualquer copy

## Licença

Proprietário — todos os direitos reservados. Código não licenciado para redistribuição.
