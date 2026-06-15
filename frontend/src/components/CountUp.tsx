import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  /** Raw value, e.g. "1200+", "92%", "12". Non-digits are preserved as prefix/suffix. */
  value: string;
  durationMs?: number;
  className?: string;
}

/**
 * Animates a numeric value from 0 up to its target the first time it scrolls
 * into view. Keeps any prefix/suffix (e.g. "+", "%") around the number.
 */
export default function CountUp({ value, durationMs = 1400, className = "" }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState("0");

  const match = value.match(/^(\D*)(\d[\d,]*)(.*)$/);
  const prefix = match?.[1] ?? "";
  const target = match ? Number(match[2].replace(/,/g, "")) : 0;
  const suffix = match?.[3] ?? "";

  useEffect(() => {
    const el = ref.current;
    if (!el || !match) {
      setDisplay(value);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / durationMs, 1);
          // easeOutCubic
          const eased = 1 - Math.pow(1 - p, 3);
          setDisplay(`${prefix}${Math.round(target * eased).toLocaleString()}${suffix}`);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {match ? display : value}
    </span>
  );
}
