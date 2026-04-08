# IPL Polling Tournament Creator

Next.js + Supabase app to create IPL tournaments, vote on daily matches, and view a leaderboard.

## Requirements

- Node.js 18+
- A Supabase project (Postgres + Auth)
- Google OAuth credentials (for Supabase Auth)

## Setup (local)

1. Install deps

```bash
npm install
```

2. Create `.env.local` from the template

```bash
cp .env.local.example .env.local
```

3. Create a Supabase project

- In Supabase: **Authentication → Providers → Google** → enable it and paste your Google Client ID/Secret.
- In Google Cloud Console: add **Authorized redirect URIs** pointing to Supabase’s callback URL (Supabase UI shows it).
- In Supabase: add redirect URLs for:
  - `http://localhost:3000/**`
  - LAN dev (e.g. `http://192.168.x.x:3000/**`) if you test from other devices
  - your production domain when you deploy

4. Fill env vars in `.env.local`

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL` (Supabase Postgres connection string)
- Optional IPL provider settings (`CRICAPI_*` or fallback base)

5. Run dev server

```bash
npm run dev
```

## What belongs in git vs local only

- **Committed:** application source, Prisma schema/migrations, `.env*.example` templates, config that has no secrets.
- **Never committed:** `.env`, `.env.local`, and other env files with real keys (see `.gitignore`). Copy from `.env.local.example` locally.

## Services Architecture

Use these folders to keep API/data code DRY:

- `src/services/api/*`
  - Client-side API callers (`fetch` wrappers for `/api/*`).
  - Use this in client components/pages.
  - Example: `createTournament`, `submitVote`, `getTournament`.

- `src/services/server/*`
  - Server-side data services for App Router pages.
  - Use this in server pages/components (`src/app/**/page.tsx`) to avoid repeating auth/prisma query patterns.
  - Example: `getAuthContext`, `listUserTournaments`.

- `src/services/server/api/*`
  - Business logic used by route handlers (`src/app/api/*`).
  - Route handlers should stay thin: parse request -> call service -> return response.
  - Shared error mapping lives in `errors.ts` (`HttpError`, `toErrorResponse`).

### Rule of thumb

- UI/client code should not call Prisma directly.
- Route files should not contain heavy business logic.
- Shared flows (auth checks, ownership checks, validation) should live in services.

## API Route Test Helpers

`src/services/server/api/testHelpers.ts` provides tiny helpers for route/service tests:

- `makeRouteContext(params)` -> creates `{ params: Promise.resolve(params) }`
- `makeJsonRequest(method, body, url?)` -> builds JSON `Request`
- `expectHttpError(fn, status)` -> asserts service rejects with `HttpError(status)`

These are framework-agnostic and work with any test runner you add later (Vitest/Jest).
