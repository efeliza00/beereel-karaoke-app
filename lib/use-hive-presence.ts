"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type PresenceMeta = { roomId?: string | null };

/**
 * Tracks every visitor on a single global Supabase Realtime channel.
 * Returns how many clients are online and how many distinct rooms are live.
 */
export function useHivePresence(roomId?: string | null) {
  const [activeBees, setActiveBees] = useState(0);
  const [liveHives, setLiveHives] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    const key = `bee-${Math.random().toString(36).slice(2, 10)}`;
    const channel = supabase.channel("hive:global", {
      config: { presence: { key } },
    });

    const sync = () => {
      const state = channel.presenceState() as Record<
        string,
        PresenceMeta[]
      >;
      const hives = new Set<string>();
      for (const refs of Object.values(state)) {
        const meta = refs[refs.length - 1];
        if (meta?.roomId) hives.add(meta.roomId);
      }
      setActiveBees(Object.keys(state).length);
      setLiveHives(hives.size);
    };

    channel
      .on("presence", { event: "sync" }, sync)
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ roomId: roomId ?? null });
        }
      });

    return () => {
      void channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  return { activeBees, liveHives };
}
