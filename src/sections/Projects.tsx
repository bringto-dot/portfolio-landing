import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { Container, Section } from "../components/layout/Section";
import { Button } from "../components/ui/Button";
import { PROJECTS, repoUrl } from "../content/projects";
import { useI18n } from "../i18n";
import { EASE } from "../lib/anim";
import { useEasedColour } from "../lib/useEasedColour";
import { useMediaQuery } from "../lib/useMediaQuery";
import { useReducedMotion } from "../lib/useReducedMotion";
import { useStageSection } from "../stage/useStageSection";
import { ProjectCard } from "./projects/ProjectCard";

/** Horizontal travel that counts as a swipe rather than a press. */
const SWIPE = 60;

function Arrow({
  label,
  onClick,
  flip = false,
}: {
  label: string;
  onClick: () => void;
  flip?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-11 w-11 place-items-center rounded-full border border-[var(--stage-line)] transition-[background-color,border-color] duration-300 ease-[var(--ease-hover)] hover:border-[var(--stage-fg-3)] hover:bg-[color-mix(in_srgb,var(--stage-fg)_8%,transparent)] md:h-12 md:w-12"
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className={`h-4 w-4 ${flip ? "rotate-180" : ""}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </button>
  );
}

export function Projects() {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const still = useReducedMotion();

  const [view, setView] = useState({ index: 0, previous: -1, direction: 1 });
  const [flipped, setFlipped] = useState(false);
  const { index, previous, direction } = view;

  /**
   * Whether the card has a reverse.
   *
   * The card is a 16:10 box sized from the column it sits in, so on a phone it
   * is around 200px tall — and a description of 140 to 220 characters plus a
   * link does not go in there at a size anyone can read. Measured: the reverse
   * runs past the card's bottom edge on everything below about 540px, worst by
   * 184px at 360px wide, which is most of the card again. No amount of tighter
   * type closes a gap that size.
   *
   * So below the breakpoint the card keeps one face and what the reverse would
   * have said is said under it — in the room this section already had, since it
   * is a `100svh` block holding a card half that tall.
   */
  const flippable = useMediaQuery("(min-width: 40rem)");

  // Turning the phone, or dragging a desktop window narrow, takes the reverse
  // away from under a card that is currently showing it.
  useEffect(() => {
    if (!flippable) setFlipped(false);
  }, [flippable]);

  const project = PROJECTS[index];
  const copy = t.projects.items[project.slug];

  // The section publishes an eased colour rather than the raw one, so the page
  // takes about half a second to travel between two brand colours instead of
  // snapping. Timing belongs to whoever owns the change; the stage only asks.
  const colour = useEasedColour(project.stage);
  useStageSection(ref, colour);

  const go = useCallback((step: number) => {
    setFlipped(false);
    setView((current) => ({
      index: (current.index + step + PROJECTS.length) % PROJECTS.length,
      previous: current.index,
      direction: step > 0 ? 1 : -1,
    }));
  }, []);

  // Arrow keys drive the carousel, but only while it is the thing being looked
  // at — bound globally they would hijack every arrow press on the page.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

      const box = ref.current?.getBoundingClientRect();
      if (!box) return;
      const centre = window.innerHeight / 2;
      if (box.top > centre || box.bottom < centre) return;

      event.preventDefault();
      go(event.key === "ArrowRight" ? 1 : -1);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const swipe = useRef(0);
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    swipe.current = event.clientX;
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const travelled = event.clientX - swipe.current;
    if (Math.abs(travelled) >= SWIPE) go(travelled < 0 ? 1 : -1);
  };

  return (
    <Section
      id="projects"
      ref={ref}
      labelledBy="projects-title"
      // Less air below `sm`, where the description is a block on the page
      // rather than a face of the card: the section is carrying an extra
      // paragraph and a button there, and it still has to land on one screen.
      className="flex min-h-[100svh] flex-col justify-center py-16 sm:py-24 md:py-28"
    >
      <Container>
        <div className="flex items-baseline justify-between gap-6">
          <h2
            id="projects-title"
            className="font-display text-[1.05rem] font-bold tracking-[-0.02em]"
          >
            {t.projects.title}
          </h2>
          <p className="tnum text-[0.85rem] text-[var(--stage-fg-3)]">
            <span style={{ color: "var(--stage-fg)" }}>
              {String(index + 1).padStart(2, "0")}
            </span>{" "}
            / {String(PROJECTS.length).padStart(2, "0")}
          </p>
        </div>
        <div className="rule mt-3" />

        <div
          className="relative mx-auto mt-7 w-full md:mt-9"
          style={{
            // The card is sized from the height it has available rather than
            // the width, so a 16:10 shot, both rails and the header always fit
            // one screen without the page deciding to scroll a little. The
            // 340px is the rails around a card that carries its description on
            // its reverse; where the description sits below instead, the extra
            // block is paid for out of this section's padding rather than out
            // of the card.
            maxWidth: "min(980px, calc((100svh - 340px) * 1.6))",
            aspectRatio: "16 / 10",
          }}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          {PROJECTS.map((entry, position) => (
            <ProjectCard
              key={entry.slug}
              project={entry}
              copy={t.projects.items[entry.slug]}
              index={position}
              offset={
                position === index ? 0 : position === previous ? -direction : direction
              }
              flipped={flippable && position === index && flipped}
              onFlip={() => setFlipped((open) => !open)}
              labels={{ open: t.projects.open, back: t.projects.back }}
              still={still}
              priority={position === 0}
              flippable={flippable}
            />
          ))}
        </div>

        <div className="mt-7 flex items-end justify-between gap-6 md:mt-9">
          <div className="min-w-0">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={project.slug}
                initial={still ? undefined : { opacity: 0, y: 12 }}
                animate={still ? undefined : { opacity: 1, y: 0 }}
                exit={still ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: EASE.settle }}
              >
                {/* `truncate` sets `overflow: hidden`, and headings on this
                    site run at a line-height of 1.02 — which leaves a line box
                    barely as tall as the em square, so the tail of a «g» or a
                    «д» was being sliced off. The measure has to make room for
                    the descenders before it is allowed to clip anything. */}
                <h3 className="font-display truncate pb-[0.08em] text-[clamp(1.4rem,3.2vw,2.5rem)] leading-[1.22] font-extrabold">
                  {copy.title}
                </h3>
                <p className="mt-1 truncate text-[0.88rem] text-[var(--stage-fg-2)]">
                  {copy.kind}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <p className="mr-1 hidden text-[0.8rem] text-[var(--stage-fg-3)] lg:block">
              {t.projects.flipHint}
            </p>
            <Arrow label={t.projects.previous} onClick={() => go(-1)} flip />
            <Arrow label={t.projects.next} onClick={() => go(1)} />
          </div>
        </div>

        {/* The reverse, unfolded. Same two things it carried — what the project
            was, and where to read it — set as page text rather than as a face
            of the card, because at this width the card has no room for them.
            It changes with the carousel on the same beat the title does. */}
        {!flippable && (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={project.slug}
              className="mt-8"
              initial={still ? undefined : { opacity: 0, y: 12 }}
              animate={still ? undefined : { opacity: 1, y: 0 }}
              exit={still ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: EASE.settle }}
            >
              <p className="max-w-[46ch] text-[1.02rem] leading-[1.7] text-[var(--stage-fg-2)]">
                {copy.description}
              </p>
              <div className="mt-7">
                <Button href={repoUrl(project)} target="_blank" rel="noreferrer" arrow>
                  {t.projects.open}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* The carousel is a control, and a control that only says anything in
            pixels is invisible to anyone not looking at it. */}
        <p aria-live="polite" className="sr-only">
          {copy.title}. {t.projects.title} {index + 1} {t.projects.counterOf}{" "}
          {PROJECTS.length}.
        </p>
      </Container>
    </Section>
  );
}
