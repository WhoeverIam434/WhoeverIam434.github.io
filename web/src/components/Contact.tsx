import ButtonLink from "@/components/ButtonLink";
import Section from "@/components/Section";
import { profile } from "@/data/profile";

export default function Contact() {
  return (
    <Section
      id="contact"
      index="07"
      title="Contact"
      intro="If it moves, senses, or needs a control loop, I would like to hear about it."
    >
      <div className="border border-line bg-card px-5 py-8 md:px-10 md:py-12">
        <h3 className="max-w-2xl text-3xl leading-[1.08] md:text-5xl">
          Let&rsquo;s build something that moves.
        </h3>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft">
          Open to 2026 winter internships in embedded or robotics software. Happy
          to talk about firmware, control and robots.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <ButtonLink href={`mailto:${profile.email}`}>
            {profile.email}
          </ButtonLink>
          <ButtonLink href={profile.cv} download variant="secondary">
            Download CV
          </ButtonLink>
        </div>

        <dl className="mt-10 grid gap-6 border-t border-line pt-6 sm:grid-cols-3">
          <div>
            <dt className="mono-label">Email</dt>
            <dd className="mt-2">
              <a
                href={`mailto:${profile.email}`}
                className="font-mono text-sm underline-offset-4 hover:text-accent hover:underline"
              >
                {profile.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="mono-label">Phone</dt>
            <dd className="mt-2">
              <a
                href={`tel:${profile.phoneHref}`}
                className="font-mono text-sm underline-offset-4 hover:text-accent hover:underline"
              >
                {profile.phone}
              </a>
            </dd>
          </div>
          <div>
            <dt className="mono-label">Based in</dt>
            <dd className="mt-2 font-mono text-sm">
              {profile.location} 
            </dd>
          </div>
        </dl>
      </div>
    </Section>
  );
}

