import { useEffect, type RefObject } from "react";
import { clamp01 } from "./anim";

/**
 * Gives every matched element a `--near` value from 0 to 1 by how close the
 * pointer is to it.
 *
 * A soft pool of legibility that travels with the hand, rather than a row of
 * hover states switching on and off. Distance is measured to the nearest point
 * on each element's box, not to its centre, so a long line responds along its
 * whole length instead of only in the middle.
 *
 * Only opacity and colour are driven from this — deliberately. Animating
 * `font-weight` across a list is the obvious version of the same idea and it
 * recalculates text metrics on every frame, so the whole column twitches as
 * the cursor passes. Colour costs a repaint and nothing else.
 */
export function useProximity(
  ref: RefObject<HTMLElement | null>,
  radius = 190,
) {
  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    // No pointer to be near: leave every item at full contrast rather than
    // leaving a touch visitor with a page of grey text.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const items = Array.from(container.querySelectorAll<HTMLElement>("[data-near]"));
    if (items.length === 0) return;

    container.classList.add("is-proximate");

    let frame = 0;
    let pointerX = -9999;
    let pointerY = -9999;
    let inside = false;

    const onMove = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      inside = true;
    };
    const onLeave = () => {
      inside = false;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);

    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (document.hidden) return;

      const bounds = container.getBoundingClientRect();
      const visible = bounds.bottom > 0 && bounds.top < window.innerHeight;
      if (!visible) return;

      for (const item of items) {
        if (!inside) {
          item.style.setProperty("--near", "0");
          continue;
        }

        const box = item.getBoundingClientRect();
        const dx = Math.max(box.left - pointerX, 0, pointerX - box.right);
        const dy = Math.max(box.top - pointerY, 0, pointerY - box.bottom);
        const distance = Math.hypot(dx, dy);
        const near = clamp01(1 - distance / radius) ** 1.6;
        item.style.setProperty("--near", near.toFixed(3));
      }
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      container.classList.remove("is-proximate");
      for (const item of items) item.style.removeProperty("--near");
    };
  }, [ref, radius]);
}
