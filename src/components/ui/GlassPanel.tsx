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

  // Placing the highlight on entry as well as on move, so it fades up where
  // the pointer actually is instead of at wherever it left the surface last.
  const place = (event: PointerEvent<HTMLElement>) => track(event);

  return (
    <Tag
      ref={ref as never}
      onPointerMove={sheen ? track : undefined}
      onPointerEnter={sheen ? place : undefined}
      className={`glass ${flat ? "glass--flat" : ""} ${sheen ? "group/glass" : ""} ${className}`}
      style={{ borderRadius: radius, ...style }}
    >
      {sheen && (
        // Three soft ellipses at different sizes, angles and offsets rather
        // than one circle. A single radial gradient is a grey disc following
        // the cursor, and it reads as a cheap overlay the moment you notice its
        // edge; smeared and off-centre, it reads as light catching a surface.
        //
        // `plus-lighter` adds light to what is underneath instead of painting
        // grey over it, which is the difference between a highlight and a
        // sticker.
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] opacity-0 transition-opacity duration-300 ease-[var(--ease-hover)] group-hover/glass:opacity-100"
          style={{
            borderRadius: "inherit",
            mixBlendMode: "plus-lighter",
            background: `
              radial-gradient(112px 82px at var(--mx, 50%) var(--my, 50%), rgb(255 255 255 / 0.10), transparent 64%),
              radial-gradient(190px 62px at calc(var(--mx, 50%) + 22px) calc(var(--my, 50%) - 12px), rgb(255 255 255 / 0.055), transparent 70%),
              radial-gradient(64px 132px at calc(var(--mx, 50%) - 26px) calc(var(--my, 50%) + 16px), rgb(255 255 255 / 0.045), transparent 68%)
            `,
          }}
        />
      )}
      {children}
    </Tag>
  );
}
