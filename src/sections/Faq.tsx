import { AnimatePresence, motion } from "motion/react";
import { useId, useRef, useState } from "react";
import { Reveal } from "../components/layout/Reveal";
import { Container, Section } from "../components/layout/Section";
import { useI18n } from "../i18n";
import { EASE } from "../lib/anim";
import { useReducedMotion } from "../lib/useReducedMotion";
import { useStageSection } from "../stage/useStageSection";

function Row({
  question,
  answer,
  open,
  onToggle,
  still,
}: {
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
  still: boolean;
}) {
  const id = useId();

  return (
    <li className="faq-row group">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={id}
          className="flex w-full items-baseline gap-6 py-6 text-left transition-[color,transform] duration-500 ease-[var(--ease-hover)] group-hover:translate-x-1 md:py-7"
          style={{ color: open ? "var(--stage-fg)" : "var(--stage-fg-2)" }}
        >
          <span className="font-display text-[clamp(1.05rem,1.9vw,1.4rem)] font-bold tracking-[-0.025em]">
            {question}
          </span>
        </button>
      </h3>

      <div className="relative h-px w-full" style={{ background: "var(--stage-line)" }}>
        <span
          aria-hidden
          className="faq-draw absolute inset-0 origin-left"
          style={
            {
              background: "var(--stage-fg)",
              "--draw": open ? 1 : 0,
            } as React.CSSProperties
          }
        />
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            role="region"
            className="overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: still ? 0 : 0.6, ease: EASE.panel },
              opacity: { duration: still ? 0 : 0.4, ease: EASE.settle, delay: open ? 0.1 : 0 },
            }}
          >
            <p className="max-w-[62ch] py-7 text-[clamp(0.95rem,1.2vw,1.05rem)] leading-[1.68] text-[var(--stage-fg-2)]">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

export function Faq() {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const still = useReducedMotion();
  const [open, setOpen] = useState<number | null>(null);

  useStageSection(ref, "#ffffff");

  return (
    <Section
      id="faq"
      ref={ref}
      labelledBy="faq-title"
      className="py-28 md:py-36 lg:py-44"
    >
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.4fr] lg:gap-20">
          <Reveal>
            <h2
              id="faq-title"
              className="font-display max-w-[12ch] text-[clamp(2rem,4.2vw,3.2rem)] font-extrabold lg:sticky lg:top-32"
            >
              {t.faq.title}
            </h2>
          </Reveal>

          <div>
            <div className="rule" />
            <ul>
              {t.faq.items.map((item, index) => (
                <Row
                  key={item.question}
                  question={item.question}
                  answer={item.answer}
                  open={open === index}
                  // One at a time: opening a question closes whichever was open.
                  onToggle={() => setOpen((current) => (current === index ? null : index))}
                  still={still}
                />
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}
