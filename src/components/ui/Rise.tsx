import { motion } from "motion/react";
import type { ReactNode } from "react";
import { EASE } from "../../lib/anim";

/**
 * The size the page's two big statements are set at. The hero opens with one
 * and the closing screen answers it, so they share the class rather than each
 * carrying a clamp that could drift apart later.
 */
export const DISPLAY_LINE =
  "font-display text-[clamp(1.9rem,5vw,4.25rem)] font-extrabold leading-[1.07] tracking-[-0.04em]";

const VARIANTS = {
  hidden: { y: "115%" },
  shown: { y: 0 },
};

/**
 * Text that rises out of a mask.
 *
 * The mask is padded and pulled back by the same amount so «ц», «у» and «д»
 * keep their descenders instead of being sliced off by the overflow that makes
 * the effect work.
 *
 * `whenSeen` puts the trigger on the mask — the outer element, the one that is
 * never hidden — and drives the inner one through variants. Putting an
 * in-view trigger on the element that is itself translated out of a clipping
 * box deadlocks: the observer cannot fire until the transform is removed, and
 * the transform is not removed until the observer fires, so the line simply
 * never appears.
 */
export function Rise({
  children,
  delay = 0,
  duration = 0.9,
  still,
  whenSeen = false,
}: {
  children: ReactNode;
  /** Seconds. */
  delay?: number;
  duration?: number;
  still: boolean;
  /** Wait until the line is scrolled into view instead of running on load. */
  whenSeen?: boolean;
}) {
  if (still) return <>{children}</>;

  const trigger = whenSeen
    ? ({ initial: "hidden", whileInView: "shown", viewport: { once: true, amount: 0.4 } } as const)
    : ({ initial: "hidden", animate: "shown" } as const);

  return (
    <motion.span
      className="inline-block overflow-hidden pb-[0.18em] align-bottom [margin-bottom:-0.18em]"
      {...trigger}
    >
      <motion.span
        className="inline-block"
        variants={VARIANTS}
        transition={{ duration, delay, ease: EASE.settle }}
      >
        {children}
      </motion.span>
    </motion.span>
  );
}
