// ============================================================
// data/portfolio.ts
// Single source of truth for all portfolio content.
// Update this file to change content without touching components.
// ============================================================

// ── Meta ─────────────────────────────────────────────────────
export const meta = {
  name: "Mthokozisi Dhlamini",
  nickname: "Mtho",
  title: "Cloud & Software Engineer",
  location: "Johannesburg, South Africa",
  description:
    "Cloud & Software Engineer based in Johannesburg. I build mobile apps at The Delta, run UniApplyForMe (an edtech NPO for SA Grade 12s), and operate DesignThat Cloud, a web hosting and design company.",
  siteUrl: "https://mthokozisi.com",
  ogImage: "/og-image.png", // Replace with real OG image path
} as const;

// ── Hero ──────────────────────────────────────────────────────
export const hero = {
  headline: "Mthokozisi Dhlamini",
  subtitle: "Cloud & Software Engineer · Johannesburg, South Africa",
  tagline: "I build things that actually work for real people. I've been doing it since before it was my job.",
  cta: {
    primary: { label: "See my work", href: "#projects" },
    secondary: { label: "Get in touch", href: "#contact" },
  },
} as const;

// ── About ─────────────────────────────────────────────────────
export const about = {
  bio: [
    "I'm Mthokozisi. Mtho for short. Builder by nature, engineer by training. I've been making things for the web and beyond since long before anyone was paying me for it.",
    "Right now I'm building mobile apps at The Delta by day, running UniApplyForMe in the evenings (it's an edtech NPO I co-founded to help SA Grade 12 learners navigate university applications, NSFAS, APS scores, and bursaries), and operating DesignThat Cloud, a web hosting and design company that runs on dedicated servers I set up and manage myself.",
    "I'm currently studying BSc Computer Science at UNISA (2026-present). Formalising what I've already been doing.",
    "I do my best work alone at 2am, lo-fi on, Sprite in hand.",
  ],
  languages: [
    "English",
    "Zulu",
    "Afrikaans",
    "Xhosa",
    "Swati",
    "Sotho",
    "Tswana",
  ],
  education: {
    degree: "BSc Computer Science",
    institution: "UNISA",
    period: "2026-present",
  },
  quote: {
    text: "Technology is most powerful when it brings people together.",
    author: "Matt Mullenweg",
  },
  // CV file should be placed at /public/cv/mthokozisi-dhlamini-cv.pdf
  cvPath: "/cv/mthokozisi-dhlamini-cv.pdf",
} as const;

// ── Projects ──────────────────────────────────────────────────
export interface Project {
  name: string;
  url: string;
  description: string;
  tags: string[];
  highlight?: string; // Optional stat or callout
}

export const projects: Project[] = [
  {
    name: "UniApplyForMe",
    url: "https://apply.org.za",
    description:
      "EdTech NPO I co-founded to help South African Grade 12 learners with university applications, NSFAS, APS scores, and bursaries. I built the brand, website, mobile app, and full infrastructure from scratch.",
    tags: ["Flutter", "Android", "Next.js", "WordPress", "SEO", "AdSense", "Firebase"],
    highlight: "R100K+ AdSense revenue since Sept 2024",
  },
  {
    name: "DesignThat Cloud",
    url: "https://designthat.cloud",
    description:
      "Web hosting and design company I run personally. Runs on dedicated servers I set up and manage. Bare-metal, not a reseller panel.",
    tags: ["Linux", "cPanel", "DNS", "Web Hosting", "Infrastructure"],
  },
  {
    name: "DesignThat Dev",
    url: "https://designthat.dev",
    description:
      "The design and development arm of DesignThat. Client sites, custom builds, and anything that needs to look good and work properly.",
    tags: ["WordPress", "Elementor", "WooCommerce", "UI/UX"],
  },
  {
    name: "Lithemba Funeral Cover",
    url: "#",
    description:
      "Full website and CMS for a funeral cover provider. Built from scratch and maintained since founding. Focused on accessibility and conversion.",
    tags: ["WordPress", "CMS", "Web Design"],
  },
  {
    name: "Boyd's House of Regalia",
    url: "https://boydsregalia.co.za",
    description:
      "WooCommerce-powered e-commerce site with full payment gateway integrations. Every product, variant, and transaction flow set up properly.",
    tags: ["WooCommerce", "WordPress", "PayFast", "Ozow", "Payment Gateways"],
  },
  {
    name: "PUBG Mad Libs",
    url: "https://pubg-madlibs.vercel.app",
    description:
      "A PUBG-themed Mad Libs game built for Re:Coded. Pure HTML, CSS, and JavaScript. No frameworks, no shortcuts. Sometimes the constraints are the point.",
    tags: ["HTML", "CSS", "JavaScript", "Re:Coded"],
  },
];

