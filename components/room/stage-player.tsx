"use client";

import "youtube-video-element";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Mic } from "lucide-react";
import { Maximize2, Minimize2 } from "lucide-react";
import {
  VideoPlayer,
  VideoPlayerControlBar,
  VideoPlayerMuteButton,
  VideoPlayerPlayButton,
  VideoPlayerSeekBackwardButton,
  VideoPlayerSeekForwardButton,
  VideoPlayerTimeDisplay,
  VideoPlayerTimeRange,
  VideoPlayerVolumeRange,
} from "@/components/kibo-ui/video-player";
import type { QueueItem } from "./hive-tabs";
import { MusicPlayer } from "@/components/ui/music-player";
import MarqueeText from "@/components/room/marquee-text";
import {
  LiveReactions,
  type FloatingReaction,
  type ReactionEmojiId,
} from "@/components/room/live-reactions";

interface StagePlayerProps {
  video: QueueItem | null;
  onEnded?: () => void;
  canControl?: boolean;
  onMediaControl?: (cmd: { type: string; time?: number }) => void;
  onVolumeChange?: (vol: { muted: boolean; volume: number }) => void;
  onMediaCommand?: (cb: (cmd: { type: string; time?: number }) => void) => void;
  onVolumeCommand?: (cb: (vol: { muted: boolean; volume: number }) => void) => void;
  reactions?: FloatingReaction[];
  onReactionComplete?: (id: string) => void;
  onAlmostEnded?: () => void;
}

const honeyTheme = {
  "--media-primary-color": "var(--color-amber-400)",
  "--media-secondary-color": "var(--color-slate-950)",
  "--media-background-color": "var(--color-slate-950)",
} as CSSProperties;

