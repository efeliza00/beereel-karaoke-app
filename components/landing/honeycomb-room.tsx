"use client";

import { BeeIcon } from "@/components/ui/bee-icon";
import useSWR from "swr";

export type HiveRoom = {
  id: string;
  roomId?: string;
  name: string;
  genre: string;
  singers: number;
  nowSinging: string;
  host: string;
  avatar: string;
  badge: string;
  activeWave?: boolean;
};

export default function HoneycombRoom({
  room,
  onJoin,
}: {
  room: HiveRoom;
  onJoin?: (roomId: string) => void;
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
    <div className="flex flex-wrap items-center gap-x-8 gap-y-2 border-b-4 border-[#3b2f21] px-4 py-4 last:border-b-0 sm:px-6">
      <div className="w-32 shrink-0">
        <p className="text-sm font-black uppercase text-[#b45309]">
          {room.badge}
        </p>
        <p className="inline-flex items-center gap-1 text-sm font-bold">
          <BeeIcon size={14} />
          {room.singers} Bees
        </p>
      </div>

      <div className="min-w-0 flex-[999_1_16rem]">
        <h3 className="truncate text-2xl font-black uppercase leading-tight tracking-tight md:text-4xl">
          {nowSinging}
        </h3>
      </div>

      <div className="min-w-0 flex-[1_1_12rem]">
        <p className="truncate font-bold">{room.name}</p>
        <p className="truncate text-sm font-medium">{room.genre}</p>
      </div>

      {room.roomId && onJoin && (
        <button
          type="button"
          onClick={() => onJoin(room.roomId as string)}
          className="min-h-11 cursor-pointer bg-[#3b2f21] px-6 font-black uppercase text-[#fdfaf3] hover:bg-[#b45309]"
        >
          Join
        </button>
      )}
    </div>
  );
}
