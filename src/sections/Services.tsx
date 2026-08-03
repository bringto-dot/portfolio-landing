import { useRef } from "react";
import { Reveal } from "../components/layout/Reveal";
import { Container, Section } from "../components/layout/Section";
import { useI18n } from "../i18n";
import { stagger } from "../lib/anim";
import { useProximity } from "../lib/useProximity";
import { useStageSection } from "../stage/useStageSection";

function Column({
  title,
  items,
  size,
  delay,
}: {
  title: string;
  items: readonly string[];
  size: string;
  delay: number;
}) {
  return (
    <div>
      <Reveal delay={delay}>
        {/* Sentence case, not an uppercase kicker. These are the two lists'
            actual names — dressing them as small-caps labels would make them
            read as decoration above the content rather than part of it. */}
        <h3 className="text-[0.95rem] text-[var(--stage-fg-2)]">{title}</h3>
      </Reveal>
      <div className="rule mt-4" />

      <ul className="mt-7">
        {items.map((item, index) => (
          <Reveal as="li" key={item} delay={delay + stagger(index, 0.028, 0.34)}>
            <span
              data-near
              className={`font-display inline-block font-bold tracking-[-0.025em] ${size}`}
            >
              {item}
            </span>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}

export function Services() {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useStageSection(ref, "#ffffff");
  useProximity(listRef);

  return (
    <Section
      id="services"
      ref={ref}
      labelledBy="services-title"
      className="py-28 md:py-36 lg:py-44"
    >
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <Reveal>
            <h2
              id="services-title"
              className="font-display max-w-[13ch] text-[clamp(2rem,4.6vw,3.6rem)] font-extrabold"
            >
              {t.services.title}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-[38ch] text-[0.95rem] leading-[1.6] text-[var(--stage-fg-2)] lg:pb-2 lg:text-right">
              {t.services.lead}
            </p>
          </Reveal>
        </div>

        {/* Two columns of unequal weight. Fifteen things done constantly, set
            small and dense; seven bigger jobs, set large and open. Two lists at
            the same size in the same box would say they were the same kind of
            work, and they are not. */}
        <div
          ref={listRef}
          className="mt-16 grid gap-14 md:mt-20 lg:grid-cols-[1.15fr_1fr] lg:gap-20 xl:gap-28"
        >
          <Column
            title={t.services.primaryTitle}
            items={t.services.primary}
            size="text-[clamp(1.1rem,1.9vw,1.5rem)] py-[0.17em]"
            delay={0}
          />
          <div className="lg:pt-16">
            <Column
              title={t.services.secondaryTitle}
              items={t.services.secondary}
              size="text-[clamp(1.35rem,2.7vw,2.15rem)] py-[0.26em]"
              delay={0.08}
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}
