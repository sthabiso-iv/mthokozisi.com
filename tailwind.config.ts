import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary palette
        yellow: {
          DEFAULT: "#f5c518",
          hover: "#ffd700",
          muted: "#f5c51833",
        },
        dark: {
          DEFAULT: "#0d0d0d",
          100: "#111111",
          200: "#161616",
          300: "#1c1c1c",
          400: "#242424",
          500: "#2e2e2e",
        },
        // Text
        "text-primary": "#f0f0f0",
        "text-secondary": "#a0a0a0",
        "text-muted": "#606060",
      },
      fontFamily: {
        heading: ["var(--font-rajdhani)", "Barlow Condensed", "sans-serif"],
        body: ["var(--font-inter)", "DM Sans", "sans-serif"],
      },
      letterSpacing: {
        tactical: "0.15em",
        wide: "0.08em",
      },
      backgroundImage: {
        "tactical-grid": `
          linear-gradient(rgba(245, 197, 24, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(245, 197, 24, 0.03) 1px, transparent 1px)
        `,
      },
      backgroundSize: {
        grid: "60px 60px",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
