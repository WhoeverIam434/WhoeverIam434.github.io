import Contact from "@/components/Contact";
import Directory from "@/components/Directory";
import Education from "@/components/Education";
import Experience from "@/components/Experience";
import FocusSection from "@/components/FocusSection";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import SectionRail from "@/components/SectionRail";
import Skills from "@/components/Skills";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <FocusSection />
        <Experience />
        <Projects />
        <Skills />
        <Education />
        <Directory />
        <Contact />
      </main>
      <SectionRail />
    </>
  );
}
