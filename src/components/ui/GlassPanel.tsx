import type { CSSProperties, ReactNode } from "react";

/**
 * The one glass surface on the site. The header, the project cards and the
 * contact row are all this component; only the tint changes.
 *
 * Two ingredients: a saturating backdrop blur, and a gradient edge painted by a
 * masked pseudo-element in `.glass` — `border-image` cannot follow a
 * `border-radius`, which is why the edge is a pseudo-element and not a border.
 *
 * There was a third: a highlight that tracked the pointer. It is gone. A
 * moving light on a surface is only convincing when the surface has depth for
 * it to travel over, and on flat cards it read as a grey shape following the
 * cursor around — worse than nothing.
 */
export function GlassPanel({
  children,
  className = "",
  style,
  /** Opts out of backdrop-filter, which Safari drops inside a 3D transform. */
  flat = false,
  radius = "1.75rem",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  flat?: boolean;
  radius?: string;
  as?: "div" | "article" | "aside";
}) {
  return (
    <Tag
      className={`glass ${flat ? "glass--flat" : ""} ${className}`}
      style={{ borderRadius: radius, ...style }}
    >
      {children}
    </Tag>
  );
}
