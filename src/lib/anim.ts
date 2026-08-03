/** Shared curves, so every surface on the page eases the same way. */
export const EASE = {
  /** Long, soft settle — entrances and reveals. */
  settle: [0.16, 1, 0.3, 1] as const,
  /** Symmetric — panels and cards that move in both directions. */
  panel: [0.76, 0, 0.24, 1] as const,
  /** Short and calm — hover states. */
  hover: [0.33, 1, 0.68, 1] as const,
};

export const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

export const clamp = (n: number, min: number, max: number) =>
  n < min ? min : n > max ? max : n;

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Maps `value` from [inMin, inMax] onto [0, 1], clamped. */
export const progress = (value: number, inMin: number, inMax: number) =>
  clamp01((value - inMin) / (inMax - inMin || 1));

/** Hermite ease — same shape at both ends, no overshoot. */
export const smoothstep = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};

/**
 * Frame-rate independent smoothing. `lambda` is how fast it converges (higher =
 * snappier), `dt` the frame delta in seconds. Exponential decay rather than a
 * fixed lerp factor keeps the feel identical at 60Hz and at 144Hz.
 */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  lerp(current, target, 1 - Math.exp(-lambda * dt));

/** Staggered delay for entrance sequences, capped so long lists stay prompt. */
export const stagger = (index: number, step = 0.07, cap = 0.6) =>
  Math.min(index * step, cap);
