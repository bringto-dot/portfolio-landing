import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * Reveals its children once, the first time they come into view.
 *
 * An IntersectionObserver rather than a scroll handler, and the visible state
 * is the CSS default — `index.css` only hides `.reveal` under `.js`, which is
 * added at boot. With scripting off the page is simply there instead of blank,
 * and with reduced motion the class is applied immediately.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
  id,
}: {
  children: ReactNode;
  /** Seconds. Used to stagger siblings. */
  delay?: number;
  as?: ElementType;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.classList.add("is-in");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.06 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      id={id}
      className={`reveal ${className}`}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </Tag>
  );
}
