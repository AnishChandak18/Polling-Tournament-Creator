/**
 * HTTP latency / throughput smoke test (autocannon).
 *
 * Usage (after `npm run build && npm start` in another terminal):
 *   npm run bench:api
 *
 * Authenticated API routes (e.g. GET /api/tournaments):
 *   BENCH_PATH=/api/tournaments BENCH_COOKIE="sb-xxx-auth-token=..." npm run bench:api
 *
 * Env: BASE_URL (default http://127.0.0.1:3000), BENCH_PATH, BENCH_COOKIE,
 *      BENCH_CONNECTIONS (default 10), BENCH_DURATION seconds (default 10)
 */
import autocannon from "autocannon";

const baseUrl = (process.env.BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const path = process.env.BENCH_PATH || "/";
const connections = Number(process.env.BENCH_CONNECTIONS || 10);
const duration = Number(process.env.BENCH_DURATION || 10);

const headers = {};
const cookie = process.env.BENCH_COOKIE;
if (cookie) {
  headers.cookie = cookie;
}

const fullPath = path.startsWith("/") ? path : `/${path}`;

const instance = autocannon(
  {
    url: `${baseUrl}${fullPath}`,
    connections,
    duration,
    headers,
  },
  (err, result) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log("\n--- autocannon summary ---");
    console.log(`target: ${baseUrl}${fullPath}`);
    console.log(`requests: ${result.requests.total}, throughput req/s: ${result.throughput.mean?.toFixed?.(1) ?? result.throughput.mean}`);
    console.log(`latency p50 / p95 / p99 (ms): ${result.latency.p50} / ${result.latency.p95} / ${result.latency.p99}`);
    console.log(`errors: ${result.errors}`);
  }
);

autocannon.track(instance, { renderProgressBar: true });
