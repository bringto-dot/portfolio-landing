import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";

/**
 * The one glass surface on the site. The header, the project cards and the
 * contact fan are all this component; only the tint and the radius change.
 *
 * The recipe lives in `.glass` in index.css — a saturating backdrop blur, plus
 * a gradient edge painted by a masked pseudo-element because `border-image`
 * cannot follow a `border-radius`. The third ingredient is here: a specular
 * highlight that tracks the pointer, which is what stops the surface reading as
 * a flat translucent rectangle.
 *
 * The pointer position is written straight to the element's own custom
 * properties. Routing it through React state would re-render a subtree on
 * every mousemove to move a gradient the compositor can handle by itself.
 */
export function GlassPanel({
  children,
  className = "",
  style,
  sheen = false,
  /** Opts out of backdrop-filter, which Safari drops inside a 3D transform. */
  flat = false,
  radius = "1.75rem",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  sheen?: boolean;
  flat?: boolean;
  radius?: string;
  as?: "div" | "article" | "aside";
}) {
  const ref = useRef<HTMLDivElement>(null);

  const track = (event: PointerEvent<HTMLElement>) => {
    if (!sheen) return;
    const node = ref.current;
    if (!node) return;
    const box = node.getBoundingClientRect();
    node.style.setProperty("--mx", `${event.clientX - box.left}px`);
    node.style.setProperty("--my", `${event.clientY - box.top}px`);
  };

  return (
    <Tag
      ref={ref as never}
      onPointerMove={sheen ? track : undefined}
      className={`glass ${flat ? "glass--flat" : ""} ${sheen ? "group/glass" : ""} ${className}`}
      style={{ borderRadius: radius, ...style }}
    >
      {sheen && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] opacity-0 transition-opacity duration-500 ease-[var(--ease-hover)] group-hover/glass:opacity-100"
          style={{
            borderRadius: "inherit",
            background:
              "radial-gradient(260px circle at var(--mx, 50%) var(--my, 0%), var(--glass-sheen), transparent 68%)",
          }}
        />
      )}
      {children}
    </Tag>
  );
}
