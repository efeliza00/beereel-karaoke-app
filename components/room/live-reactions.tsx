"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export type ReactionEmojiId =
  | "heart"
  | "laugh"
  | "wow"
  | "clap"
  | "fire"
  | "bee";

export const REACTION_EMOJIS: {
  id: ReactionEmojiId;
  glyph: string;
  label: string;
}[] = [
  { id: "heart", glyph: "❤️", label: "Love" },
  { id: "laugh", glyph: "😂", label: "Haha" },
  { id: "wow", glyph: "😮", label: "Wow" },
  { id: "clap", glyph: "👏", label: "Clap" },
  { id: "fire", glyph: "🔥", label: "Fire" },
  { id: "bee", glyph: "🐝", label: "Buzz" },
];

export type FloatingReaction = {
  id: string;
  emoji: ReactionEmojiId;
  /** display name of who reacted */
  from?: string;
  /** horizontal start position as % from left */
  x: number;
  size: number;
  duration: number;
  delay: number;
};

/** Floating emoji layer rendered inside the video/stage frame */
export function LiveReactions({
  reactions,
  onComplete,
  className,
}: {
  reactions: FloatingReaction[];
  onComplete?: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-20 overflow-hidden",
        className,
      )}
    >
      {reactions.map((r) => (
        <motion.span
          key={r.id}
          className="absolute bottom-3 flex flex-col items-center gap-1 select-none drop-shadow-lg"
          style={{ left: `${r.x}%` }}
          initial={{ opacity: 0, y: 12 }}
          animate={{
            opacity: [0, 1, 1],
            y: -280,
            x: [0, 16, -14, 10, 0],
            rotate: [0, 8, -6, 4, 0],
          }}
          transition={{
            duration: r.duration,
            delay: r.delay,
            ease: "easeOut",
            opacity: { duration: r.duration, times: [0, 0.08, 1] },
          }}
          onAnimationComplete={() => onComplete?.(r.id)}
        >
          {/* Phase 1 — show who reacted first */}
          <motion.span
            className="rounded-full border border-white/10 bg-[#3b2f21]/70 px-2 py-0.5 text-[10px] font-black whitespace-nowrap text-amber-200"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.6, 1, 1, 0.75] }}
            transition={{
              duration: r.duration * 0.55,
              ease: "easeOut",
              times: [0, 0.15, 0.6, 1],
            }}
          >
            {r.from ?? "A bee"}
          </motion.span>

          {/* Phase 2 — morph into the emoji */}
          <motion.span
            style={{ fontSize: `${r.size}px`, lineHeight: 1 }}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: [0, 0, 1, 1], scale: [0.4, 0.5, 1.25, 1] }}
            transition={{
              duration: r.duration,
              ease: "easeOut",
              times: [0, 0.2, 0.38, 1],
            }}
          >
            {REACTION_EMOJIS.find((e) => e.id === r.emoji)?.glyph ?? "❤️"}
          </motion.span>
        </motion.span>
      ))}
    </div>
  );
}

/** Emoji buttons bar placed below the tabs card */
export function ReactionPicker({
  onReact,
  className,
}: {
  onReact?: (emoji: ReactionEmojiId) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 rounded-full border border-amber-500/25 bg-[#fdfaf3] px-5 py-2.5 shadow-lg shadow-amber-500/5 backdrop-blur",
        className,
      )}
    >
      {REACTION_EMOJIS.map((e) => (
        <button
          key={e.id}
          type="button"
          aria-label={`React ${e.label}`}
          title={e.label}
          onClick={() => onReact?.(e.id)}
          className="cursor-pointer px-1 text-3xl leading-none transition-transform hover:scale-125 active:scale-95"
        >
          {e.glyph}
        </button>
      ))}
    </div>
  );
}
