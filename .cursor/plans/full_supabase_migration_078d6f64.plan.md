---
name: Full Supabase Migration
overview: Migrere Trading Desk fra statisk HTML med localStorage til en fullverdig Next.js-app med Supabase-database, sikre API-ruter, og Vercel-deploy. Dataen synkroniseres på tvers av enheter via brukerautentisering.
todos:
  - id: supabase-setup
    content: Installer Supabase SDK og konfigurer miljøvariabler
    status: completed
  - id: db-schema
    content: Opprett database-tabeller i Supabase (users, trades, accounts, etc.)
    status: completed
  - id: rls-policies
    content: Konfigurer Row Level Security for alle tabeller
    status: completed
  - id: clerk-webhook
    content: Sett opp Clerk webhook for brukersynkronisering
    status: completed
  - id: api-routes
    content: Bygg API-ruter for trades, accounts, settings
    status: completed
  - id: react-components
    content: Konverter trading desk fra HTML til React-komponenter
    status: completed
  - id: data-hooks
    content: Lag custom hooks for datahenting (SWR/React Query)
    status: completed
  - id: migration-tool
    content: Bygg verktøy for å migrere localStorage-data til Supabase
    status: completed
  - id: vercel-deploy
    content: Deploy til Vercel med miljøvariabler
    status: completed
---

# Trading Desk - Full Supabase Migration

## Arkitektur

```mermaid
flowchart TB
    subgraph client [Frontend - Next.js]
        PAGES[React Pages]
        HOOKS[Custom Hooks]
        COMP[UI Components]
    end
    
    subgraph api [API Routes]
        TRADES_API[/api/trades]
        ACCOUNTS_API[/api/accounts]
        SYNC_API[/api/sync]
    end
    
    subgraph auth [Authentication]
        CLERK[Clerk]
        JWT[JWT Token]
    end
    
    subgraph db [Supabase]
        SUPA_AUTH[Supabase Auth Adapter]
        DB[(PostgreSQL)]
        RLS[Row Level Security]
    end

    PAGES --> HOOKS
    HOOKS --> api
    api --> JWT
    JWT --> SUPA_AUTH
    SUPA_AUTH --> RLS
    RLS --> DB
    CLERK --> JWT
```

---

## Fase 1: Supabase Setup

### 1.1 Installer dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 1.2 Miljøvariabler

Opprett [.env.local](.env.local):

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 1.3 Supabase Client

Opprett [lib/supabase/client.ts](lib/supabase/client.ts):

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

Opprett [lib/supabase/server.ts](lib/supabase/server.ts) for server-side.

---

## Fase 2: Database Schema

### 2.1 Kjerne-tabeller (Supabase SQL Editor)

```sql
-- Users (synkronisert med Clerk)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT,
  trader_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trading Accounts
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'default',
  starting_balance DECIMAL(15,2) DEFAULT 0,
  current_balance DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trades/Journal
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  symbol TEXT NOT NULL,
  direction TEXT CHECK (direction IN ('long', 'short')),
  entry_price DECIMAL(15,8),
  exit_price DECIMAL(15,8),
  quantity DECIMAL(15,8),
  pnl DECIMAL(15,2),
  fees DECIMAL(15,2) DEFAULT 0,
  notes TEXT,
  tags TEXT[],
  screenshot_url TEXT,
  trade_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Playbook Setups
CREATE TABLE playbook_setups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  rules TEXT[],
  screenshot_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Archives (prep, checklist, review)
CREATE TABLE daily_archives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  archive_date DATE NOT NULL,
  prep_data JSONB,
  checklist_data JSONB,
  review_data JSONB,
  screenshots JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, archive_date)
);

-- User Settings
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  theme JSONB DEFAULT '{"accent": "emerald", "mode": "dark"}',
  goals JSONB,
  daily_loss_limit JSONB,
  tilt_settings JSONB,
  widget_settings JSONB,
  prep_config JSONB,
  checklist_config JSONB
);

-- Symbols/Watchlist
CREATE TABLE symbols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.2 Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
-- ... etc for alle tabeller

-- Policy: Users can only access their own data
CREATE POLICY "Users can view own data" ON trades
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view own accounts" ON accounts
  FOR ALL USING (user_id = auth.uid());
```

