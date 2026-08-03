import { useEffect, useMemo, useRef } from "react";
import { Accented } from "../../components/ui/Accented";
import { useReducedMotion } from "../../lib/useReducedMotion";

/** Seconds between one word starting to appear and the next. */
const STEP = 0.032;

/** Extra pause once a sentence has landed, so the text arrives in phrases. */
const SENTENCE = 0.26;
const CLAUSE = 0.1;

/**
 * Text that arrives a word at a time, each one fading up into place.
 *
 * The schedule is computed once, at render, and written into every word as a
 * `transition-delay`; the container then flips a single class and the browser
 * runs the whole cascade on the compositor. Nothing is timed in JavaScript.
 *
 * That is the point. The previous version advanced a counter in a rAF loop and
 * scattered each interval to look human, and the result read as ragged rather
 * than as writing — every dropped frame showed, and the randomness stopped
 * being lifelike and started being uneven. Long overlapping fades on a fixed
 * grid look far more like a hand than jitter does.
 *
 * Every word is in the DOM from the first frame and only opacity and a 4px
 * offset move, so nothing reflows and a screen reader has the whole text at
 * once.
 */
export function Typed({
  paragraphs,
  className = "",
}: {
  paragraphs: readonly string[];
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const still = useReducedMotion();

  // One cumulative schedule across all three paragraphs, so the pauses between
  // sentences carry over the paragraph breaks instead of resetting.
  const schedule = useMemo(() => {
    let clock = 0;
    return paragraphs.map((paragraph) =>
      paragraph.split(" ").map((word) => {
        const delay = clock;
        clock += STEP;
        if (/[.!?]["»)]?$/.test(word)) clock += SENTENCE;
        else if (/[,;:—–]$/.test(word)) clock += CLAUSE;
        return { word, delay };
      }),
    );
  }, [paragraphs]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (still) {
      container.classList.add("is-writing");
      return;
    }

    // Starts when the block is genuinely being looked at, not when it grazes
    // the bottom of the screen — otherwise it has finished before it arrives.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        container.classList.add("is-writing");
      },
      { threshold: 0.25 },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [still]);

  return (
    <div ref={containerRef} className={`typed ${className}`}>
      {schedule.map((words, index) => (
        <p key={index} className={index > 0 ? "mt-6" : undefined}>
          {words.map(({ word, delay }, position) => (
            <span
              key={position}
              className="type-word"
              style={{ transitionDelay: `${delay.toFixed(3)}s` }}
            >
              <Accented text={word} />{" "}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}
