/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use the generated client from node_modules; bundling Prisma with Turbopack can serve a stale datamodel (e.g. missing Json fields like displayMeta).
  serverExternalPackages: ["@prisma/client", "prisma"],
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  /** Longer client router cache for dynamic routes = snappier back/forward & revisits (data still refreshes on hard reload). */
  experimental: {
    /** Client router keeps RSC payloads longer → fewer full server round-trips when revisiting. */
    staleTimes: {
      dynamic: 300,
      static: 600,
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
