import { useEffect, useRef } from "react";
import { clamp01, damp } from "../../lib/anim";
import { useReducedMotion } from "../../lib/useReducedMotion";

const ROWS = 3;
const SPACING = 26;
const LENGTH = 11;

/** How far the pointer's influence reaches. */
const REACH = 210;

type Filing = { x: number; y: number; angle: number };

/**
 * A band of short strokes under the closing line that turn to face the cursor.
 *
 * Iron filings over a magnet: at rest they lie flat and read as a rule, and
 * they only become a field when there is something to point at. Small, quiet,
 * and it answers the point field in "Мой подход" — that one resolves chaos into
 * a structure, this one takes a structure and gives it a direction. Two figures,
 * same family, opposite jobs, one at each end of the page.
 */
export function FilingField({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const still = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let filings: Filing[] = [];
    const pointer = { x: -9999, y: -9999, active: false };

    const build = () => {
      const box = canvas.getBoundingClientRect();
      if (box.width === 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = box.width;
      height = box.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round";

      const columns = Math.max(Math.floor(width / SPACING), 4);
      const stepX = width / columns;
      const stepY = height / (ROWS + 1);

      filings = [];
      for (let row = 1; row <= ROWS; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          filings.push({
            x: stepX * (column + 0.5),
            y: stepY * row,
            angle: 0,
          });
        }
      }
    };

    build();
    const observer = new ResizeObserver(build);
    observer.observe(canvas);

    const onMove = (event: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      pointer.x = event.clientX - box.left;
      pointer.y = event.clientY - box.top;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);

    let frame = 0;
    let last = performance.now();

    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      if (document.hidden || filings.length === 0) return;

      const box = canvas.getBoundingClientRect();
      if (box.bottom < 0 || box.top > window.innerHeight) return;

      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;

      ctx.clearRect(0, 0, width, height);

      for (const filing of filings) {
        let target = 0;
        let pull = 0;

        if (pointer.active) {
          const dx = pointer.x - filing.x;
          const dy = pointer.y - filing.y;
          const distance = Math.hypot(dx, dy);
          if (distance < REACH) {
            pull = clamp01(1 - distance / REACH) ** 1.5;
            target = Math.atan2(dy, dx);
          }
        }

        // Turning towards the target through the shorter arc; without
        // unwrapping, a stroke crossing ±π spins the long way round and the
        // whole band flickers as the cursor passes over it.
        let delta = target * pull - filing.angle;
        while (delta > Math.PI) delta -= Math.PI * 2;
        while (delta < -Math.PI) delta += Math.PI * 2;
        filing.angle = damp(filing.angle, filing.angle + delta, 9, dt);

        const half = (LENGTH / 2) * (1 + pull * 0.5);
        const dxLine = Math.cos(filing.angle) * half;
        const dyLine = Math.sin(filing.angle) * half;

        ctx.strokeStyle = `rgba(245, 245, 246, ${(0.14 + pull * 0.55).toFixed(3)})`;
        ctx.lineWidth = 1 + pull * 0.6;
        ctx.beginPath();
        ctx.moveTo(filing.x - dxLine, filing.y - dyLine);
        ctx.lineTo(filing.x + dxLine, filing.y + dyLine);
        ctx.stroke();
      }
    };

    if (still) {
      // No motion: draw the resting band once, as a rule made of strokes.
      const paint = () => {
        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = "rgba(245, 245, 246, 0.2)";
        ctx.lineWidth = 1;
        for (const filing of filings) {
          ctx.beginPath();
          ctx.moveTo(filing.x - LENGTH / 2, filing.y);
          ctx.lineTo(filing.x + LENGTH / 2, filing.y);
          ctx.stroke();
        }
      };
      paint();
      const repaint = new ResizeObserver(paint);
      repaint.observe(canvas);
      return () => {
        observer.disconnect();
        repaint.disconnect();
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerleave", onLeave);
      };
    }

    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [still]);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
