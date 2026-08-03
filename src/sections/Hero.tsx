import { motion } from "motion/react";
import { useRef } from "react";
import { Container, Section } from "../components/layout/Section";
import { Button } from "../components/ui/Button";
import { Accented } from "../components/ui/Accented";
import { DISPLAY_LINE, Rise } from "../components/ui/Rise";
import { useI18n } from "../i18n";
import { EASE } from "../lib/anim";
import { useReducedMotion } from "../lib/useReducedMotion";
import { useStageSection } from "../stage/useStageSection";

const WORD_STEP = 0.05;

export function Hero() {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const still = useReducedMotion();

  useStageSection(ref, "#ffffff");

  const words = t.hero.lineOne.split(" ");

  // The two halves of the sentence do not arrive the same way, because they do
  // not mean the same thing. The first assembles word by word — an idea coming
  // together. The second lands whole, a beat later: a finished thing is
  // delivered, not built in front of you. Then one hairline draws itself under
  // it, which is the sentence's own subject.
  const lineTwoDelay = words.length * WORD_STEP + 0.3;
  const ruleDelay = lineTwoDelay + 0.6;

  return (
    <Section
      id="top"
      ref={ref}
      className="flex min-h-[100svh] flex-col justify-center pt-32 pb-28"
    >
      <Container>
        <h1 className={DISPLAY_LINE}>
          {/* The claim sits at the margin; the consequence steps in from it.
              Two sentences, one of which follows from the other, so the layout
              says so rather than stacking them like a pair of equals.

              The measure is in `ch`, and `ch` is only meaningful on an element
              already set in the display face at the display size — put it on a
              wrapper running at 16px body text and it silently becomes a third
              of the intended width. */}
          <span className="block max-w-[23ch]">
            {words.map((word, index) => (
              <span key={`${word}-${index}`}>
                <Rise delay={index * WORD_STEP} still={still}>
                  <Accented text={word} />
                </Rise>
                {index < words.length - 1 ? " " : null}
              </span>
            ))}
          </span>

          <span className="mt-[0.22em] block md:pl-[12%] lg:pl-[16%]">
            <span className="block max-w-[23ch]">
              <Rise delay={lineTwoDelay} duration={1} still={still}>
                {t.hero.lineTwo}
              </Rise>

              {/* The rule lives inside the heading rather than under it, so it
                  inherits the same `ch` measure and ends exactly where the text
                  does. Outside, it would be measured in body text and run on
                  past the sentence it is supposed to close. */}
              <motion.span
                aria-hidden
                className="mt-[0.24em] block h-px origin-left bg-[var(--stage-fg)]"
                initial={still ? undefined : { scaleX: 0 }}
                animate={still ? undefined : { scaleX: 1 }}
                transition={{ duration: 1.1, delay: ruleDelay, ease: EASE.settle }}
              />
            </span>
          </span>
        </h1>

        <div className="md:pl-[12%] lg:pl-[16%]">
          <motion.div
            className="mt-10 flex flex-wrap items-center gap-3"
            initial={still ? undefined : { opacity: 0, y: 16 }}
            animate={still ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: lineTwoDelay + 0.35, ease: EASE.settle }}
          >
            <Button href="#projects">{t.hero.primary}</Button>
            <Button href="#contact" variant="ghost">
              {t.hero.secondary}
            </Button>
          </motion.div>
        </div>
      </Container>

      <motion.div
        className="absolute inset-x-0 bottom-7 md:bottom-10"
        initial={still ? undefined : { opacity: 0 }}
        animate={still ? undefined : { opacity: 1 }}
        transition={{ duration: 1, delay: ruleDelay + 0.2, ease: EASE.settle }}
      >
        <Container>
          <div className="flex items-end gap-3">
            {/* A hairline with a highlight that keeps travelling down it. The
                movement is the invitation; the words only name it. */}
            <span
              aria-hidden
              className="relative block h-9 w-px overflow-hidden"
              style={{ background: "var(--stage-line)" }}
            >
              {!still && (
                <motion.span
                  className="absolute inset-x-0 block h-3"
                  style={{
                    background: "linear-gradient(to bottom, transparent, var(--stage-fg))",
                  }}
                  animate={{ y: ["-120%", "320%"] }}
                  transition={{
                    duration: 2.4,
                    ease: EASE.settle,
                    repeat: Infinity,
                    repeatDelay: 0.9,
                  }}
                />
              )}
            </span>
            <p className="pb-0.5 text-[0.9rem] text-[var(--stage-fg-2)]">{t.hero.invite}</p>
          </div>
        </Container>
      </motion.div>
    </Section>
  );
}
