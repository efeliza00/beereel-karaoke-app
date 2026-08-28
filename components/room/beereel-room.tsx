"use client";

import HiveQrDialog from "@/components/room/hive-qr-dialog";
import HiveTabs, { type QueueItem } from "@/components/room/hive-tabs";
import StagePlayer from "@/components/room/stage-player";
import CopyButtonDemo from "@/components/shadcn-space/button/button-24";
import { Badge } from "@/components/ui/badge";
import { BeeIcon } from "@/components/ui/bee-icon";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { useHivePresence } from "@/lib/use-hive-presence";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  Crown,
  HeartHandshake,
  Hexagon,
  Lock,
  LogOut,
  Music4,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import HiveSettingsDialog from "@/components/room/hive-settings-dialog";
import HiveTipsDialog from "@/components/room/hive-tips-dialog";
import {
  ReactionPicker,
  type FloatingReaction,
  type ReactionEmojiId,
} from "@/components/room/live-reactions";
import MarqueeText from "@/components/room/marquee-text";

type BeeIdentity = { name: string; isHost: boolean };

type NectarPayload = { nectars: number; title: string; singer: string };

/** 80% chance of 90-100, 20% chance of 70-89 */
function rollNectars(): number {
  return Math.random() < 0.8
    ? 90 + Math.floor(Math.random() * 11)
    : 70 + Math.floor(Math.random() * 20);
}

type HiveSettings = {
  everyoneCanSing: boolean;
  everyoneCanControl: boolean;
  requireApproval: boolean;
  queueLimit: number;
  guestLimit: number;
  autoPlayNext: boolean;
  allowDuplicateSongs: boolean;
  roomLocked: boolean;
};

const DEFAULT_SETTINGS: HiveSettings = {
  everyoneCanSing: true,
  everyoneCanControl: false,
  requireApproval: false,
  queueLimit: 50,
  guestLimit: 20,
  autoPlayNext: true,
  allowDuplicateSongs: false,
  roomLocked: false,
};

type PresenceMeta = {
  name?: string;
  is_host?: boolean;
  user_at?: string;
  settings?: Partial<HiveSettings>;
};

type Member = {
  key: string;
  name: string;
  isHost: boolean;
  isMe: boolean;
  joinedAt?: string;
};

function getIdentity(roomId: string): BeeIdentity {
  try {
    const raw = sessionStorage.getItem(`bee:${roomId.toUpperCase()}`);
    if (raw) {
      const parsed = JSON.parse(raw) as BeeIdentity;
      if (parsed?.name) return parsed;
    }
  } catch {
    return {
      name: `Bee_${Math.floor(100 + Math.random() * 900)}`,
      isHost: false,
    };
  }
  return {
    name: `Bee_${Math.floor(100 + Math.random() * 900)}`,
    isHost: false,
  };
}

type RoomSnapshot = {
  queue: QueueItem[];
  history: QueueItem[];
  currentSong: QueueItem | null;
};

