import type { ComponentProps, ReactNode } from "react";

type Variant = "solid" | "ghost";
type Size = "md" | "sm";

/**
 * Two materials, one shape.
 *
 * `solid` is machined metal: a turning chrome ring around a bevelled dark
 * plate, with a specular band that crosses it on hover. It looks the same on
 * every one of the six stage colours, because an edge made of metal carries its
 * own contrast — a pill that simply inverts the background vanishes the moment
 * the background is mid-toned, which two of the six are.
 *
 * `ghost` is the same object in glass: it takes its hairline and its label from
 * the stage, blurs what is behind it, and gets the same band of light.
 *
 * Both are CSS. The alternative — one WebGL surface per button — is a live
 * graphics context each, and browsers keep about sixteen of those before they
 * start silently killing the oldest.
 */
const SIZES: Record<Size, { outer: string; core: string }> = {
  md: { outer: "", core: "h-[46px] px-6 text-[0.95rem]" },
  sm: { outer: "", core: "h-[38px] px-5 text-[0.875rem]" },
};

type Common = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  /** Adds a chevron that steps forward on hover. */
  arrow?: boolean;
  className?: string;
};

type AsLink = Common & { href: string } & Omit<ComponentProps<"a">, "className" | "children">;
type AsButton = Common & { href?: undefined } & Omit<
    ComponentProps<"button">,
    "className" | "children"
  >;

export function Button(props: AsLink | AsButton) {
  const {
    children,
    variant = "solid",
    size = "md",
    arrow = false,
    className = "",
    ...rest
  } = props;

  const metal = variant === "solid";
  const dimensions = SIZES[size];

  const shell = `group relative inline-flex max-w-full shrink-0 select-none items-center justify-center align-middle font-medium ${
    metal ? "metal" : `pane ${dimensions.core}`
  } ${metal ? dimensions.outer : ""} ${className}`;

  const label = (
    <>
      <span className="truncate">{children}</span>
      {arrow && (
        <span
          aria-hidden
          className="shrink-0 transition-transform duration-300 ease-[var(--ease-hover)] group-hover:translate-x-[3px]"
        >
          →
        </span>
      )}
    </>
  );

  const content = metal ? (
    <span className={`metal__core ${dimensions.core}`}>
      <span className="relative z-[1] inline-flex items-center gap-2 whitespace-nowrap">
        {label}
      </span>
    </span>
  ) : (
    <span className="relative z-[1] inline-flex items-center gap-2 whitespace-nowrap">
      {label}
    </span>
  );

  if ("href" in rest && rest.href !== undefined) {
    const { href, ...anchor } = rest as AsLink;
    return (
      <a href={href} className={shell} {...anchor}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" className={shell} {...(rest as AsButton)}>
      {content}
    </button>
  );
}
