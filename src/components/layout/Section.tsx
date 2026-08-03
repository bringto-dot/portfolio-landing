import type { ReactNode, Ref } from "react";

/**
 * The page gutter and measure. Identical everywhere, so nothing drifts a few
 * pixels out of alignment between one section and the next.
 */
export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto w-full max-w-[1280px] px-[var(--gutter)] ${className}`}
    >
      {children}
    </div>
  );
}

export function Section({
  id,
  children,
  className = "",
  ref,
  labelledBy,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  ref?: Ref<HTMLElement>;
  labelledBy?: string;
}) {
  return (
    <section
      id={id}
      ref={ref}
      aria-labelledby={labelledBy}
      // scroll-mt clears the fixed header when an anchor lands here.
      className={`relative scroll-mt-28 ${className}`}
    >
      {children}
    </section>
  );
}
