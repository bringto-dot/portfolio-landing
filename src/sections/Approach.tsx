import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useCallback, useRef } from "react";
import { Container, Section } from "../components/layout/Section";
import { useI18n } from "../i18n";
import { clamp01, smoothstep } from "../lib/anim";
import { mixRgb, parseHex, toHex } from "../lib/color";
import { useMediaQuery } from "../lib/useMediaQuery";
import { useReducedMotion } from "../lib/useReducedMotion";
import { useStageSection } from "../stage/useStageSection";

/**
 * Deep, not saturated. A full-strength red behind body text is an alarm; these
 * two are the colours of the *feeling* of a problem and of a problem solved.
 */
const RED = "#3a0d10";
const BLUE = "#0b1a3a";
const RED_RGB = parseHex(RED);
const BLUE_RGB = parseHex(BLUE);

/** The slice of the section's travel over which the colour turns. */
const TURN_FROM = 0.22;
const TURN_TO = 0.78;

const remap = (value: number, from: number, to: number) =>
  clamp01((value - from) / (to - from));

function Mark({ tone, scale }: { tone: "red" | "blue"; scale: MotionValue<number> }) {
  return tone === "red" ? (
    // A dash: the thing struck through, retracting to nothing as the block
    // goes. Two pixels rather than one — a 1px rule whose box lands on a half
    // pixel is drawn across two rows at half strength each, so half the dashes
    // came out pink and half came out red for no reason a reader could see.
    <motion.span
      aria-hidden
      className="mt-[0.7em] block h-[2px] w-[19px] shrink-0 origin-left"
      style={{ background: "var(--color-signal-red)", scaleX: scale }}
    />
  ) : (
    // A dot: the same mark, resolved to a point, opening as the block arrives.
    <motion.span
      aria-hidden
      className="mt-[0.6em] block h-[5px] w-[5px] shrink-0 rounded-full"
      style={{ background: "var(--color-signal-blue)", scale }}
    />
  );
}

function Block({
  title,
  items,
  tone,
  markScale,
}: {
  title: string;
  items: readonly string[];
  tone: "red" | "blue";
  markScale: MotionValue<number>;
}) {
  return (
    <>
      <h3 className="font-display text-[clamp(1.5rem,3.2vw,2.5rem)] font-extrabold">
        {title}
      </h3>
      <ul className="mt-8 space-y-4 md:mt-10 md:space-y-5">
        {items.map((item) => (
          <li key={item} className="flex gap-4">
            <Mark tone={tone} scale={markScale} />
            {/* Full foreground, not the secondary tier: these ten lines are
                the content of the section, not a caption under something
                else. */}
            <span className="text-[clamp(0.95rem,1.35vw,1.15rem)] leading-[1.55]">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

/**
 * Two ways of working, told as a movement rather than as a table.
 *
 * The page holds still while the reader scrolls: attention travels from the
 * top left to the bottom right, the marks beside each line go from struck-out
 * dashes to open dots, and the background drifts from a deep red to a deep
 * navy. Nothing here criticises anyone. The composition carries the argument
 * and the words only fill it in — which is why the two lists are set quietly
 * and the movement is not.
 */
export function Approach() {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const still = useReducedMotion();

  // The choreography needs the two blocks to occupy opposite corners of one
  // held screen, which needs absolute positioning, which needs the width to
  // put them side by side. On a phone they are in normal flow, so a crossfade
  // between them is two half-transparent blocks sitting on top of each other
  // rather than attention moving across a room. Below `lg` the section becomes
  // an ordinary comparison — and the colour still travels red to navy, which
  // is the half of the idea that survives at any width.
  const wide = useMediaQuery("(min-width: 1024px)");

  // The stage reads this every frame, so it derives its own progress from the
  // section's box rather than from a motion value it cannot see.
  const colour = useCallback(() => {
    const box = ref.current?.getBoundingClientRect();
    if (!box) return RED;

    const travel = box.height - window.innerHeight;
    const progress = clamp01(-box.top / (travel || 1));
    return toHex(mixRgb(RED_RGB, BLUE_RGB, smoothstep(remap(progress, TURN_FROM, TURN_TO))));
  }, []);

  useStageSection(ref, colour);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const negativeOpacity = useTransform(scrollYProgress, [0, 0.08, 0.38, 0.54], [0, 1, 1, 0]);
  const negativeY = useTransform(scrollYProgress, [0, 0.54], [40, -80]);
  const negativeX = useTransform(scrollYProgress, [0.3, 0.54], [0, -70]);
  const negativeMark = useTransform(scrollYProgress, [0.3, 0.5], [1, 0]);

  const positiveOpacity = useTransform(scrollYProgress, [0.44, 0.62], [0, 1]);
  const positiveY = useTransform(scrollYProgress, [0.42, 0.8], [90, 0]);
  const positiveMark = useTransform(scrollYProgress, [0.5, 0.72], [0, 1]);

  // One hairline crossing the screen from left to right over the whole
  // section. It is the shift of attention the section is built on, made into a
  // thing you can see — and it gives the empty three quarters of the screen a
  // reason to be empty.
  const dividerX = useTransform(scrollYProgress, [0, 1], ["14%", "84%"]);
  const dividerOpacity = useTransform(scrollYProgress, [0, 0.12, 0.88, 1], [0, 1, 1, 0]);

  const staticMark = useTransform(scrollYProgress, [0, 1], [1, 1]);

  if (still || !wide) {
    return (
      <Section ref={ref} labelledBy="approach-title" className="py-28 md:py-36">
        <Container>
          <h2 id="approach-title" className="sr-only">
            {t.approach.title}
          </h2>
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
            <div>
              <Block
                title={t.approach.negativeTitle}
                items={t.approach.negative}
                tone="red"
                markScale={staticMark}
              />
            </div>
            <div>
              <Block
                title={t.approach.positiveTitle}
                items={t.approach.positive}
                tone="blue"
                markScale={staticMark}
              />
            </div>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section ref={ref} labelledBy="approach-title" className="h-[300svh]">
      <h2 id="approach-title" className="sr-only">
        {t.approach.title}
      </h2>

      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <motion.span
          aria-hidden
          className="absolute inset-y-[14vh] hidden w-px lg:block"
          style={{
            left: dividerX,
            opacity: dividerOpacity,
            background: "var(--stage-line)",
          }}
        />

        <Container className="relative flex h-full flex-col justify-center">
          <motion.div
            className="max-w-[30ch] pt-[6vh] md:max-w-[34ch] lg:absolute lg:top-[21vh] lg:left-[var(--gutter)] lg:pt-0"
            style={{ opacity: negativeOpacity, y: negativeY, x: negativeX }}
          >
            <Block
              title={t.approach.negativeTitle}
              items={t.approach.negative}
              tone="red"
              markScale={negativeMark}
            />
          </motion.div>

          <motion.div
            className="mt-14 max-w-[30ch] md:max-w-[34ch] lg:absolute lg:right-[var(--gutter)] lg:bottom-[13vh] lg:mt-0"
            style={{ opacity: positiveOpacity, y: positiveY }}
          >
            <Block
              title={t.approach.positiveTitle}
              items={t.approach.positive}
              tone="blue"
              markScale={positiveMark}
            />
          </motion.div>
        </Container>
      </div>
    </Section>
  );
}
