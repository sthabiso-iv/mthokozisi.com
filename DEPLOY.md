# Deploying to Cloudflare Workers

This site is a Next.js 15 (App Router) app that runs on Cloudflare Workers via
[`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare). OpenNext adapts
the Next.js build into a Worker bundle plus static assets that Wrangler uploads.

## Prerequisites

- Node.js 20+
- A Cloudflare account
- `npx wrangler login` (authenticates the Wrangler CLI), or a
  `CLOUDFLARE_API_TOKEN` env var in CI

## Configuration

| File | Purpose |
| --- | --- |
| `wrangler.toml` | Worker name, entrypoint (`.open-next/worker.js`), assets binding, `nodejs_compat` |
| `open-next.config.ts` | OpenNext Cloudflare adapter config |
| `next.config.ts` | Next.js config + `initOpenNextCloudflareForDev()` for local bindings |

## Environment variables & secrets

The app reads these at runtime (see `.dev.vars.example`):

| Key | Used by | Required |
| --- | --- | --- |
| `RESEND_API_KEY` | `/api/contact` (email) | for the contact form |
| `EMAIL_FROM`, `EMAIL_FROM_NAME`, `EMAIL_TO` | `/api/contact` | have defaults |
| `REVALIDATE_SECRET` | `/api/revalidate` | for on-demand cache purge |
| `BLOG_API_TOKEN` | WordPress blog API | optional |

**Local dev:** copy `.dev.vars.example` to `.dev.vars` and fill in values.
`.dev.vars` is git-ignored and read by the local Workers runtime.

**Production:** set each as a Worker secret (do **not** commit them):

```bash
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put REVALIDATE_SECRET
# ...repeat for each key you need
```

Non-secret values (e.g. `EMAIL_FROM_NAME`) can alternatively go in a `[vars]`
block in `wrangler.toml`.

## Commands

```bash
npm run dev       # Next.js dev server (fast local iteration)
npm run build     # Build the Cloudflare Worker bundle (opennextjs-cloudflare build)
npm run build:next  # Plain `next build` (no Cloudflare bundle) — for lint/type checks
npm run preview   # Build with OpenNext + run the Worker locally (Workers runtime)
npm run deploy    # Build with OpenNext + deploy to Cloudflare Workers
npm run cf-typegen  # Regenerate cloudflare-env.d.ts from wrangler.toml
```

`npm run build` produces the Cloudflare Worker bundle in `.open-next/`
(it runs `next build` internally, then bundles the Worker + the compiled
OpenNext config that `wrangler deploy` needs). `npm run preview` is the
highest-fidelity local check — it runs the actual Worker bundle in `workerd`,
the same runtime as production.

## Deploy

```bash
npm run deploy
```

This runs `opennextjs-cloudflare build` (producing `.open-next/`) and then
`opennextjs-cloudflare deploy` (which invokes `wrangler deploy`).

### Custom domain

After the first deploy, map the domain in the Cloudflare dashboard under
**Workers & Pages → your Worker → Settings → Domains & Routes**, or add a
`route`/`[[routes]]` entry to `wrangler.toml`.

## CI (optional)

To deploy from CI, provide `CLOUDFLARE_API_TOKEN` (Workers deploy permissions)
and `CLOUDFLARE_ACCOUNT_ID` as environment variables, then run `npm run deploy`.
