import { useEffect, useState } from "react";

/**
 * How far a fixed-width block has to shrink to fit the window, never above 1.
 *
 * The contact row is 1468px of carefully placed overlaps. Rather than recompute
 * every seat per breakpoint, the whole row is scaled as one object — and the
 * factor is measured here because CSS cannot divide one length by another,
 * which is exactly what a fit-to-width ratio is.
 */
export function useFitScale(width: number, gutter = 56): number {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const measure = () =>
      setScale(Math.min(1, (window.innerWidth - gutter) / width));
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [width, gutter]);

  return scale;
}

/** Live match for a media query, so a layout can differ in JavaScript and not
 *  only in CSS — the contact fan positions cards with real numbers. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  );

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}
