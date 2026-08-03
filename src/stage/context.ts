import { createContext, useContext } from "react";

/**
 * A section that has an opinion about what colour the page should be while it
 * owns the viewport.
 *
 * `read` is called once per frame instead of the colour being passed in, so a
 * section can change its mind — the projects carousel returns whichever
 * project is showing, the approach section returns a colour it derives from
 * its own scroll progress. The stage stays dumb; timing belongs to whoever
 * owns the change.
 */
export type StageSource = {
  element: HTMLElement;
  read: () => string;
};

export type StageRegistry = {
  /** Registers a source and returns the function that removes it. */
  add: (source: StageSource) => () => void;
};

export const StageContext = createContext<StageRegistry | null>(null);

export function useStageRegistry(): StageRegistry {
  const registry = useContext(StageContext);
  if (!registry) throw new Error("Stage sections must live inside <StageProvider>");
  return registry;
}
