"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type PresenceMeta = {
  roomId?: string | null;
  name?: string;
  isHost?: boolean;
};

export type ActiveHive = {
  roomId: string;
  members: number;
  host?: string;
};

/**
 * Tracks every visitor on a single global Supabase Realtime channel.
 * Returns how many clients are online, how many distinct rooms are live,
 * and the list of active rooms (with member counts + host name).
 */
export function useHivePresence(
  roomId?: string | null,
  identity?: { name?: string; isHost?: boolean },
) {
  const [activeBees, setActiveBees] = useState(0);
  const [liveHives, setLiveHives] = useState(0);
  const [activeRooms, setActiveRooms] = useState<ActiveHive[]>([]);
  const channelRef = useRef<{
    track: (meta: PresenceMeta) => Promise<unknown>;
    presenceState: () => Record<string, PresenceMeta[]>;
  } | null>(null);
  const identityRef = useRef(identity);
  identityRef.current = identity;

  useEffect(() => {
    const supabase = createClient();
    const key = `bee-${Math.random().toString(36).slice(2, 10)}`;
    const channel = supabase.channel("hive:global", {
      config: { presence: { key } },
    });
    channelRef.current = channel as unknown as NonNullable<
      typeof channelRef.current
    >;

    const sync = () => {
      const state = channel.presenceState() as Record<string, PresenceMeta[]>;
      const rooms = new Map<string, ActiveHive>();
      let bees = 0;
      for (const refs of Object.values(state)) {
        bees += 1;
        const meta = refs[refs.length - 1];
        if (!meta?.roomId) continue;
        const entry =
          rooms.get(meta.roomId) ?? { roomId: meta.roomId, members: 0 };
        entry.members += 1;
        if (!entry.host && meta.isHost && meta.name) entry.host = meta.name;
        rooms.set(meta.roomId, entry);
      }
      setActiveBees(bees);
      setLiveHives(rooms.size);
      setActiveRooms(Array.from(rooms.values()));
    };

    channel
      .on("presence", { event: "sync" }, sync)
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            roomId: roomId ?? null,
            ...(identityRef.current ?? {}),
          });
        }
      });

    return () => {
      void channel.untrack();
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [roomId]);

  // Re-track once identity resolves (host flag/name are known after room join)
  useEffect(() => {
    const channel = channelRef.current;
    if (!channel || !identity?.name) return;
    void channel.track({
      roomId: roomId ?? null,
      name: identity.name,
      isHost: identity.isHost,
    });
  }, [roomId, identity?.name, identity?.isHost]);

  return { activeBees, liveHives, activeRooms };
}
