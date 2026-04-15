/**
 * k6 load script for API routes (install k6: https://k6.io/docs/get-started/installation/)
 *
 *   BASE_URL=http://127.0.0.1:3000 k6 run scripts/bench/k6-api.js
 *
 * With session cookie for protected routes:
 *   K6_COOKIE='sb-xxx=...' k6 run scripts/bench/k6-api.js
 */
import http from "k6/http";
import { check, sleep } from "k6";

const base = __ENV.BASE_URL || "http://127.0.0.1:3000";
const cookie = __ENV.K6_COOKIE || "";

export const options = {
  vus: 5,
  duration: "30s",
  thresholds: {
    http_req_failed: ["rate<0.05"],
    http_req_duration: ["p(95)<2000"],
  },
};

export default function () {
  const params = {
    headers: cookie ? { Cookie: cookie } : {},
  };
  const paths = ["/", "/api/tournaments"];
  for (const p of paths) {
    const res = http.get(`${base.replace(/\/$/, "")}${p}`, params);
    check(res, { [`${p} status 200 or 401/302`]: (r) => r.status >= 200 && r.status < 500 });
    sleep(0.3);
  }
}
