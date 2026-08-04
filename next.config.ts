import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Featured images from the WordPress blog subdomain
      { protocol: "https", hostname: "blog.mthokozisi.com" },
    ],
  },
};

export default nextConfig;

// Enable Cloudflare bindings and `getCloudflareContext()` during `next dev`.
// This is a no-op in production builds. See:
// https://opennext.js.org/cloudflare/get-started
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
