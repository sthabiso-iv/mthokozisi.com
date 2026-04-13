import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import Stats from "@/components/Stats";
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
      <Skills />
      <Blog />
      <Contact />
    </main>
  );
}
