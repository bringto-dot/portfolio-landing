import { useRef } from "react";
import { Reveal } from "../components/layout/Reveal";
import { Container, Section } from "../components/layout/Section";
import { Accented } from "../components/ui/Accented";
import { useI18n } from "../i18n";
import { useStageSection } from "../stage/useStageSection";
import { PointField } from "./about/PointField";
import { Typed } from "./about/Typed";

export function About() {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);

  // The turn from paper to ink is not a background on this section — it is the
  // stage controller blending between what the hero asks for and what this
  // section asks for, across half a viewport of scrolling. The text colour,
  // the rules and the header all follow from the same value.
  useStageSection(ref, "#0a0a0b");

  return (
    <Section
      id="about"
      ref={ref}
      labelledBy="about-title"
      className="py-28 md:py-36 lg:py-44"
    >
      <Container>
        <div className="grid gap-14 lg:grid-cols-[1.04fr_1fr] lg:gap-20 xl:gap-28">
          <div>
            <Reveal>
              <h2
                id="about-title"
                className="font-display max-w-[14ch] text-[clamp(2rem,4.4vw,3.4rem)] font-extrabold"
              >
                <Accented text={t.about.title} />
              </h2>
            </Reveal>

            <Typed
              paragraphs={t.about.paragraphs}
              className="mt-10 max-w-[46ch] text-[1.02rem] leading-[1.72] text-[var(--stage-fg-2)] md:text-[1.08rem]"
            />
          </div>

          {/* Not pinned. A sticky column stops moving with the page while the
              paragraphs beside it keep going, which is the two halves coming
              apart — and it is what made the field look like it was lagging.
              They scroll together now, and the field takes its progress from
              the section rather than from its own box. */}
          <div className="lg:self-start">
            <PointField
              anchorRef={ref}
              className="block h-[clamp(300px,48vh,540px)] w-full"
            />
            <p className="mt-6 text-[0.82rem] tracking-[0.01em] text-[var(--stage-fg-3)]">
              {t.about.figure}
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
