"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Smoothly animates a numeric value from 0 to the target whenever the target changes.
 * Returns the formatted string (falls back to the raw display for non-numeric input).
 */
export function useCountUp(
  target: number | null | undefined,
  { duration = 900, format }: { duration?: number; format?: (value: number) => string } = {},
) {
  const [value, setValue] = useState(0);
  const frame = useRef<number | null>(null);
  const fromRef = useRef(0);

  useEffect(() => {
    if (typeof target !== "number" || !Number.isFinite(target)) {
      return;
    }

    const from = fromRef.current;
    const to = target;
    const start = performance.now();
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      fromRef.current = to;
      setValue(to);
      return;
    }

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = from + (to - from) * eased;
      setValue(current);
      if (t < 1) {
        frame.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };

    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [target, duration]);

  if (typeof target !== "number" || !Number.isFinite(target)) {
    return null;
  }

  const rounded = Math.round(value);
  return format ? format(rounded) : String(rounded);
}
