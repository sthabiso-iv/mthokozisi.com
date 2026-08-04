import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default {
  ...defineCloudflareConfig(),
  // `npm run build` maps to `opennextjs-cloudflare build`, so the internal
  // Next.js build step must call the plain `next build` script (build:next)
  // — otherwise it would recurse into opennextjs-cloudflare build.
  buildCommand: "npm run build:next",
};
