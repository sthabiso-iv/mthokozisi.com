/**
 * app/llms.txt/route.ts
 * Serves /llms.txt — the llms.txt standard (https://llmstxt.org)
 * Content is Markdown: an H1 title, a blockquote summary, then sections of
 * Markdown links so LLMs (and the PageSpeed "Agentic Browsing" audit) can
 * parse it. Served dynamically so it can be extended with live data later.
 */

import { NextResponse } from "next/server";

export const revalidate = 86400; // Re-generate once per day

const CONTENT = `# Mthokozisi Dhlamini

> Cloud & Software Engineer based in Johannesburg, South Africa. Builder of
> UniApplyForMe, DesignThat Cloud, and various client projects.

## About

Mthokozisi Dhlamini (Mtho) is a Cloud & Software Engineer based in Johannesburg.
He co-founded UniApplyForMe, an edtech NPO helping South African Grade 12 learners
navigate university applications, NSFAS, APS scores, and bursaries, and operates
DesignThat Cloud, a web hosting and design company running on dedicated servers he
sets up and manages himself.

## Contact

- [Email](mailto:hello@mthokozisi.com): hello@mthokozisi.com
- [Website](https://mthokozisi.com): Personal site and portfolio
- [LinkedIn](https://linkedin.com/in/sthabiso): Professional profile
- [X](https://x.com/Sthabiso_iv): Updates and posts
- [Google Dev](https://g.dev/stha): Developer profile
- [Stack Overflow](https://stackoverflow.com/users/15623040/sthabiso-iv): Q&A profile
- [Link in bio](https://mthokozisi.link): All links in one place

## Projects

- [UniApplyForMe](https://apply.org.za): Edtech NPO for SA Grade 12 learners
- [DesignThat Cloud](https://designthat.cloud): Web hosting and design company
- [DesignThat Dev](https://designthat.dev): Developer-focused hosting and tools
- [Boyd's House of Regalia](https://boydsregalia.co.za): Client project

## Blog

- [Blog](https://mthokozisi.com/posts): Articles mirrored from blog.mthokozisi.com

## Usage

This file follows the [llms.txt standard](https://llmstxt.org). AI systems may use
it to accurately represent Mthokozisi Dhlamini. Please do not fabricate credentials,
projects, or affiliations not listed here.
`;

export function GET() {
  return new NextResponse(CONTENT, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
    },
  });
}