---

## Fase 3: Clerk-Supabase Integrasjon

### 3.1 Webhook for User Sync

Opprett [app/api/webhooks/clerk/route.ts](app/api/webhooks/clerk/route.ts):

```typescript
import { Webhook } from 'svix'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  // Verify webhook signature
  // Sync user to Supabase on user.created event
}
```

### 3.2 JWT Token for Supabase

Opprett [lib/supabase/auth.ts](lib/supabase/auth.ts) som genererer Supabase-kompatible JWT fra Clerk session.

---

## Fase 4: API Routes

Sikre API-ruter med Clerk auth:

- [app/api/trades/route.ts](app/api/trades/route.ts) - CRUD for trades
- [app/api/accounts/route.ts](app/api/accounts/route.ts) - CRUD for accounts
- [app/api/daily-archives/route.ts](app/api/daily-archives/route.ts) - Daily prep/review
- [app/api/settings/route.ts](app/api/settings/route.ts) - User settings
- [app/api/sync/route.ts](app/api/sync/route.ts) - Initial data sync/migration

---

## Fase 5: React Components Migration

Konverter fra vanilla JS til React:

```
app/
├── (dashboard)/
│   ├── layout.tsx          # Dashboard layout med sidebar
│   ├── dashboard/page.tsx  # Oversikt
│   ├── trades/page.tsx     # Trade journal
│   ├── prep/page.tsx       # Daily prep
│   ├── checklist/page.tsx  # Trade checklist
│   ├── review/page.tsx     # Daily review
│   ├── playbook/page.tsx   # Setups
│   ├── analysis/page.tsx   # Statistics
│   └── settings/page.tsx   # Settings
components/
├── dashboard/
│   ├── sidebar.tsx
│   ├── trade-form.tsx
│   ├── trade-table.tsx
│   ├── account-card.tsx
│   └── stats-widget.tsx
├── ui/                     # Reusable UI components
hooks/
├── use-trades.ts          # SWR/React Query for trades
├── use-accounts.ts
└── use-settings.ts
```

---

## Fase 6: Data Migration Tool

Opprett [app/api/migrate/route.ts](app/api/migrate/route.ts) som:

1. Leser data fra localStorage (client-side)
2. Sender til API
3. Lagrer i Supabase
4. Bekrefter migrering

---

## Fase 7: Vercel Deploy

### 7.1 Vercel Environment Variables

Sett opp i Vercel Dashboard:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_WEBHOOK_SECRET`

### 7.2 Vercel Config

Oppdater [vercel.json](vercel.json) for edge functions og caching.

---

## Filstruktur etter migrering

```
my-app/
├── app/
│   ├── (auth)/             # Sign in/up pages
│   ├── (dashboard)/        # Protected dashboard
│   ├── api/
│   │   ├── trades/
│   │   ├── accounts/
│   │   ├── webhooks/
│   │   └── sync/
│   └── layout.tsx
├── components/
│   ├── dashboard/
│   └── ui/
├── hooks/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── types.ts
│   └── utils.ts
├── types/
│   └── database.ts         # Generated Supabase types
└── .env.local
```

---

## Estimert arbeid

- Fase 1-2 (Setup + Schema): 1-2 timer
- Fase 3 (Auth integrasjon): 1 time
- Fase 4 (API Routes): 2-3 timer
- Fase 5 (React migrering): 6-10 timer (størst jobb)
- Fase 6 (Data migration): 1 time
- Fase 7 (Deploy): 30 min

**Total: ~12-18 timer**

---

## Anbefalt rekkefølge

1. Start med Fase 1-3 for å få auth og database på plass
2. Lag API routes for trades og accounts først
3. Bygg en enkel React-versjon av trade journal
4. Iterer og legg til flere features
5. Kjør data migration fra localStorage
6. Deploy til Vercel