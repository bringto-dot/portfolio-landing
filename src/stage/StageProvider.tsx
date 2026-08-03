import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { smoothstep } from "../lib/anim";
import { mixRgb, parseHex, toneOf } from "../lib/color";
import { surfaceVars } from "../lib/surface";
import { StageContext, type StageRegistry, type StageSource } from "./context";

/** Where on the screen the stage asks "which section is this?". */
const PROBE = 0.5;

/** How much scrolling a colour change is spread over, in viewport heights. */
const BAND = 0.55;

/**
 * Paints the page.
 *
 * There are no per-section backgrounds anywhere in this project. One fixed
 * layer sits under the whole document and this controller repaints it from
 * scroll position, blending between whatever the sections above and below ask
 * for. That single mechanism produces the white-to-black turn under "Мой
 * подход", the six brand colours in the projects carousel, the red-to-blue
 * drift under the two ways of working, and the inverted closing screen.
 *
 * It writes CSS custom properties rather than React state, so scrolling the
 * entire page costs zero renders and zero reconciliation. Everything that
 * needs to know the current background — the header, the rules, the glass —
 * reads those properties in CSS.
 */
export function StageProvider({ children }: { children: ReactNode }) {
  const sources = useRef<StageSource[]>([]);

  const registry = useMemo<StageRegistry>(
    () => ({
      add(source) {
        sources.current = [...sources.current, source];
        return () => {
          sources.current = sources.current.filter((entry) => entry !== source);
        };
      },
    }),
    [],
  );

  useEffect(() => {
    const root = document.documentElement;
    const themeColor = document.querySelector('meta[name="theme-color"]');
    let frame = 0;
    let previous = "";

    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (document.hidden) return;

      const list = sources.current;
      if (list.length === 0) return;

      // Reading every rect each frame looks profligate, but it is under ten
      // elements and it is a read-then-write pass with no interleaved writes,
      // so it costs one layout flush rather than one per element.
      const items = list
        .map((source) => ({
          top: source.element.getBoundingClientRect().top,
          read: source.read,
        }))
        .sort((a, b) => a.top - b.top);

      const viewport = window.innerHeight;
      const probe = viewport * PROBE;
      const band = viewport * BAND;

      let index = 0;
      for (let i = 0; i < items.length; i += 1) {
        if (items[i].top <= probe) index = i;
      }

      let colour = parseHex(items[index].read());

      // Blend across the boundary, half the band on each side of it, so the
      // two branches meet at exactly 0.5 and the colour never jumps.
      const sincePrevious = probe - items[index].top;
      const untilNext = items[index + 1] ? items[index + 1].top - probe : Infinity;

      if (index > 0 && sincePrevious < band / 2) {
        const t = smoothstep(0.5 + sincePrevious / band);
        colour = mixRgb(parseHex(items[index - 1].read()), colour, t);
      } else if (untilNext < band / 2) {
        const t = smoothstep(0.5 - untilNext / band);
        colour = mixRgb(colour, parseHex(items[index + 1].read()), t);
      }

      const tone = toneOf(colour);
      const signature = `${Math.round(colour[0])},${Math.round(colour[1])},${Math.round(
        colour[2],
      )},${tone.toFixed(3)}`;

      // Nothing moved, nothing to repaint. Outside the blend bands this is
      // every frame, which is the point: a full-viewport background repaint is
      // not free and it should only happen while the colour is actually
      // changing.
      if (signature === previous) return;
      previous = signature;

      // The same derivation the reverse of a project card uses on itself, so
      // there is one definition of what a surface of a given colour looks like
      // rather than two that can quietly drift apart.
      const vars = surfaceVars(colour);
      for (const [name, value] of Object.entries(vars)) {
        root.style.setProperty(name, value);
      }

      themeColor?.setAttribute("content", vars["--stage"]);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <StageContext.Provider value={registry}>
      <div
        aria-hidden
        className="fixed inset-0 z-0"
        style={{ background: "var(--stage)" }}
      />
      <div className="relative z-10">{children}</div>
    </StageContext.Provider>
  );
}
