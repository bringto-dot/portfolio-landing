import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useRef, type PointerEvent as ReactPointerEvent } from "react";
import { Button } from "../../components/ui/Button";
import { GlassPanel } from "../../components/ui/GlassPanel";
import {
  repoUrl,
  shotFallback,
  shotBlur,
  shotSrcSet,
  type Project,
} from "../../content/projects";
import type { ProjectCopy } from "../../content/types";
import { EASE } from "../../lib/anim";

/** Degrees of tilt at the far corner. Past about five it stops reading as a
 *  surface catching the light and starts reading as a toy. */
const TILT = 4;

const SIZES = "(min-width: 1100px) 980px, 92vw";

export function ProjectCard({
  project,
  copy,
  index,
  offset,
  flipped,
  onFlip,
  labels,
  still,
  priority,
}: {
  project: Project;
  copy: ProjectCopy;
  index: number;
  /** Distance from the showing card: 0 is the one on top. */
  offset: number;
  flipped: boolean;
  onFlip: () => void;
  labels: { open: string; back: string };
  still: boolean;
  priority: boolean;
}) {
  const active = offset === 0;
  const ref = useRef<HTMLDivElement>(null);
  const press = useRef({ x: 0, y: 0 });

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springs = { stiffness: 180, damping: 22, mass: 0.6 };
  const tiltX = useSpring(useTransform(pointerY, [-0.5, 0.5], [TILT, -TILT]), springs);
  const tiltY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-TILT, TILT]), springs);

  const track = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!active || still) return;
    const node = ref.current;
    if (!node) return;
    const box = node.getBoundingClientRect();
    pointerX.set((event.clientX - box.left) / box.width - 0.5);
    pointerY.set((event.clientY - box.top) / box.height - 0.5);
  };

  const release = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  // A press that travels is a swipe and belongs to the carousel; a press that
  // stays put is a click and flips the card. Deciding between them here, on
  // distance, is what lets one surface do both without a drag library.
  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    press.current = { x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    if (!active) return;
    const travelled = Math.hypot(
      event.clientX - press.current.x,
      event.clientY - press.current.y,
    );
    if (travelled < 12) onFlip();
  };

  return (
    <motion.div
      className="absolute inset-0"
      style={{ perspective: 1600, zIndex: active ? 2 : 1 }}
      animate={{
        opacity: active ? 1 : 0,
        x: active ? 0 : offset > 0 ? 64 : -64,
        scale: active ? 1 : 0.97,
      }}
      transition={{ duration: still ? 0 : 0.8, ease: EASE.settle }}
      aria-hidden={!active}
      // `inert` keeps everything under a hidden card out of the tab order,
      // which `aria-hidden` on its own does not do.
      inert={!active}
    >
      <motion.div
        ref={ref}
        className="h-full w-full"
        style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: "preserve-3d" }}
        onPointerMove={track}
        onPointerLeave={release}
      >
        <motion.div
          className="relative h-full w-full"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: still ? 0 : 0.95, ease: EASE.panel }}
        >
          {/* Front — the work itself. */}
          <div
            className="absolute inset-0"
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
          >
            <GlassPanel
              flat
              sheen
              radius="1.5rem"
              className="h-full w-full cursor-pointer p-2 md:p-2.5"
            >
              <button
                type="button"
                onPointerDown={onPointerDown}
                onPointerUp={onPointerUp}
                aria-pressed={flipped}
                aria-label={`${copy.title} — ${copy.kind}`}
                className="block h-full w-full overflow-hidden rounded-[1.05rem] focus-visible:outline-offset-[-2px]"
                style={{ background: project.shot.placeholder }}
                tabIndex={active ? 0 : -1}
              >
                <picture>
                  <source
                    type="image/avif"
                    srcSet={shotSrcSet(project, "avif")}
                    sizes={SIZES}
                  />
                  <source
                    type="image/webp"
                    srcSet={shotSrcSet(project, "webp")}
                    sizes={SIZES}
                  />
                  <img
                    src={shotFallback(project)}
                    width={project.shot.width}
                    height={project.shot.height}
                    alt={`${copy.title} — ${copy.kind}`}
                    loading={priority ? "eager" : "lazy"}
                    // Only the first card can be on screen when the carousel
                    // is reached; the other five must never compete with the
                    // fonts and the hero for the connection.
                    fetchPriority={priority ? "auto" : "low"}
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </picture>
              </button>
            </GlassPanel>
          </div>

          {/* Back — what it was, and where to read the code. */}
          <div
            className="absolute inset-0"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="relative h-full w-full overflow-hidden rounded-[1.5rem]">
              {/* Fully opaque, deliberately.
                  `backface-visibility` is not reliable once anything in the
                  subtree creates a stacking context, and when it gives out the
                  front face shows through the back mirror-imaged — the project
                  render sitting behind its own description, unreadable. An
                  opaque plate is correct regardless of what the compositor
                  decides to do.

                  The field behind the text is the project's own render at 40px
                  wide, blown up: the card keeps the colours of the work it
                  belongs to without anyone having to read anything through
                  them. */}
              <div className="absolute inset-0" style={{ background: project.stage }} />
              <img
                src={shotBlur(project)}
                alt=""
                aria-hidden
                width={40}
                height={25}
                className="absolute inset-0 h-full w-full scale-[1.25] object-cover opacity-55"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(150deg, ${project.stage}cc, ${project.stage}f2 62%, ${project.stage})`,
                }}
              />

              {/* Clicking anywhere on the reverse turns it back. It sits under
                  the content so the GitHub link keeps its own target.

                  A plain div rather than a button: keyboard users already have
                  the labelled "back" control below, and a focusable button with
                  no accessible name is worse than no button at all. */}
              {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
              <div
                aria-hidden
                onClick={onFlip}
                className="absolute inset-0 z-[1] cursor-pointer"
              />

              <GlassPanel
                flat
                radius="1.5rem"
                className="pointer-events-none relative z-[2] flex h-full w-full flex-col bg-transparent p-7 shadow-none md:p-10 lg:p-12"
              >
                <div className="relative z-[3] flex items-start justify-between gap-6">
                  <p className="tnum font-display text-[0.95rem] font-bold text-[var(--stage-fg-2)]">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <button
                    type="button"
                    onClick={onFlip}
                    tabIndex={active && flipped ? 0 : -1}
                    className="pointer-events-auto text-[0.82rem] text-[var(--stage-fg-2)] transition-opacity duration-300 hover:opacity-60"
                  >
                    {labels.back}
                  </button>
                </div>

                {/* No title on this side. It is already set in display type
                    directly under the card and does not change when the card
                    turns — repeating it here would be the same words twice on
                    one screen. The back is for what the front cannot say. */}
                <div className="relative z-[3] flex flex-1 flex-col justify-center">
                  <p className="max-w-[46ch] text-[clamp(1rem,1.55vw,1.42rem)] leading-[1.55] tracking-[-0.01em]">
                    {copy.description}
                  </p>

                  <div className="mt-8 md:mt-10">
                    <Button
                      href={repoUrl(project)}
                      target="_blank"
                      rel="noreferrer"
                      arrow
                      className="pointer-events-auto"
                      tabIndex={active && flipped ? 0 : -1}
                    >
                      {labels.open}
                    </Button>
                  </div>
                </div>
              </GlassPanel>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
