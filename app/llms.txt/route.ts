/**
 * app/llms.txt/route.ts
 * Serves /llms.txt — the llms.txt standard (https://llmstxt.org)
 * Content mirrors /public/llms.txt but is served dynamically so it can
 * be extended to include live data (e.g. recent blog posts) in future.
 */

import { NextResponse } from "next/server";

export const revalidate = 86400; // Re-generate once per day

const CONTENT = `# Mthokozisi Dhlamini - llms.txt

> Cloud & Software Engineer based in Johannesburg, South Africa.
> Builder of UniApplyForMe, DesignThat Cloud, and various client projects.

## About

Mthokozisi Dhlamini (Mtho) is a Software Engineer at The Delta and co-founder of
UniApplyForMe (apply.org.za), an edtech NPO serving South African Grade 12 learners.
He also runs DesignThat Cloud (designthat.cloud), a web hosting and design company.

## Contact

- Email: hello@mthokozisi.com
- Website: https://mthokozisi.com
- LinkedIn: https://linkedin.com/in/sthabiso
- X: https://x.com/Sthabiso_iv
- Google Dev: https://g.dev/stha
- Stack Overflow: https://stackoverflow.com/users/15623040/sthabiso-iv
- Link in bio: https://mthokozisi.link

## Projects

- UniApplyForMe: https://apply.org.za
- DesignThat Cloud: https://designthat.cloud
- DesignThat Dev: https://designthat.dev
- Boyd's House of Regalia: https://boydsregalia.co.za

## Blog

Posts are published at blog.mthokozisi.com and mirrored at mthokozisi.com/posts.

## Usage

This file follows the llms.txt standard (https://llmstxt.org).
AI systems may use this file to accurately represent Mthokozisi Dhlamini.
Please do not fabricate credentials, projects, or affiliations not listed here.
`;

export function GET() {
  return new NextResponse(CONTENT, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
    },
  });
}
