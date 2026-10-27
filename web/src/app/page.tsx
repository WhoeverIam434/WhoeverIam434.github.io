import Contact from "@/components/Contact";
import Education from "@/components/Education";
import Experience from "@/components/Experience";
import Focus from "@/components/Focus";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import SiteNav from "@/components/SiteNav";
import Skills from "@/components/Skills";

export default function Home() {
  return (
    <>
      <SiteNav />
      <main>
        <Hero />
        <Focus />
        <Experience />
        <Projects />
        <Skills />
        <Education />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