function loadRoomSnapshot(roomId: string): RoomSnapshot | null {
  try {
    const raw = localStorage.getItem(`bee-state:${roomId.toUpperCase()}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RoomSnapshot;
    if (Array.isArray(parsed?.queue)) return parsed;
  } catch {}
  return null;
}

export default function BeereelRoom({ roomId }: { roomId: string }) {
  const router = useRouter();
  const [onlineCount, setOnlineCount] = useState(0);
  const [members, setMembers] = useState<Member[]>([]);
  const [identity, setIdentity] = useState<BeeIdentity | null>(null);
  // Members already inside the hive when it gets locked/full stay in —
  // only future joiners are turned away.
  const [admitted, setAdmitted] = useState(false);
  const [settings, setSettings] = useState<HiveSettings>(DEFAULT_SETTINGS);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [history, setHistory] = useState<QueueItem[]>([]);
  const [currentSong, setCurrentSong] = useState<QueueItem | null>(null);
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);
  const [tipsReopen, setTipsReopen] = useState(0);
  const reactTimesRef = useRef<number[]>([]);
  const currentSongRef = useRef<QueueItem | null>(null);
  useEffect(() => {
    currentSongRef.current = currentSong;
  }, [currentSong]);
  const mediaCommandRef = useRef<
    (cmd: { type: string; time?: number }) => void
  >(() => {});
  const hostIsPlayingRef = useRef(false);
  const hostCurrentTimeRef = useRef(0);
  const mediaVolumeRef = useRef<
    (vol: { muted: boolean; volume: number }) => void
  >(() => {});

  const prevCount = useRef(0);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const settingsRef = useRef<HiveSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Non-host guests: when media control toggles mid-playback (on OR off),
  // resync to the host's current playing state + time so they start right
  // where it is in whichever view they land on.
  const controlEnabled = Boolean(
    identity?.isHost || settings.everyoneCanControl,
  );
  const wasControlEnabled = useRef(controlEnabled);
  useEffect(() => {
    if (!identity) return;
    if (identity.isHost) return;
    if (controlEnabled !== wasControlEnabled.current) {
      void channelRef.current?.send({
        type: "broadcast",
        event: "request-sync",
      });
    }
    wasControlEnabled.current = controlEnabled;
  }, [controlEnabled, identity]);

  const hostStateRef = useRef<RoomSnapshot>({
    queue: [],
    history: [],
    currentSong: null,
  });

  useEffect(() => {
    hostStateRef.current = { queue, history, currentSong };
  }, [queue, history, currentSong]);

  // Host: restore its authoritative list after a refresh.
  // `hydratedRoom === roomId` doubles as the "hydration done" flag.
  const [hydratedRoom, setHydratedRoom] = useState<string | null>(null);
  const hostHydrated = hydratedRoom === roomId;
  if (identity?.isHost && roomId && !hostHydrated) {
    setHydratedRoom(roomId);
    const snap = loadRoomSnapshot(roomId);
    if (snap) {
      setQueue(snap.queue ?? []);
      setHistory(snap.history ?? []);
      setCurrentSong(snap.currentSong ?? null);
    }
  }

  // Host: persist + broadcast the full list whenever it changes
  useEffect(() => {
    if (!identity?.isHost || !hostHydrated) return;
    const snap: RoomSnapshot = { queue, history, currentSong };
    try {
      localStorage.setItem(
        `bee-state:${roomId.toUpperCase()}`,
        JSON.stringify(snap),
      );
    } catch {}
    const t = setTimeout(() => {
      void channelRef.current?.send({
        type: "broadcast",
        event: "update-list",
        payload: snap,
      });
      void fetch(`/api/rooms/${roomId}/state`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(snap),
      }).catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [identity, hostHydrated, queue, history, currentSong, roomId]);

  const nowPlayingToast = useCallback((item: QueueItem) => {
    toast.custom(
      () => (
        <div className="bg-[#fdfaf3]/95 backdrop-blur-md text-[#3b2f21] border-amber-500/30 rounded-[1.75rem] flex w-[24rem] max-w-[90vw] items-center gap-3 border p-5 shadow-xl shadow-amber-500/10 transition-all duration-300">
          {item.thumbnail ? (
            <img
              src={item.thumbnail}
              alt=""
              className="size-12 shrink-0 rounded-full object-cover bg-[#efe6d2]"
            />
          ) : (
            <div className="rounded-full flex size-12 shrink-0 items-center justify-center bg-amber-400 text-[#3b2f21]">
              <Music4 className="size-6" aria-hidden="true" />
            </div>
          )}
          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#b45309]">
              Now Playing
            </p>
            <MarqueeText className="text-lg font-bold text-[#3b2f21]">
              {item.title}
            </MarqueeText>
            <p className="text-[#857558]/80 text-sm font-medium truncate">
              {item.channel}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-[11px] text-red-700 font-semibold border border-red-500/20 uppercase tracking-wider shrink-0">
            <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
            Live
          </span>
        </div>
      ),
      { duration: 5000 },
    );
  }, []);

  const [nectarScore, setNectarScore] = useState<NectarPayload | null>(null);
  const nectarTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showNectarScore = useCallback((p: NectarPayload) => {
    setNectarScore(p);
    if (nectarTimerRef.current) clearTimeout(nectarTimerRef.current);
    nectarTimerRef.current = setTimeout(() => setNectarScore(null), 5000);
  }, []);

  /** Shown during the score overlay: what's queued next */
  const upNextToast = useCallback((item: QueueItem) => {
    toast.custom(
      () => (
        <div className="bg-[#fdfaf3]/95 backdrop-blur-md text-[#3b2f21] border-amber-500/30 rounded-[1.75rem] flex w-[24rem] max-w-[90vw] items-center gap-3 border p-5 shadow-xl shadow-amber-500/10 transition-all duration-300">
          {item.thumbnail ? (
            <img
              src={item.thumbnail}
              alt=""
              className="size-12 shrink-0 rounded-full object-cover bg-[#efe6d2]"
            />
          ) : (
            <div className="rounded-full flex size-12 shrink-0 items-center justify-center bg-amber-400 text-[#3b2f21]">
              <Music4 className="size-6" aria-hidden="true" />
            </div>
          )}
          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#b45309]">
              Up Next
            </p>
            <MarqueeText className="text-lg font-bold text-[#3b2f21]">
              {item.title}
            </MarqueeText>
            <p className="text-[#857558]/80 text-sm font-medium truncate">
              {item.singer} is on the mic
            </p>
          </div>
        </div>
      ),
      { duration: 4800 },
    );
  }, []);

  // Advance-to-next timer (waits for the score overlay to finish)
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    },
    [],
  );

  const handleAlmostEnded = useCallback(() => {
    if (!currentSongRef.current) return;
    nowPlayingToast(currentSongRef.current);
    void channelRef.current?.send({
      type: "broadcast",
      event: "now-playing-toast",
      payload: currentSongRef.current,
    });
  }, [nowPlayingToast]);

  const spawnReaction = useCallback((emoji: ReactionEmojiId, from?: string) => {
    const fr: FloatingReaction = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      emoji,
      from,
      x: 50 + Math.random() * 45,
      size: 22 + Math.random() * 16,
      duration: 2.4 + Math.random() * 1.6,
      delay: Math.random() * 0.15,
    };
    setReactions((prev) => [...prev.slice(-29), fr]);
  }, []);

  const handleReact = useCallback(
    (emoji: ReactionEmojiId) => {
      const now = Date.now();
      reactTimesRef.current = reactTimesRef.current.filter(
        (t) => now - t < 1000,
      );
      if (reactTimesRef.current.length >= 5) return;
      reactTimesRef.current.push(now);
      spawnReaction(emoji, identity?.name);
      void channelRef.current?.send({
        type: "broadcast",
        event: "reaction",
        payload: { emoji, from: identity?.name },
      });
    },
    [spawnReaction, identity?.name],
  );

  useEffect(() => {
    const beeIdentity = getIdentity(roomId);
    const supabase = createClient();
    let active = true;
    let initialized = false;
    // One-shot admission check: decided from the first presence sync (join time)
    let admissionDecided = false;

    supabase
      .getChannels()
      .filter((c) => c.topic === `realtime:room:${roomId}`)
      .forEach((c) => {
        supabase.removeChannel(c);
      });

    const channel = supabase.channel(`room:${roomId}`, {
      config: {
        broadcast: { self: true },
        presence: {
          key: beeIdentity.name,
        },
      },
    });
    channelRef.current = channel;

    channel
      .on("presence", { event: "sync" }, () => {
        if (!active) return;

        const state = channel.presenceState() as Record<string, PresenceMeta[]>;
        const currentMembers: Member[] = Object.entries(state).map(
          ([key, refs]) => {
            const meta = refs[refs.length - 1] ?? {};
            return {
              key,
              name: meta.name ?? key,
              isHost: Boolean(meta.is_host),
              isMe: key === beeIdentity.name,
              joinedAt: meta.user_at,
            };
          },
        );
        currentMembers.sort((a, b) => a.name.localeCompare(b.name));

        const currentCount = currentMembers.length;

        if (initialized) {
          // member count changes tracked silently
        }

        initialized = true;
        setOnlineCount(currentCount);
        setMembers(currentMembers);
        prevCount.current = currentCount;

        const hostEntry = Object.entries(state).find(
          ([, refs]) => refs[refs.length - 1]?.is_host,
        );
        const hostMeta =
          hostEntry?.[1][hostEntry[1].length - 1]?.settings ?? undefined;
        if (hostMeta) {
          setSettings((prev) => {
            const isMatch = Object.keys(DEFAULT_SETTINGS).every(
              (key) =>
                prev[key as keyof HiveSettings] ===
                (hostMeta[key as keyof HiveSettings] ??
                  DEFAULT_SETTINGS[key as keyof HiveSettings]),
            );
            return isMatch
              ? prev
              : {
                  ...DEFAULT_SETTINGS,
                  ...hostMeta,
                };
          });
          if (!admissionDecided) {
            admissionDecided = true;
            const merged = { ...DEFAULT_SETTINGS, ...hostMeta };
            if (
              !beeIdentity.isHost &&
              !merged.roomLocked &&
              currentCount <= merged.guestLimit
            ) {
              setAdmitted(true);
            }
          }
        }
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        if (!active) return;
        const meta = newPresences?.[newPresences.length - 1] ?? {};
        const name = meta.name ?? key;
        if (
          name === beeIdentity.name ||
          name.startsWith("Bee_") ||
          name === "Bee"
        ) {
          // Ignore own join (handled separately) and auto-generated placeholders
          return;
        }
        toast(`${name} joined the hive`, {
          id: `bee-join-${key}`,
          position: "bottom-center",
          className: "bg-[#fdfaf3] text-[#3b2f21]",
        });
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        if (!active) return;
        const meta = leftPresences?.[leftPresences.length - 1] ?? {};
        const name = meta.name ?? key;
        if (
          name === beeIdentity.name ||
          name.startsWith("Bee_") ||
          name === "Bee"
        ) {
          return;
        }
        toast(`${name} left the hive`, {
          id: `bee-leave-${key}`,
          position: "bottom-center",
          className: "bg-[#fdfaf3] text-[#3b2f21]",
        });
      })
      .on("broadcast", { event: "hive-settings" }, ({ payload }) => {
        if (!active || beeIdentity.isHost) return;

        const incoming = payload as Partial<HiveSettings>;
        setSettings((prev) => ({ ...prev, ...incoming }));
        // Toast removed
      })
      .on("broadcast", { event: "media-control" }, ({ payload }) => {
        if (!active) return;
        const cmd = payload as { type: string; time?: number };
        if (mediaCommandRef.current) {
          mediaCommandRef.current(cmd);
        }
      })
      .on("broadcast", { event: "media-volume" }, ({ payload }) => {
        if (!active) return;
        const vol = payload as { muted: boolean; volume: number };
        if (mediaVolumeRef.current) {
          mediaVolumeRef.current(vol);
        }
      })
      .on("broadcast", { event: "sync-state" }, ({ payload }) => {
        if (!active || beeIdentity.isHost) return;
        const sync = payload as {
          isPlaying: boolean;
          currentTime: number;
          muted: boolean;
          volume: number;
        };
        if (mediaCommandRef.current) {
          if (sync.isPlaying) {
            mediaCommandRef.current({ type: "play" });
          } else {
            mediaCommandRef.current({ type: "pause" });
          }
        }
        if (sync.currentTime > 0 && mediaCommandRef.current) {
          mediaCommandRef.current({ type: "seek", time: sync.currentTime });
        }
        if (mediaVolumeRef.current) {
          mediaVolumeRef.current({
            muted: sync.muted,
            volume: sync.volume,
          });
        }
      })
      .on("broadcast", { event: "queue-add" }, ({ payload }) => {
        if (!active) return;

        const item = payload as QueueItem;
        setQueue((prev) =>
          prev.some((q) => q.videoId === item.videoId) ? prev : [...prev, item],
        );
        // Toast removed
      })
      .on("broadcast", { event: "update-list" }, ({ payload }) => {
        if (!active || beeIdentity.isHost) return;

        const snap = payload as RoomSnapshot;
        setQueue(snap.queue ?? []);
        setHistory(snap.history ?? []);
        setCurrentSong(snap.currentSong ?? null);
      })
      .on("broadcast", { event: "request-sync" }, () => {
        if (!active || !beeIdentity.isHost) return;

        void channelRef.current?.send({
          type: "broadcast",
          event: "sync-state",
          payload: {
            isPlaying: hostIsPlayingRef.current,
            currentTime: hostCurrentTimeRef.current,
            muted: false,
            volume: 1,
          },
        });
      })
      .on("broadcast", { event: "request-state" }, () => {
        if (!active || !beeIdentity.isHost) return;

        // Send the authoritative room snapshot to the newly joined client
        void channelRef.current?.send({
          type: "broadcast",
          event: "update-list",
          payload: hostStateRef.current,
        });
      })
      .on("broadcast", { event: "reaction" }, ({ payload }) => {
        if (!active) return;
        const { emoji, from } = payload as {
          emoji: ReactionEmojiId;
          from?: string;
        };
        // `self: true` echoes our own broadcast; we already spawned locally
        // in handleReact, so skip to avoid doubling.
        if (from === beeIdentity.name) return;
        spawnReaction(emoji, from);
      })
      .on("broadcast", { event: "now-playing-toast" }, ({ payload }) => {
        if (!active || beeIdentity.isHost) return;
        nowPlayingToast(payload as QueueItem);
      })
      .on("broadcast", { event: "nectars-earned" }, ({ payload }) => {
        if (!active || beeIdentity.isHost) return;
        showNectarScore(payload as NectarPayload);
      })
      .on("broadcast", { event: "up-next" }, ({ payload }) => {
        if (!active || beeIdentity.isHost) return;
        upNextToast(payload as QueueItem);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED" && active) {
          await channel.track({
            name: beeIdentity.name,
            is_host: beeIdentity.isHost,
            user_at: new Date().toISOString(),
            ...(beeIdentity.isHost ? { settings: settingsRef.current } : {}),
          });
          setIdentity(beeIdentity);
          if (beeIdentity.isHost) {
            // Register the room immediately so it counts in global stats
            void fetch(`/api/rooms/${roomId}/state`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(hostStateRef.current),
            }).catch(() => {});
          } else {
            void channel.send({
              type: "broadcast",
              event: "request-state",
            });
            void channel.send({
              type: "broadcast",
              event: "request-sync",
            });
          }
          toast("You joined the hive", {
            id: `bee-${roomId}-join`,
            position: "bottom-center",
            className: "bg-[#fdfaf3] text-[#3b2f21]",
          });
        }
      });

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const host = members.find((m) => m.isHost);

  useHivePresence(
    roomId,
    identity ? { name: identity.name, isHost: identity.isHost } : undefined,
  );

  const isBlocked = Boolean(
    identity &&
    !identity.isHost &&
    !admitted &&
    (settings.roomLocked || onlineCount > settings.guestLimit),
  );

  useEffect(() => {
    if (isBlocked) {
      void channelRef.current?.untrack();
      toast.warning(
        settings.roomLocked
          ? "The hive is locked by the host."
          : "The hive is full.",
        {
          className: "bg-[#fdfaf3] text-[#3b2f21]",
        },
      );
    }
  }, [isBlocked, settings.roomLocked]);

  const initials = (name: string) =>
    name
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 2)
      .toUpperCase() || "BE";

  return (
    <div className="min-h-dvh bg-[#f7f1e4] text-[#3b2f21] font-sans flex flex-col">
      {!isBlocked && <HiveTipsDialog reopenSignal={tipsReopen} />}
      {isBlocked && (
        <div className="fixed inset-0 bg-[#f7f1e4]/90 z-50 flex items-center justify-center p-4">
          <div className="bg-[#fdfaf3] border border-amber-500/25 rounded-2xl p-8 text-center max-w-sm shadow-2xl shadow-amber-500/10">
            <Lock className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-black text-amber-500 mb-2">
              {settings.roomLocked ? "This Hive is Locked" : "Hive is Full"}
            </h2>
            <p className="text-sm text-[#857558] mb-6">
              {settings.roomLocked
                ? "The host has locked this hive room."
                : `Capacity reached (${settings.guestLimit} bee${
                    settings.guestLimit !== 1 ? "s" : ""
                  } max). Try again later.`}
            </p>
            <Button
              onClick={() => router.push("/")}
              className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-[#3b2f21] font-black hover:from-amber-300 hover:to-amber-400 cursor-pointer"
            >
              Back to Landing
            </Button>
          </div>
        </div>
      )}

      {/* Room Navbar */}
      <header className="sticky top-0 z-40 border-b border-amber-500/20 bg-[#fdfaf3]/80 backdrop-blur-xl">
        <div className="w-full px-3 sm:px-4 md:px-6 h-14 md:h-16 flex items-center justify-between gap-1.5 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Hexagon className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400 shrink-0" />
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base md:text-lg font-black leading-tight truncate">
                Hive Room: {roomId}
              </h1>
              <p className="text-[10px] sm:text-[11px] text-[#857558] flex items-center gap-1 font-bold truncate">
                Host:{" "}
                {host ? (
                  <span className="inline-flex items-center gap-1 text-[#b45309]">
                    <Crown size={11} /> {host.name}
                  </span>
                ) : (
                  "No host yet"
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
            <CopyButtonDemo text={roomId} iconOnly className="sm:hidden" />
            <CopyButtonDemo text={roomId} className="hidden sm:inline-flex" />
            <HiveQrDialog
              roomId={roomId}
              locked={settings.roomLocked}
              full={onlineCount >= settings.guestLimit}
              capacity={settings.guestLimit}
            />
            {identity?.isHost && (
              <HiveSettingsDialog
                settings={settings}
                onUpdate={(newSettings) => {
                  setSettings(newSettings);
                  void channelRef.current?.send({
                    type: "broadcast",
                    event: "hive-settings",
                    payload: newSettings,
                  });
                  channelRef.current?.track({
                    name: identity.name,
                    is_host: identity.isHost,
                    user_at: new Date().toISOString(),
                    settings: newSettings,
                  });
                }}
              />
            )}
            <Dialog>
              <DialogTrigger
                render={
                  <button
                    type="button"
                    aria-label="Show bees in the hive"
                    className="hidden md:flex items-center gap-1.5 text-sm text-[#3b2f21] font-bold px-2 md:px-3 cursor-pointer hover:opacity-80 transition-opacity bg-transparent border-0"
                  />
                }
              >
                <BeeIcon size={16} className="text-amber-400" />
                {onlineCount}
              </DialogTrigger>
              <DialogContent className="data-open:slide-in-from-top-8 data-closed:slide-out-to-top-8 data-open:zoom-in-100 data-closed:zoom-out-100 duration-300 [[data-slot=dialog-overlay]:has(~_&)]:duration-300">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <BeeIcon size={16} className="text-amber-400" />
                    Bees in the Hive
                  </DialogTitle>
                  <DialogDescription>
                    {onlineCount} bee{onlineCount !== 1 ? "s" : ""} currently
                    singing in room {roomId}.
                  </DialogDescription>
                </DialogHeader>
                <ul className="max-h-80 overflow-y-auto space-y-1.5 pr-1">
                  {members.map((m) => (
                    <li
                      key={m.key}
                      className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${
                        m.isHost
                          ? "border-[#f59e0b]/50 bg-[#f59e0b]/10"
                          : "border-[#eadfc9] bg-[#fdfaf3]/60"
                      }`}
                    >
                      <span
                        className={`size-8 shrink-0 rounded-full border flex items-center justify-center text-[11px] font-black ${
                          m.isHost
                            ? "border-[#f59e0b] bg-[#f59e0b]/20 text-[#b45309]"
                            : "border-[#eadfc9] bg-[#efe6d2] text-[#857558]"
                        }`}
                      >
                        {initials(m.name)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold truncate flex items-center gap-1.5">
                          {m.isHost && (
                            <Crown
                              size={12}
                              className="text-amber-500 shrink-0"
                            />
                          )}
                          <span
                            className={
                              m.isHost ? "text-[#b45309]" : "text-[#3b2f21]"
                            }
                          >
                            {m.name}
                          </span>
                          {m.isMe && (
                            <span className="text-[10px] uppercase tracking-wider text-amber-500">
                              (You)
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-[#857558] font-medium">
                          {m.joinedAt
                            ? `Joined ${new Date(m.joinedAt).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" },
                              )}`
                            : "In the hive"}
                        </p>
                      </div>
                      {m.isHost && (
                        <Badge
                          variant="outline"
                          className="text-[#b45309] border-[#f59e0b]/40 shrink-0 text-[10px]"
                        >
                          HOST
                        </Badge>
                      )}
                    </li>
                  ))}
                </ul>
              </DialogContent>
            </Dialog>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTipsReopen((n) => n + 1)}
              className="gap-1.5 cursor-pointer border-[#f59e0b]/40 text-[#b45309] hover:bg-[#f59e0b]/10 hover:text-[#451a03] px-2.5 sm:px-3"
            >
              <HeartHandshake size={14} />
              <span className="hidden xs:inline sm:inline">Tip</span>
            </Button>
            <Dialog>
              <DialogTrigger
                render={
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-1.5 cursor-pointer px-2.5 sm:px-3"
                  />
                }
              >
                <LogOut size={14} />
                <span className="hidden xs:inline sm:inline">Leave</span>
              </DialogTrigger>
              <DialogContent
                className="data-open:slide-in-from-top-8 data-closed:slide-out-to-top-8 data-open:zoom-in-100 data-closed:zoom-out-100 duration-300 [[data-slot=dialog-overlay]:has(~_&)]:duration-300 border-[#eadfc9] bg-[#fdfaf3] max-w-xs"
                showCloseButton={false}
              >
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="flex items-center justify-center size-12 rounded-full bg-red-500/10 text-red-600">
                    <LogOut size={20} />
                  </div>
                  <DialogHeader className="items-center">
                    <DialogTitle>Leave the hive?</DialogTitle>
                    <DialogDescription className="text-[#857558]">
                      You will stop watching the performance. The queue stays
                      alive — you can rejoin anytime.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex gap-2 w-full">
                    <DialogClose
                      render={
                        <Button
                          variant="outline"
                          className="flex-1 cursor-pointer border-[#eadfc9] hover:bg-[#efe6d2]"
                        />
                      }
                    >
                      Stay
                    </DialogClose>
                    <DialogClose
                      render={
                        <Button
                          variant="destructive"
                          onClick={() => router.push("/")}
                          className="flex-1 cursor-pointer"
                        />
                      }
                    >
                      Leave
                    </DialogClose>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* 3/4 Stage + 1/4 Reserved Panel */}
      <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-5 px-4 pt-0 pb-4 md:p-6 lg:px-6 items-start">
        {/* Video Section */}
        <section className="space-y-2 min-w-0 -mx-4 md:mx-0">
          {/* Video Player Area */}
          <StagePlayer
            video={currentSong}
            canControl={Boolean(
              identity?.isHost || settings.everyoneCanControl,
            )}
            onMediaControl={(cmd) => {
              if (cmd.type === "play") hostIsPlayingRef.current = true;
              else if (cmd.type === "pause") hostIsPlayingRef.current = false;
              void channelRef.current?.send({
                type: "broadcast",
                event: "media-control",
                payload: cmd,
              });
            }}
            onVolumeChange={(vol) => {
              void channelRef.current?.send({
                type: "broadcast",
                event: "media-volume",
                payload: vol,
              });
            }}
            onTimeUpdate={(time) => (hostCurrentTimeRef.current = time)}
            onVolumeCommand={(cb) => (mediaVolumeRef.current = cb)}
            onMediaCommand={(cb) => (mediaCommandRef.current = cb)}
            reactions={reactions}
            onReactionComplete={(id) =>
              setReactions((prev) => prev.filter((r) => r.id !== id))
            }
            onAlmostEnded={handleAlmostEnded}
            nectarScore={nectarScore}
            viewerName={identity?.name}
            onEnded={() => {
              if (!identity?.isHost) return;
              const endedSong = currentSongRef.current;
              const next = queue[0];

              // Score overlay + broadcast
              if (endedSong) {
                const payload: NectarPayload = {
                  nectars: rollNectars(),
                  title: endedSong.title,
                  singer: endedSong.singer,
                };
                showNectarScore(payload);
                void channelRef.current?.send({
                  type: "broadcast",
                  event: "nectars-earned",
                  payload,
                });
              }

              // Up-next sonner during the overlay window
              if (next) {
                upNextToast(next);
                void channelRef.current?.send({
                  type: "broadcast",
                  event: "up-next",
                  payload: next,
                });
              }

              // Hold the stage until the score overlay is gone, then advance
              if (advanceTimerRef.current)
                clearTimeout(advanceTimerRef.current);
              advanceTimerRef.current = setTimeout(() => {
                if (!next) {
                  setCurrentSong(null);
                  return;
                }
                const stamped = {
                  ...next,
                  playedAt: new Date().toISOString(),
                };
                setQueue((prev) => prev.slice(1));
                setHistory((prev) => [stamped, ...prev].slice(0, 50));
                setCurrentSong(stamped);
              }, 5000);
            }}
          />
        </section>

        {/* Right Panel — Queue / Search / SongList */}
        <aside className="min-h-[500px] lg:min-h-[600px] pb-20 md:pb-0 flex flex-col gap-3">
          <HiveTabs
            queue={queue}
            history={history}
            currentSong={currentSong}
            canAddToQueue={Boolean(
              identity?.isHost || settings.everyoneCanSing,
            )}
            canPlay={Boolean(identity?.isHost)}
            singerName={identity?.name ?? "A bee"}
            onSongPlay={(item) => {
              if (!identity?.isHost) return;
              const stamped = { ...item, playedAt: new Date().toISOString() };
              setQueue((prev) =>
                prev.filter((q) => q.videoId !== item.videoId),
              );
              setHistory((prev) => [stamped, ...prev].slice(0, 50));
              setCurrentSong(stamped);
            }}
            onQueueAdd={(item) => {
              if (identity?.isHost) {
                setQueue((prev) =>
                  prev.some((q) => q.videoId === item.videoId)
                    ? prev
                    : [...prev, { ...item }],
                );
              }
              void channelRef.current?.send({
                type: "broadcast",
                event: "queue-add",
                payload: item,
              });
              toast.success(`"${item.title}" added to the queue`, {
                id: `bee-${roomId}-queue-self`,
                className: "bg-[#fdfaf3] text-[#3b2f21]",
              });
            }}
          />

          <ReactionPicker onReact={handleReact} className="hidden md:flex" />
        </aside>

        {/* Mobile — floating reaction dock */}
        <div className="fixed bottom-4 inset-x-0 z-40 flex justify-center px-4 pointer-events-none md:hidden">
          <ReactionPicker
            onReact={handleReact}
            className="pointer-events-auto border-[#eadfc9] bg-[#fdfaf3]/90 shadow-2xl shadow-amber-500/25"
          />
        </div>
      </div>
    </div>
  );
}
