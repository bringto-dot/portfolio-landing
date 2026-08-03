import { clamp01, lerp } from "./anim";

export type Rgb = readonly [number, number, number];

const HEX = /^#?([\da-f]{3}|[\da-f]{6})$/i;

export function parseHex(hex: string): Rgb {
  const match = HEX.exec(hex.trim());
  if (!match) return [0, 0, 0];

  let body = match[1];
  if (body.length === 3) body = body.replace(/./g, (c) => c + c);

  return [
    Number.parseInt(body.slice(0, 2), 16),
    Number.parseInt(body.slice(2, 4), 16),
    Number.parseInt(body.slice(4, 6), 16),
  ];
}

export const toCss = ([r, g, b]: Rgb) =>
  `rgb(${Math.round(r)} ${Math.round(g)} ${Math.round(b)})`;

export const toHex = (rgb: Rgb) =>
  `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;

export const mixRgb = (a: Rgb, b: Rgb, t: number): Rgb => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];

/**
 * WCAG relative luminance. The gamma decode matters: mixing the raw 0–255
 * channels tells you a saturated yellow and a mid grey are equally bright,
 * which is how sites end up with black text on a colour that cannot hold it.
 */
export function luminance([r, g, b]: Rgb): number {
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/**
 * How dark a background is, on 0–1, with a soft band rather than a hard switch
 * so the foreground cross-fades instead of flipping mid-scroll.
 *
 * The band is centred on L≈0.18, where white text and black text have equal
 * contrast against the background — solve (1.05)/(L+0.05) = (L+0.05)/0.05 and
 * that is where it lands. Guessing the midpoint at "50% grey" puts it at
 * L≈0.216 and picks the wrong colour on everything in between.
 *
 * Checked against the six project colours: yellow (L≈0.59) and light blue
 * (L≈0.50) take dark text, deep red (L≈0.10) and navy (L≈0.03) take light.
 */
export const toneOf = (rgb: Rgb) => clamp01((0.26 - luminance(rgb)) / 0.16);
