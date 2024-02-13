import withBundleAnalyzer from "@next/bundle-analyzer";
// import createJiti from "jiti";
import withPlugins from "next-compose-plugins";

import { env } from "./env.mjs";

// const jiti = createJiti(new URL(import.meta.url).pathname, {
//   esmResolve: true
// });

// // Import env here to validate during build. Using jiti we can import .ts files :)
// jiti("./env.mjs");

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = withPlugins([[withBundleAnalyzer({ enabled: env.ANALYZE })]], {
  reactStrictMode: true,
  experimental: { instrumentationHook: true },
  rewrites() {
    return [
      { source: "/healthz", destination: "/api/health" },
      { source: "/api/healthz", destination: "/api/health" },
      { source: "/health", destination: "/api/health" },
      { source: "/ping", destination: "/api/health" },
    ]
  },
})

export default nextConfig
