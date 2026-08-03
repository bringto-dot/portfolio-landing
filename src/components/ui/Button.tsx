import type { ComponentProps, ReactNode } from "react";

type Variant = "solid" | "ghost";
type Size = "md" | "sm";

const BASE =
  "group relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-[background-color,border-color,color,transform,opacity] duration-300 ease-[var(--ease-hover)] active:scale-[0.98]";

const SIZES: Record<Size, string> = {
  md: "h-12 px-6 text-[0.95rem]",
  sm: "h-10 px-5 text-[0.875rem]",
};

/**
 * Solid inverts the current stage colour; ghost sits on a hairline of it.
 *
 * Neither names a colour. The page runs over white, near-black, deep red,
 * navy, yellow and light blue, and a button that hard-codes `bg-black` is
 * invisible on one of them — so both variants are written in terms of the
 * stage the controller is currently painting.
 */
const VARIANTS: Record<Variant, string> = {
  solid:
    "bg-[var(--stage-fg)] text-[var(--stage)] hover:opacity-[0.86] shadow-[0_1px_2px_rgb(5_5_6/0.08),0_10px_28px_-12px_rgb(5_5_6/0.35)]",
  ghost:
    "border border-[var(--stage-line)] text-[var(--stage-fg)] hover:border-[var(--stage-fg-3)] hover:bg-[color-mix(in_srgb,var(--stage-fg)_6%,transparent)]",
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

  const classes = `${BASE} ${SIZES[size]} ${VARIANTS[variant]} ${className}`;

  const content = (
    <>
      {children}
      {arrow && (
        <span
          aria-hidden
          className="transition-transform duration-300 ease-[var(--ease-hover)] group-hover:translate-x-[3px]"
        >
          →
        </span>
      )}
    </>
  );

  if ("href" in rest && rest.href !== undefined) {
    const { href, ...anchor } = rest as AsLink;
    return (
      <a href={href} className={classes} {...anchor}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" className={classes} {...(rest as AsButton)}>
      {content}
    </button>
  );
}
