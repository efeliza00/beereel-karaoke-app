"use client";

import { BeeIcon } from "@/components/ui/bee-icon";
import { Music } from "lucide-react";
import { motion } from "motion/react";
import useSWR from "swr";
import { cn } from "@/lib/utils";

export type HiveRoom = {
  id: string;
  roomId?: string;
  name: string;
  genre: string;
  singers: number;
  nowSinging: string;
  host: string;
  avatar: string;
  gradient: string;
  glow: string;
  border: string;
  badge: string;
  activeWave?: boolean;
};

/** Regular pointy-top hexagon */
const HEX = "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";

export default function HoneycombRoom({
  room,
  index,
}: {
  room: HiveRoom;
  index: number;
}) {
  // Live cells poll their room snapshot for the current track
  const { data: state } = useSWR<{
    currentSong: { title?: string } | null;
  }>(
    room.roomId ? `/api/rooms/${room.roomId}/state` : null,
    (url: string) => fetch(url).then((r) => r.json()),
    { refreshInterval: 15000 },
  );
  const nowSinging = room.roomId
    ? (state?.currentSong?.title ?? "Waiting for a singer…")
    : room.nowSinging;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.05, zIndex: 20 }}
      className={cn(
        "relative shrink-0",
        // stagger alternate columns into a honeycomb packing
        index % 2 === 1 && "sm:mt-12",
      )}
      style={{ filter: "drop-shadow(0 10px 24px rgba(245,158,11,0.18))" }}
    >
      {/* Gradient border layer */}
      <div
        style={{ clipPath: HEX }}
        className={cn(
          "w-44 h-[204px] sm:w-56 sm:h-[258px] bg-gradient-to-b p-[2.5px] transition-all duration-300",
          room.gradient,
        )}
      >
        {/* Inner cell */}
        <div
          style={{ clipPath: HEX }}
          className="w-full h-full bg-slate-950/95 backdrop-blur-xl"
        >
          <div className="h-full flex flex-col items-center justify-center text-center px-7 pt-7 pb-9 gap-1.5 sm:px-8 sm:gap-2">
            {/* Badge */}
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 whitespace-nowrap">
              {room.badge}
            </span>

            {/* Live bees */}
            <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-slate-300 font-bold">
              <BeeIcon size={13} className="text-amber-400" />
              {room.singers} Bees
              <span className="size-1.5 rounded-full bg-red-400 animate-pulse" />
            </span>

            {/* Name */}
            <h3 className="text-sm sm:text-base font-extrabold text-white leading-tight group-hover:text-amber-300">
              {room.name}
            </h3>
            <p className="text-[10px] sm:text-[11px] font-medium text-slate-400 -mt-1">
              {room.genre}
            </p>

            {/* Now singing */}
            <div className="w-full bg-slate-900/80 rounded-lg px-2.5 py-1.5 border border-amber-500/20 mt-1">
              <div className="flex items-center justify-center gap-1 text-[8px] uppercase tracking-wider text-amber-400 font-bold mb-0.5">
                <Music className="w-2.5 h-2.5 animate-pulse" />
                Now Singing
              </div>
              <div className="text-[11px] sm:text-xs font-bold text-white truncate">
                {nowSinging}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