// ── Skills ────────────────────────────────────────────────────
export interface SkillGroup {
  label: string;
  skills: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    label: "Languages & Frameworks",
    skills: ["TypeScript", "JavaScript", "Dart", "Python", "PHP", "HTML/CSS", "Next.js", "React", "Flutter"],
  },
  {
    label: "Cloud & Infrastructure",
    skills: ["Linux", "cPanel", "WHM", "DNS Management", "Dedicated Servers", "Cloudflare", "Vercel", "Firebase"],
  },
  {
    label: "Automation & AI",
    skills: ["Claude API", "OpenAI API", "Chatbot Flows", "n8n", "Zapier", "Google Apps Script"],
  },
  {
    label: "WordPress Ecosystem",
    skills: ["WordPress", "WooCommerce", "Elementor", "ACF", "REST API", "Custom Themes", "Plugin Dev"],
  },
  {
    label: "SEO & Analytics",
    skills: ["Google Search Console", "Google Analytics", "AdSense", "Semrush", "Ahrefs", "Core Web Vitals"],
  },
  {
    label: "Design",
    skills: ["Figma", "Canva Pro", "Brand Identity", "UI/UX", "Responsive Design"],
  },
  {
    label: "Payment Gateways",
    skills: ["PayFast", "Ozow", "Peach Payments", "Stripe", "WooCommerce Payments"],
  },
  {
    label: "Developer Tools",
    skills: ["Git", "GitHub", "VS Code", "Postman", "Docker (basics)", "npm/yarn"],
  },
];

// ── Stats ─────────────────────────────────────────────────────
export interface Stat {
  value: string;
  label: string;
  sub?: string;
}

export const stats: Stat[] = [
  { value: "5+", label: "Years running UniApplyForMe", sub: "2020 - present" },
  { value: "R100K+", label: "AdSense revenue generated", sub: "since Sept 2024" },
  { value: "7", label: "South African languages spoken", sub: "fluently" },
  { value: "2am", label: "Peak performance window", sub: "lo-fi on, Sprite in hand" },
];

// ── Contact ───────────────────────────────────────────────────
export const contact = {
  email: "hello@mthokozisi.com",
  tagline: "Let's build something. Reach out and I'll get back to you.",
  links: [
    { label: "LinkedIn", href: "https://linkedin.com/in/sthabiso", display: "linkedin.com/in/sthabiso" },
    { label: "X / Twitter", href: "https://x.com/Sthabiso_iv", display: "@Sthabiso_iv" },
    { label: "g.dev/stha", href: "https://g.dev/stha", display: "g.dev/stha" },
    { label: "Stack Overflow", href: "https://stackoverflow.com/users/15623040/sthabiso-iv", display: "Stack Overflow" },
    // mthokozisi.link is a link-in-bio / Gravatar hub — all links in one place
    { label: "Link in bio", href: "https://mthokozisi.link", display: "mthokozisi.link" },
  ],
} as const;

// ── Nav ───────────────────────────────────────────────────────
export const navLinks = [
  { label: "About", href: "#about" },
  { label: "Work", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Writing", href: "#blog" },
  { label: "Contact", href: "#contact" },
] as const;
