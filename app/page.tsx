// Revalidate the homepage every 5 minutes so the blog preview
// never shows content older than 5 minutes.
export const revalidate = 300;

import Hero from "@/components/Hero";
import About from "@/components/About";
import Stats from "@/components/Stats";
import Projects from "@/components/Projects";
import Experience from "@/components/Experience";
import Skills from "@/components/Skills";
import Blog from "@/components/Blog";
import Contact from "@/components/Contact";

// Nav and Footer are rendered by the root layout (app/layout.tsx)
export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <Stats />
      <Projects />
      <Experience />
      <Skills />
      <Blog />
      <Contact />
    </main>
  );
}
