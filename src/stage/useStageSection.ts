import { useEffect, useRef, type RefObject } from "react";
import { useStageRegistry } from "./context";

/**
 * Declares what colour the page should be while this section owns the viewport.
 *
 * Pass a hex string for a section with one colour, or a function for one that
 * decides per frame. The function form is read through a ref, so changing it
 * every render costs nothing and never re-registers.
 */
export function useStageSection(
  ref: RefObject<HTMLElement | null>,
  colour: string | (() => string),
) {
  const registry = useStageRegistry();
  const latest = useRef(colour);
  latest.current = colour;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    return registry.add({
      element,
      read: () => {
        const value = latest.current;
        return typeof value === "function" ? value() : value;
      },
    });
  }, [ref, registry]);
}
