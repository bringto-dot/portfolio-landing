import { mixRgb, parseHex, toCss, toneOf, type Rgb } from "./color";

export const INK = parseHex("#0a0a0b");
export const CHALK = parseHex("#f5f5f6");

/**
 * How far the secondary and tertiary text tiers are mixed back into the
 * background they sit on.
 *
 * Deriving them this way rather than from two fixed greys is what makes one
 * page work on six colours. A fixed `#61616b` for tertiary text is tuned for a
 * near-black background; drop it on the deep red and it is a dark smudge on a
 * dark red, at about 1.6:1. Tinting the foreground with the stage instead keeps
 * the same *relationship* on white, on ink, on red, on navy, on yellow and on
 * light blue.
 */
const TIER_2 = 0.35;
const TIER_3 = 0.55;

export const rgba = ([r, g, b]: Rgb, alpha: number) =>
  `rgb(${Math.round(r)} ${Math.round(g)} ${Math.round(b)} / ${alpha.toFixed(3)})`;

export const between = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Everything a surface of a given colour needs, as CSS custom properties.
 *
 * The stage controller writes these onto the document each time the page
 * colour moves, and any element that wants to be its own little stage — the
 * reverse of a project card, which is coloured by that project's screenshot
 * rather than by the page — sets the same names on itself. The variables
 * inherit, so everything inside simply works, and there is one derivation
 * rather than two that can drift apart.
 */
export function surfaceVars(colour: Rgb): Record<string, string> {
  const tone = toneOf(colour);
  const foreground = mixRgb(INK, CHALK, tone);

  return {
    "--stage": toCss(colour),
    "--stage-tone": tone.toFixed(3),
    "--stage-fg": toCss(foreground),
    "--stage-fg-2": toCss(mixRgb(foreground, colour, TIER_2)),
    "--stage-fg-3": toCss(mixRgb(foreground, colour, TIER_3)),
    "--stage-line": rgba(foreground, between(0.1, 0.16, tone)),

    // Glass on paper is a white pane with a dark edge; glass on ink is a
    // barely-there white film with a bright edge. Same recipe, opposite
    // materials, interpolated rather than switched so a surface stays legible
    // through every transition.
    "--glass-bg": rgba(CHALK, between(0.55, 0.055, tone)),
    "--glass-line": rgba(foreground, between(0.1, 0.14, tone)),
    "--glass-line-hi": rgba(foreground, between(0.22, 0.36, tone)),
    "--glass-shadow": `0 1px 2px rgb(5 5 6 / ${between(0.05, 0.2, tone).toFixed(
      3,
    )}), 0 18px 50px -18px rgb(5 5 6 / ${between(0.18, 0.55, tone).toFixed(3)})`,
  };
}

/** How far the reverse of a card is pushed away from mid-grey. */
const LIFT = 0.45;

/**
 * The reverse of a project card takes its colour from that project's own
 * screenshot, not from the page — otherwise the card and the background behind
 * it are the same colour and the card stops being an object.
 *
 * The average colour is pushed away from the middle first: a screenshot that
 * averages to mid-grey gives poor contrast whichever way the text goes, so a
 * darkish field is darkened and a lightish one lightened until it can hold
 * type. What comes back is the resulting field colour, the flat wash that
 * produces it, and the variables the text on top should use.
 */
export function cardSurface(placeholder: string) {
  const base = parseHex(placeholder);
  const dark = toneOf(base) > 0.5;
  const towards = dark ? INK : CHALK;
  const field = mixRgb(base, towards, LIFT);

  return {
    vars: surfaceVars(field),
    /** Painted over the blurred screenshot to produce `field`. */
    wash: rgba(towards, LIFT),
    dark,
  };
}
