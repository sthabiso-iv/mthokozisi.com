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
