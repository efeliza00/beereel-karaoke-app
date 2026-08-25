"use client";

import {
  VideoPlayer,
  VideoPlayerContent,
  VideoPlayerControlBar,
  VideoPlayerMuteButton,
  VideoPlayerPlayButton,
  VideoPlayerSeekBackwardButton,
  VideoPlayerSeekForwardButton,
  VideoPlayerTimeDisplay,
  VideoPlayerTimeRange,
  VideoPlayerVolumeRange,
} from "@/components/kibo-ui/video-player";

export const title = "Full control bar";

const Example = () => (
  <VideoPlayer className="aspect-video w-full max-w-2xl overflow-hidden rounded-xl border border-border">
    <VideoPlayerContent
      crossOrigin=""
      preload="metadata"
      slot="media"
      src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/video-1.mp4"
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
);

export default Example;
