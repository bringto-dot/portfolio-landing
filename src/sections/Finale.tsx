import { motion } from "motion/react";
import { useRef } from "react";
import { Container, Section } from "../components/layout/Section";
import { Accented } from "../components/ui/Accented";
import { DISPLAY_LINE, Rise } from "../components/ui/Rise";
import { useI18n } from "../i18n";
import { EASE } from "../lib/anim";
import { useReducedMotion } from "../lib/useReducedMotion";
import { useStageSection } from "../stage/useStageSection";
import { FilingField } from "./finale/FilingField";

const SEEN = { once: true, amount: 0.4 } as const;

/**
 * The closing screen rhymes with the hero on purpose: the same measure, the
 * same type, the same hairline drawing itself under the same claim — and the
 * colours the other way round. The page opens on paper saying a product starts
 * with an idea and closes on ink saying it again, which is what makes it feel
 * finished rather than merely over.
 */
export function Finale() {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const still = useReducedMotion();

  useStageSection(ref, "#0a0a0b");

  return (
    <Section ref={ref} className="flex min-h-[100svh] flex-col pt-36 pb-10">
      <Container className="flex flex-1 items-center">
        <div className="w-full">
          <h2 className={DISPLAY_LINE}>
            <span className="block max-w-[23ch]">
              <Rise still={still} whenSeen duration={1}>
                <Accented text={t.finale.line} />
              </Rise>

              <motion.span
                aria-hidden
                className="mt-[0.24em] block h-px origin-left bg-[var(--stage-fg)]"
                initial={still ? undefined : { scaleX: 0 }}
                whileInView={still ? undefined : { scaleX: 1 }}
                viewport={SEEN}
                transition={{ duration: 1.2, delay: 0.55, ease: EASE.settle }}
              />
            </span>
          </h2>

          <motion.p
            className="mt-8 max-w-[40ch] text-[clamp(1rem,1.6vw,1.25rem)] text-[var(--stage-fg-2)]"
            initial={still ? undefined : { opacity: 0, y: 14 }}
            whileInView={still ? undefined : { opacity: 1, y: 0 }}
            viewport={SEEN}
            transition={{ duration: 0.9, delay: 0.7, ease: EASE.settle }}
          >
            {t.finale.sub}
          </motion.p>

          <motion.div
            className="mt-14 max-w-[46rem]"
            initial={still ? undefined : { opacity: 0 }}
            whileInView={still ? undefined : { opacity: 1 }}
            viewport={SEEN}
            transition={{ duration: 1.2, delay: 1, ease: EASE.settle }}
          >
            <FilingField className="block h-[92px] w-full" />
          </motion.div>
        </div>
      </Container>

      <Container className="mt-16">
        <div className="rule mb-6" />
        <div className="flex flex-wrap items-center justify-between gap-2 text-[0.8rem] text-[var(--stage-fg-3)]">
          <p>{t.finale.copyright}</p>
          <p>{t.finale.signature}</p>
        </div>
      </Container>
    </Section>
  );
}
