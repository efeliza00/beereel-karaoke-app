"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/** Text that scrolls horizontally when it overflows its container */
export default function MarqueeText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const outerRef = useRef<HTMLSpanElement | null>(null);
  const innerRef = useRef<HTMLSpanElement | null>(null);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const measure = () => {
      const inner = innerRef.current;
      const outer = outerRef.current;
      if (!inner || !outer) return;
      setDistance(Math.max(0, inner.scrollWidth - outer.clientWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (outerRef.current) ro.observe(outerRef.current);
    return () => ro.disconnect();
  }, [children]);

  return (
    <span
      ref={outerRef}
      className={cn("block overflow-hidden whitespace-nowrap", className)}
    >
      <motion.span
        ref={innerRef}
        className="inline-block will-change-transform"
        animate={distance > 0 ? { x: [0, -(distance + 24)] } : { x: 0 }}
        transition={
          distance > 0
            ? {
                duration: Math.max(4, (distance + 24) / 26),
                ease: "linear",
                repeat: Infinity,
                repeatDelay: 1.2,
              }
            : { duration: 0 }
        }
      >
        {children}
      </motion.span>
    </span>
  );
}
