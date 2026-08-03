import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

const read = () =>
  typeof window !== "undefined" && window.matchMedia(QUERY).matches;

/**
 * Whether the visitor has asked for less movement.
 *
 * Live rather than read once: the setting can change while the page is open,
 * and someone who turns it on mid-visit is asking for the animation to stop
 * now, not on the next reload.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(read);

  useEffect(() => {
    const media = window.matchMedia(QUERY);
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}
