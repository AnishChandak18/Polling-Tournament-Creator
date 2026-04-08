/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use the generated client from node_modules; bundling Prisma with Turbopack can serve a stale datamodel (e.g. missing Json fields like displayMeta).
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;