export default function StagePlayer({
  video,
  onEnded,
  canControl = true,
  onMediaControl,
  onVolumeChange,
  onMediaCommand,
  onVolumeCommand,
  reactions = [],
  onReactionComplete,
  onAlmostEnded,
}: StagePlayerProps) {
  const mediaRef = useRef<HTMLElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const onEndedRef = useRef(onEnded);
  const pendingRemoteRef = useRef<{ type: string; expires: number } | null>(
    null,
  );
  const [guestIsPlaying, setGuestIsPlaying] = useState(false);

  useEffect(() => {
    onEndedRef.current = onEnded;
  });

  useEffect(() => {
    const onChange = () =>
      setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () =>
      document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = () => {
    const el = frameRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void el.requestFullscreen?.();
    }
  };

  useEffect(() => {
    setGuestIsPlaying(false);
    pendingRemoteRef.current = null;
  }, [video?.videoId]);

  const consumeRemoteIntent = (type: string) => {
    const pending = pendingRemoteRef.current;
    if (pending && Date.now() >= pending.expires) {
      pendingRemoteRef.current = null;
      return false;
    }
    if (pending && pending.type === type) {
      pendingRemoteRef.current = null;
      return true;
    }
    return false;
  };

  useEffect(() => {
    onMediaCommand?.((cmd) => {
      if (!canControl) {
        if (cmd.type === "play") setGuestIsPlaying(true);
        else if (cmd.type === "pause") setGuestIsPlaying(false);
        return;
      }
      const el = mediaRef.current as HTMLVideoElement | null;
      if (!el) return;

      if (cmd.type === "play") {
        pendingRemoteRef.current = {
          type: "play",
          expires: Date.now() + 3000,
        };
        if (el.paused) void el.play?.();
      } else if (cmd.type === "pause") {
        pendingRemoteRef.current = {
          type: "pause",
          expires: Date.now() + 3000,
        };
        if (!el.paused) el.pause?.();
      } else if (cmd.type === "seek" && cmd.time !== undefined) {
        if (Math.abs((el.currentTime ?? 0) - cmd.time) > 1) {
          pendingRemoteRef.current = {
            type: "seek",
            expires: Date.now() + 3000,
          };
          el.currentTime = cmd.time;
        }
      }
    });

    onVolumeCommand?.((vol) => {
      if (!canControl) return;
      const el = mediaRef.current as HTMLVideoElement | null;
      if (!el) return;
      if (
        el.muted !== vol.muted ||
        Math.abs((el.volume ?? 1) - vol.volume) > 0.02
      ) {
        pendingRemoteRef.current = {
          type: "volume",
          expires: Date.now() + 3000,
        };
        el.muted = vol.muted;
        el.volume = vol.volume;
      }
    });
  }, [onMediaCommand, onVolumeCommand, canControl]);

  useEffect(() => {
    const el = mediaRef.current;
    if (!el) return;
    el.setAttribute("autoplay", "");
  }, [video?.videoId]);

  useEffect(() => {
    const el = mediaRef.current;
    if (!el || !video) return;
    const handleEnded = () => onEndedRef.current?.();
    el.addEventListener("ended", handleEnded);
    return () => el.removeEventListener("ended", handleEnded);
  }, [video?.videoId]);

  const almostEndedFiredRef = useRef(false);

  useEffect(() => {
    almostEndedFiredRef.current = false;
  }, [video?.videoId]);

  useEffect(() => {
    const el = mediaRef.current;
    if (!el || !video || !canControl || !onAlmostEnded) return;
    const handleTimeUpdate = () => {
      if (almostEndedFiredRef.current) return;
      const duration = (el as HTMLVideoElement).duration;
      const current = (el as HTMLVideoElement).currentTime;
      if (!duration || Number.isNaN(duration)) return;
      if (current >= duration * 0.75) {
        almostEndedFiredRef.current = true;
        onAlmostEnded();
      }
    };
    el.addEventListener("timeupdate", handleTimeUpdate);
    return () => el.removeEventListener("timeupdate", handleTimeUpdate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video?.videoId, canControl]);

  useEffect(() => {
    const el = mediaRef.current;
    if (!el || !video || !canControl) return;

    const handlePlay = () => {
      if (!onMediaControl || consumeRemoteIntent("play")) return;
      onMediaControl({ type: "play" });
    };
    const handlePause = () => {
      if (!onMediaControl || consumeRemoteIntent("pause")) return;
      onMediaControl({ type: "pause" });
    };
    const handleSeeked = () => {
      if (!onMediaControl || consumeRemoteIntent("seek")) return;
      onMediaControl({
        type: "seek",
        time: (el as HTMLVideoElement).currentTime,
      });
    };
    const handleVolumeChange = () => {
      if (!onVolumeChange || consumeRemoteIntent("volume")) return;
      onVolumeChange({
        muted: (el as HTMLVideoElement).muted,
        volume: (el as HTMLVideoElement).volume,
      });
    };

    el.addEventListener("play", handlePlay);
    el.addEventListener("pause", handlePause);
    el.addEventListener("seeked", handleSeeked);
    el.addEventListener("volumechange", handleVolumeChange);
    return () => {
      el.removeEventListener("play", handlePlay);
      el.removeEventListener("pause", handlePause);
      el.removeEventListener("seeked", handleSeeked);
      el.removeEventListener("volumechange", handleVolumeChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video?.videoId, canControl]);

  if (!video) {
    return (
      <div className="relative w-full aspect-video rounded-2xl border border-amber-500/25 bg-black overflow-hidden group shadow-2xl shadow-amber-500/10">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/8 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-6">
          <Mic className="w-16 h-16 md:w-20 md:h-20 text-amber-400 animate-pulse" />
          <h2 className="text-xl md:text-2xl font-bold text-slate-100">
            Stage is yours
          </h2>
          <p className="text-xs md:text-sm text-slate-500 max-w-sm">
            Queue a song and hit play to start the performance.
          </p>
        </div>
      </div>
    );
  }

  const reactionOverlay = (
    <LiveReactions reactions={reactions} onComplete={onReactionComplete} />
  );

  if (!canControl) {
    return (
      <div className="relative w-full aspect-video rounded-2xl border border-amber-500/25 bg-slate-900 overflow-hidden shadow-2xl shadow-amber-500/10 flex flex-col items-center justify-center gap-5 p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/8 via-transparent to-transparent pointer-events-none" />
        <div className="pointer-events-none absolute -top-24 -left-24 size-64 rounded-full bg-amber-500/10 blur-3xl" />
        {reactionOverlay}
        <MusicPlayer
          key={video.videoId}
          src={`https://www.youtube.com/watch?v=${video.videoId}`}
          coverArt={
            video.thumbnail ||
            `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`
          }
          playing={guestIsPlaying}
          muted
          className="scale-75 sm:scale-90"
        />
        <div className="text-center space-y-1 max-w-md">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-red-500/50 bg-red-500/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-red-300">
            <span
              className={`size-1.5 rounded-full ${
                guestIsPlaying
                  ? "bg-red-400 animate-pulse"
                  : "bg-slate-500"
              }`}
            />
            {guestIsPlaying ? "Now Playing" : "Paused by host"}
          </p>
          <h2 className="text-base sm:text-lg font-bold text-slate-100 truncate">
            {video.title}
          </h2>
          <p className="text-xs text-slate-400 truncate">
            {video.singer} is on the mic · hosted performance
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div
        ref={frameRef}
        className="relative w-full aspect-video rounded-2xl border border-amber-500/25 bg-black overflow-hidden shadow-2xl shadow-amber-500/10"
      >
        <VideoPlayer
          key={video.videoId}
          style={honeyTheme}
          className="absolute inset-0 h-full w-full"
        >
          <youtube-video
            ref={mediaRef}
            slot="media"
            src={`https://www.youtube.com/watch?v=${video.videoId}`}
            title={video.title}
          />
          <VideoPlayerControlBar>
            <VideoPlayerPlayButton />
            <VideoPlayerSeekBackwardButton />
            <VideoPlayerSeekForwardButton />
            <VideoPlayerTimeRange />
            <VideoPlayerTimeDisplay showDuration />
            <VideoPlayerMuteButton />
            <VideoPlayerVolumeRange />
          </VideoPlayerControlBar>
        </VideoPlayer>

        {reactionOverlay}

        {/* Full screen — only overlay on the frame */}
        <button
          type="button"
          aria-label="Toggle full screen"
          title="Full screen"
          onClick={toggleFullscreen}
          className="absolute top-2.5 right-2.5 z-30 inline-flex items-center justify-center rounded-lg border border-white/10 bg-black/60 p-1.5 text-slate-200 backdrop-blur transition-colors hover:bg-black/80 hover:text-white cursor-pointer"
        >
          {isFullscreen ? (
            <Minimize2 className="size-4" />
          ) : (
            <Maximize2 className="size-4" />
          )}
        </button>
      </div>

      {/* Now Playing — below the frame */}
      <div className="flex items-center gap-3 rounded-full border border-slate-800 bg-slate-900/60 px-5 py-2.5">
        <span className="inline-flex items-center gap-1.5 shrink-0 rounded-full border border-red-500/50 bg-red-500/15 px-2.5 py-1 text-[11px] font-black uppercase tracking-widest text-red-300">
          <span className="size-2 rounded-full bg-red-400 animate-pulse" />
          Now Playing
        </span>
        <MarqueeText className="min-w-0 flex-1 text-lg font-bold text-slate-100">
          {video.title}
        </MarqueeText>
        {video.channel && (
          <span className="hidden sm:inline-block shrink-0 max-w-44 truncate rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-sm font-bold text-amber-300">
            {video.channel}
          </span>
        )}
      </div>
    </div>
  );
}
