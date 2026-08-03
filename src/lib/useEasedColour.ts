import { useCallback, useEffect, useRef } from "react";
import { damp } from "./anim";
import { parseHex, toHex, type Rgb } from "./color";

/**
 * Follows a target colour smoothly and hands back a getter for the current one.
 *
 * The stage controller only asks a section what colour it wants; it never
 * decides how quickly a section is allowed to change its mind. So a section
 * that switches colour on a button press — the projects carousel — does its own
 * easing here and reports the eased value. Exponential damping rather than a
 * fixed step, so the feel is identical at 60Hz and 144Hz.
 *
 * The value lives in a ref and never becomes state: this runs every frame, and
 * a colour is not something the component tree needs to re-render over.
 */
export function useEasedColour(target: string, lambda = 3.6): () => string {
  const current = useRef<Rgb>(parseHex(target));
  const goal = useRef(target);
  goal.current = target;

  useEffect(() => {
    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;

      const to = parseHex(goal.current);
      current.current = [
        damp(current.current[0], to[0], lambda, dt),
        damp(current.current[1], to[1], lambda, dt),
        damp(current.current[2], to[2], lambda, dt),
      ];
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [lambda]);

  return useCallback(() => toHex(current.current), []);
}
