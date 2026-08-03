import { useEffect, useRef } from "react";
import { useReducedMotion } from "../../lib/useReducedMotion";

/**
 * Pace, in milliseconds. A full sentence gets a breath after it and a clause
 * gets half of one, which is the difference between text being written and
 * text being metered out by a machine.
 */
const STEP = 34;
const CLAUSE = 130;
const SENTENCE = 270;

const delayAfter = (word: string) => {
  if (/[.!?]["»)]?$/.test(word)) return SENTENCE;
  if (/[,;:—–]$/.test(word)) return CLAUSE;
  return STEP;
};

/**
 * Text that arrives as if it were being written.
 *
 * A word at a time rather than a character at a time, and deliberately: these
 * three paragraphs are about 750 characters, and at any speed slow enough to
 * read as typing that is six seconds of someone watching a cursor. At word
 * granularity with punctuation pauses it takes about three, and reads as fast
 * typing rather than as a stagger.
 *
 * Every word is in the DOM from the first frame and only its opacity changes,
 * so nothing reflows while it runs and a screen reader gets the whole text
 * immediately instead of a paragraph that grows underneath it. The hairline
 * caret is the one thing that says "typing" rather than "fading in", so it is
 * a hairline and not a blinking block, and it leaves when the text is done.
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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const words = Array.from(container.querySelectorAll<HTMLElement>("[data-word]"));
    if (words.length === 0) return;

    if (still) {
      container.classList.add("is-done");
      for (const word of words) word.classList.add("is-typed");
      return;
    }

    let frame = 0;
    let index = 0;
    let pending = 0;
    let last = 0;

    const tick = (now: number) => {
      if (last === 0) last = now;
      pending -= now - last;
      last = now;

      while (pending <= 0 && index < words.length) {
        words[index - 1]?.classList.remove("is-caret");
        words[index].classList.add("is-typed", "is-caret");
        pending += delayAfter(words[index].textContent ?? "");
        index += 1;
      }

      if (index >= words.length) {
        words[words.length - 1]?.classList.remove("is-caret");
        container.classList.add("is-done");
        return;
      }

      frame = requestAnimationFrame(tick);
    };

    // Starts when the block is genuinely being looked at, not when it grazes
    // the bottom of the screen — otherwise it has finished before it arrives.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.25 },
    );
    observer.observe(container);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [still, paragraphs]);

  return (
    <div ref={containerRef} className={`typed ${className}`}>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className={index > 0 ? "mt-6" : undefined}>
          {paragraph.split(" ").map((word, position) => (
            <span key={position} data-word className="type-word">
              {word}{" "}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}
