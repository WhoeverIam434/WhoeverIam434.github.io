import Section from "@/components/Section";
import { featuredProject, otherProjects } from "@/data/profile";

export default function Projects() {
  return (
    <Section
      id="projects"
      index="03"
      title="Projects"
      intro="One robot built for a competition, plus the two things I keep getting asked about."
    >
      <article className="border border-line bg-card px-5 py-7 md:px-9 md:py-10">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h3 className="text-3xl md:text-4xl">{featuredProject.name}</h3>
          <span className="mono-label">{featuredProject.meta}</span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {featuredProject.subtitle}
        </p>

        <ul className="mt-8 grid gap-x-12 gap-y-3.5 md:grid-flow-col md:grid-rows-3">
          {featuredProject.bullets.map((bullet, index) => (
            <li key={bullet} className="flex gap-4">
              <span className="mono-label mt-1 shrink-0 text-accent">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-sm leading-relaxed text-ink-soft">
                {bullet}
              </span>
            </li>
          ))}
        </ul>

        <ul className="mt-8 flex flex-wrap gap-2">
          {featuredProject.tags.map((tag) => (
            <li
              key={tag}
              className="border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-muted"
            >
              {tag}
            </li>
          ))}
        </ul>
      </article>

      <div className="mt-6 grid gap-px bg-line md:grid-cols-2">
        {otherProjects.map((project) => (
          <article
            key={project.name}
            className="bg-card px-5 py-7 md:px-7 md:py-8"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-xl">{project.name}</h3>
              <span className="mono-label">{project.meta}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              {project.description}
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <li
                  key={tag}
                  className="border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-muted"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </Section>
  );
}
