"use client";

import "youtube-video-element";

import FaultyTerminal from "@/components/FaultyTerminal";
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
import {
  LiveReactions,
  type FloatingReaction,
} from "@/components/room/live-reactions";
import MarqueeText from "@/components/room/marquee-text";
import { NumberTicker } from "@/components/shadcn-space/number-ticker/number-ticker-01";
import {
  Droplet,
  Maximize2,
  Mic,
  Minimize2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { QueueItem } from "./hive-tabs";

export type NectarScore = {
  nectars: number;
  title: string;
  singer: string;
};

interface StagePlayerProps {
  video: QueueItem | null;
  onEnded?: () => void;
  canControl?: boolean;
  onMediaControl?: (cmd: { type: string; time?: number }) => void;
  onVolumeChange?: (vol: { muted: boolean; volume: number }) => void;
  onMediaCommand?: (cb: (cmd: { type: string; time?: number }) => void) => void;
  onVolumeCommand?: (
    cb: (vol: { muted: boolean; volume: number }) => void,
  ) => void;
  reactions?: FloatingReaction[];
  onReactionComplete?: (id: string) => void;
  onAlmostEnded?: () => void;
  onTimeUpdate?: (time: number) => void;
  nectarScore?: NectarScore | null;
  viewerName?: string;
}

const honeyTheme = {
  "--media-primary-color": "var(--color-amber-400)",
  "--media-secondary-color": "#f7f1e4",
  "--media-background-color": "#f7f1e4",
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
  onTimeUpdate,
  nectarScore = null,
  viewerName,
}: StagePlayerProps) {
  const mediaRef = useRef<HTMLElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const onEndedRef = useRef(onEnded);
  const pendingRemoteRef = useRef<{ type: string; expires: number } | null>(
    null,
  );
  const [guestIsPlaying, setGuestIsPlaying] = useState(false);
  const [guestMuted, setGuestMuted] = useState(true);
  const guestSeekTimeRef = useRef<number | null>(null);
  const [guestSeekEpoch, setGuestSeekEpoch] = useState(0);
  const [prevVideoId, setPrevVideoId] = useState<string | undefined>(
    video?.videoId,
  );

  // Reset guest playback state when the video changes. Adjusting state during
  // render (React's recommended pattern) avoids cascading renders.
  if (prevVideoId !== video?.videoId) {
    setPrevVideoId(video?.videoId);
    setGuestIsPlaying(false);
    setGuestMuted(true);
  }

  // Clear pending remote intent + seek target when video changes
  useEffect(() => {
    pendingRemoteRef.current = null;
    guestSeekTimeRef.current = null;
  }, [video?.videoId]);

  useEffect(() => {
    onEndedRef.current = onEnded;
  });

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
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
        else if (cmd.type === "seek" && cmd.time !== undefined) {
          guestSeekTimeRef.current = cmd.time;
          setGuestSeekEpoch((n) => n + 1);
        }
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
    const el = mediaRef.current as HTMLVideoElement | null;
    if (!el) return;
    if (canControl) {
      el.setAttribute("autoplay", "");
      return;
    }
  }, [video?.videoId, canControl]);

  // Non-control guests: follow the host's play state + seek target
  useEffect(() => {
    const el = mediaRef.current as HTMLElement | null;
    if (!el || canControl) return;
    // Hide native YouTube player controls for guests
    el.setAttribute("controls", "false");
    el.setAttribute("playsinline", "");
  }, [video?.videoId, canControl]);

  useEffect(() => {
    const el = mediaRef.current as HTMLVideoElement | null;
    if (!el || canControl) return;
    el.muted = guestMuted;
    if (guestSeekTimeRef.current != null) {
      el.currentTime = guestSeekTimeRef.current;
      guestSeekTimeRef.current = null;
    }
    if (guestIsPlaying) {
      void el.play?.().catch(() => {});
    } else {
      el.pause?.();
    }
  }, [guestIsPlaying, guestMuted, guestSeekEpoch, canControl]);

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

  // Report host playback time so late joiners can resync
  useEffect(() => {
    const el = mediaRef.current;
    if (!el || !video || !canControl || !onTimeUpdate) return;
    const handleTime = () => {
      onTimeUpdate((el as HTMLVideoElement).currentTime);
    };
    el.addEventListener("timeupdate", handleTime);
    return () => el.removeEventListener("timeupdate", handleTime);
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
      <div className="relative w-full aspect-video bg-black overflow-hidden group shadow-2xl shadow-amber-500/10">
        <FaultyTerminal
          className="absolute inset-0 w-full h-full"
          style={{
            "--terminal-glow-color": "#fbbf24",
            "--terminal-glow-opacity": "0.2",
          }}
          message="No song is currently queued."
          scale={1}
          digitSize={1.7}
          scanlineIntensity={0.3}
          glitchAmount={1}
          flickerAmount={1}
          noiseAmp={0.3}
          chromaticAberration={0}
          dither={0}
          curvature={0.2}
          tint="#EAB308"
          mouseReact
          mouseStrength={0.2}
          brightness={1}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-6">
          <div className="flex flex-col items-center gap-4 text-center px-6 py-8 rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
            <Mic className="w-16 h-16 md:w-20 md:h-20 text-amber-400 animate-pulse" />
            <h2 className="text-xl md:text-2xl font-bold text-amber-300">
              Stage is yours
            </h2>
            <p className="text-xs md:text-sm text-amber-200/70 max-w-sm">
              Queue a song and hit play to start the performance.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const reactionOverlay = (
    <LiveReactions reactions={reactions} onComplete={onReactionComplete} />
  );

  const isSelfScore = nectarScore?.singer === viewerName;

  const nectarOverlay = (
    <AnimatePresence>
      {nectarScore && (
        <motion.div
          key="nectar-score"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-1.5 text-center px-6">
            <div className="mb-1 rounded-full flex size-16 items-center justify-center bg-gradient-to-br from-amber-300 to-amber-500 text-slate-950 shadow-xl shadow-amber-500/40">
              <Droplet
                className="size-8 fill-slate-950/25"
                aria-hidden="true"
              />
            </div>
            <NumberTicker
              end={nectarScore.nectars}
              start={0}
              duration={1.5}
              className="text-4xl sm:text-5xl font-black leading-none text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400 drop-shadow-lg"
            />
            <p className="text-sm font-black uppercase tracking-widest text-amber-500">
              Nectars
            </p>
            <p className="text-xs font-bold uppercase tracking-widest text-[#3b2f21]">
              {isSelfScore ? "Your Score" : `${nectarScore.singer}'s Score`}
            </p>
            <MarqueeText className="max-w-xs text-sm font-semibold text-[#857558]">
              {nectarScore.title}
            </MarqueeText>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="space-y-2">
      <div
        ref={frameRef}
        className="relative w-full aspect-video bg-black overflow-hidden shadow-2xl shadow-amber-500/10"
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
          {canControl && (
            <VideoPlayerControlBar>
              <VideoPlayerPlayButton />
              <VideoPlayerSeekBackwardButton />
              <VideoPlayerSeekForwardButton />
              <VideoPlayerTimeRange />
              <VideoPlayerTimeDisplay showDuration />
              <VideoPlayerMuteButton />
              <VideoPlayerVolumeRange />
            </VideoPlayerControlBar>
          )}
        </VideoPlayer>

        {reactionOverlay}

        {/* When the guest can't control, block native video clicks so they
            can't play/pause/seek — the video element itself stays mounted
            across the toggle so playback stays seamless. */}
        {!canControl && (
          <div
            className="absolute inset-0 z-10 cursor-default"
            onDoubleClick={(e) => e.stopPropagation()}
          />
        )}

        {/* Guest-only mute/unmute toggle (host controls the actual playback) */}
        {!canControl && (
          <button
            type="button"
            aria-label={guestMuted ? "Unmute" : "Mute"}
            title={guestMuted ? "Unmute" : "Mute"}
            onClick={() => setGuestMuted((m) => !m)}
            className="absolute bottom-3 left-3 z-20 inline-flex items-center justify-center rounded-lg border border-white/10 bg-black/60 p-2.5 text-white backdrop-blur transition-colors hover:bg-black/80 hover:text-white cursor-pointer"
          >
            {guestMuted ? (
              <VolumeX className="size-5" />
            ) : (
              <Volume2 className="size-5" />
            )}
          </button>
        )}

        {/* Full screen overlay */}
        <button
          type="button"
          aria-label="Toggle full screen"
          title="Full screen"
          onClick={toggleFullscreen}
          className={`absolute top-3 right-3 z-30 inline-flex items-center justify-center rounded-lg border border-white/10 bg-black/60 p-2.5 text-white backdrop-blur transition-colors hover:bg-black/80 hover:text-white cursor-pointer ${
            canControl ? "" : "z-20"
          }`}
        >
          {isFullscreen ? (
            <Minimize2 className="size-6" />
          ) : (
            <Maximize2 className="size-6" />
          )}
        </button>

        {nectarOverlay}
      </div>

      {/* Now Playing — below the frame */}
      <div className="flex items-center gap-3 px-5 md:px-0 py-2.5">
        <span className="inline-flex items-center gap-1.5 shrink-0 rounded-full border border-red-500/50 bg-red-500/15 px-2.5 py-1 text-[11px] font-black uppercase tracking-widest text-red-700">
          <span className="size-2 rounded-full bg-red-500 animate-pulse" />
          Now Playing
        </span>
        <MarqueeText className="min-w-0 flex-1 text-lg font-bold text-[#3b2f21]">
          {video.title}
        </MarqueeText>
        {video.channel && (
          <span className="hidden sm:inline-block shrink-0 max-w-44 truncate rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-sm font-bold text-[#b45309]">
            {video.channel}
          </span>
        )}
      </div>
    </div>
  );
}
