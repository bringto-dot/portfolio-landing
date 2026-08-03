import { useEffect, useRef, type RefObject } from "react";
import { clamp01, damp, smoothstep } from "../../lib/anim";
import { useReducedMotion } from "../../lib/useReducedMotion";

/**
 * The order the field resolves into is a twelve-column layout grid: three
 * files of points per column, a gutter between columns. A plain even lattice
 * would be a dot texture — this is the thing a developer actually means by
 * structure, so the figure says what its caption says.
 */
const BANDS = 12;
const PER_BAND = 3;
const COLUMNS = BANDS * PER_BAND;
const ROWS = 26;
const COUNT = COLUMNS * ROWS;

/** Share of a column's width given over to the gutter beside it. */
const GUTTER = 0.34;

/** How far the pointer reaches, and how hard it pushes at the centre. */
const REACH = 150;
const PUSH = 26;

/** A wider, softer radius for the light the cursor carries. */
const GLOW = 260;

type Point = {
  /** Where it starts: scattered. */
  chaosX: number;
  chaosY: number;
  /** Where it ends: the grid. */
  orderX: number;
  orderY: number;
  /** Where it is right now. */
  x: number;
  y: number;
  /** Per-point delay, so the field resolves in a wave rather than all at once. */
  lead: number;
};

/**
 * The site's argument, drawn.
 *
 * A field of points that begins scattered and resolves into an exact grid as
 * the section passes the viewport — an idea becoming a structure, which is the
 * sentence the page opens with. It is the decorative half of "Мой подход" and
 * it is not decoration: it says the same thing the paragraphs beside it say.
 *
 * Canvas rather than DOM because 1,140 elements is 1,140 elements; here it is
 * one. Everything runs in a single rAF loop that reads scroll and pointer
 * itself, so nothing about this component ever re-renders React.
 */
export function PointField({
  className = "",
  anchorRef,
}: {
  className?: string;
  /**
   * The element whose travel drives the resolve — the section, not the canvas.
   *
   * Reading the canvas's own box works only while the canvas moves with the
   * page. The moment its column is pinned, or simply sits in a different part
   * of the grid, its box stops tracking the scroll and the field drifts out of
   * step with the paragraphs it is supposed to be answering.
   */
  anchorRef?: RefObject<HTMLElement | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const still = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let points: Point[] = [];
    const pointer = { x: -9999, y: -9999, active: false };

    const build = () => {
      const box = canvas.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = box.width;
      height = box.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const padX = width * 0.04;
      const padY = height * 0.06;
      const bandWidth = (width - padX * 2) / BANDS;
      const fileStep = (bandWidth * (1 - GUTTER)) / (PER_BAND - 1);
      const stepY = (height - padY * 2) / (ROWS - 1);

      points = Array.from({ length: COUNT }, (_, index) => {
        const column = index % COLUMNS;
        const row = Math.floor(index / COLUMNS);
        const band = Math.floor(column / PER_BAND);
        const file = column % PER_BAND;

        const orderX = padX + band * bandWidth + file * fileStep;
        const orderY = padY + row * stepY;

        return {
          orderX,
          orderY,
          // Scattered, but scattered *around* where the point belongs, so the
          // field reads as one thing finding its shape rather than a cloud
          // being replaced by a grid.
          chaosX: orderX + (Math.random() - 0.5) * width * 0.85,
          chaosY: orderY + (Math.random() - 0.5) * height * 0.9,
          x: orderX,
          y: orderY,
          lead: (column / COLUMNS) * 0.34 + Math.random() * 0.12,
        };
      });

      for (const point of points) {
        point.x = point.chaosX;
        point.y = point.chaosY;
      }
    };

    build();

    const observer = new ResizeObserver(build);
    observer.observe(canvas);

    const onPointerMove = (event: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      pointer.x = event.clientX - box.left;
      pointer.y = event.clientY - box.top;
      pointer.active =
        pointer.x > -REACH &&
        pointer.y > -REACH &&
        pointer.x < box.width + REACH &&
        pointer.y < box.height + REACH;
    };
    const onPointerLeave = () => {
      pointer.active = false;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);

    let frame = 0;
    let last = performance.now();

    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      if (document.hidden || points.length === 0) return;

      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;

      const box = canvas.getBoundingClientRect();
      if (box.bottom < 0 || box.top > window.innerHeight) return;

      // Resolution is tied to the section's travel through the viewport, so
      // the reader controls it: the grid arrives exactly as they finish the
      // paragraphs next to it.
      const viewport = window.innerHeight;
      const anchor = anchorRef?.current?.getBoundingClientRect() ?? box;
      const settled = clamp01((viewport * 0.9 - anchor.top) / (viewport * 0.72));

      ctx.clearRect(0, 0, width, height);

      for (const point of points) {
        const own = smoothstep(clamp01((settled - point.lead) / (1 - point.lead)));

        let targetX = point.chaosX + (point.orderX - point.chaosX) * own;
        let targetY = point.chaosY + (point.orderY - point.chaosY) * own;
        let glow = 0;

        if (pointer.active) {
          const dx = targetX - pointer.x;
          const dy = targetY - pointer.y;
          const distance = Math.hypot(dx, dy);

          if (distance < REACH && distance > 0.001) {
            // Falloff squared, so the disturbance has a soft edge instead of a
            // visible circular boundary travelling with the cursor.
            const force = (1 - distance / REACH) ** 2 * PUSH;
            targetX += (dx / distance) * force;
            targetY += (dy / distance) * force;
          }

          // The cursor carries a light as well as a push. Without it the field
          // is an even texture at rest, and an even texture is wallpaper.
          if (distance < GLOW) glow = (1 - distance / GLOW) ** 2 * 0.5;
        }

        point.x = damp(point.x, targetX, 7, dt);
        point.y = damp(point.y, targetY, 7, dt);

        // Scattered points sit back; resolved ones come forward. The field
        // brightens as it finds its structure.
        const alpha = Math.min(0.16 + own * 0.46 + glow, 1);
        ctx.fillStyle = `rgba(245, 245, 246, ${alpha.toFixed(3)})`;
        ctx.fillRect(point.x - 1, point.y - 1, 2, 2);
      }
    };

    if (still) {
      // No motion: draw the resolved grid once and leave it there.
      const paint = () => {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = "rgba(245, 245, 246, 0.55)";
        for (const point of points) ctx.fillRect(point.orderX - 1, point.orderY - 1, 2, 2);
      };
      paint();
      const repaint = new ResizeObserver(paint);
      repaint.observe(canvas);
      return () => {
        observer.disconnect();
        repaint.disconnect();
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerleave", onPointerLeave);
      };
    }

    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [still]);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
