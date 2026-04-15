# Performance benchmarks

Use this doc to record **comparable** baselines (same machine or staging URL, same Node version).

## Bundle size (Next.js)

```bash
npm run analyze
```

Opens interactive treemaps for client and server bundles after `next build`. Record the largest route chunks when investigating regressions.

**Baseline (fill in after a local run):**

| Date | Route / chunk | Approx size |
|------|----------------|------------|
|      |                |            |

## Core Web Vitals (Lighthouse)

1. Production-like server: `npm run build && npm start`
2. Chrome DevTools → Lighthouse → Mobile (and optionally Desktop)
3. Test at least: `/`, `/dashboard`, one `/tournaments/[id]` URL

**Baseline:**

| Date | URL | LCP | INP | CLS |
|------|-----|-----|-----|-----|
|      |     |     |     |     |

Optional CI: add `@lhci/cli` and budgets in a workflow when you are ready to gate merges on metrics.

## API latency / throughput

**Autocannon (no extra install beyond `npm install`):**

```bash
# Public page (default)
npm run bench:api

# Authenticated GET example — copy `Cookie` from DevTools → Application → your Supabase session
BASE_URL=http://127.0.0.1:3000 BENCH_PATH=/api/tournaments BENCH_COOKIE='paste-here' npm run bench:api
```

**k6 (install [k6](https://k6.io/) separately):**

```bash
BASE_URL=http://127.0.0.1:3000 k6 run scripts/bench/k6-api.js
K6_COOKIE='your-cookie' k6 run scripts/bench/k6-api.js
```

**Baseline (autocannon):**

| Date | Path | Connections | Duration s | p95 ms | req/s |
|------|------|-------------|------------|--------|-------|
|      |      |             |            |        |       |

## Database

For slow Prisma queries, enable short-term query logging in staging or run `EXPLAIN ANALYZE` on hot SQL via Prisma Studio / `psql`.
