import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { smoothstep } from "../lib/anim";
import { mixRgb, parseHex, toCss, toneOf, type Rgb } from "../lib/color";
import { StageContext, type StageRegistry, type StageSource } from "./context";

/** Where on the screen the stage asks "which section is this?". */
const PROBE = 0.5;

/** How much scrolling a colour change is spread over, in viewport heights. */
const BAND = 0.55;

const INK = parseHex("#0a0a0b");
const CHALK = parseHex("#f5f5f6");

/**
 * How far the secondary and tertiary text tiers are mixed back into the
 * background they sit on.
 *
 * Deriving them this way rather than from two fixed greys is what makes one
 * page work on six colours. A fixed `#61616b` for tertiary text is tuned for a
 * near-black background; drop it on the deep red and it is a dark smudge on a
 * dark red, at about 1.6:1. Tinting the foreground with the stage instead keeps
 * the same *relationship* on white, on ink, on red, on navy, on yellow and on
 * light blue.
 */
const TIER_2 = 0.35;
const TIER_3 = 0.55;

const rgba = ([r, g, b]: Rgb, alpha: number) =>
  `rgb(${Math.round(r)} ${Math.round(g)} ${Math.round(b)} / ${alpha.toFixed(3)})`;

const between = (a: number, b: number, t: number) => a + (b - a) * t;

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

      const foreground = mixRgb(INK, CHALK, tone);
      const css = toCss(colour);

      root.style.setProperty("--stage", css);
      root.style.setProperty("--stage-tone", tone.toFixed(3));
      root.style.setProperty("--stage-fg", toCss(foreground));
      root.style.setProperty("--stage-fg-2", toCss(mixRgb(foreground, colour, TIER_2)));
      root.style.setProperty("--stage-fg-3", toCss(mixRgb(foreground, colour, TIER_3)));
      root.style.setProperty("--stage-line", rgba(foreground, between(0.1, 0.16, tone)));

      // Glass on paper is a white pane with a dark edge; glass on ink is a
      // barely-there white film with a bright edge. Same recipe, opposite
      // materials, interpolated rather than switched so the header stays
      // legible through every transition.
      root.style.setProperty(
        "--glass-bg",
        rgba(CHALK, between(0.55, 0.055, tone)),
      );
      root.style.setProperty("--glass-line", rgba(foreground, between(0.1, 0.14, tone)));
      root.style.setProperty("--glass-line-hi", rgba(foreground, between(0.22, 0.36, tone)));
      root.style.setProperty("--glass-sheen", rgba(CHALK, between(0.7, 0.16, tone)));
      root.style.setProperty(
        "--glass-shadow",
        `0 1px 2px rgb(5 5 6 / ${between(0.05, 0.2, tone).toFixed(3)}), 0 18px 50px -18px rgb(5 5 6 / ${between(
          0.18,
          0.55,
          tone,
        ).toFixed(3)})`,
      );

      themeColor?.setAttribute("content", css);
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
