"use client";

import MarqueeText from "@/components/room/marquee-text";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  History,
  ListMusic,
  Music,
  Play,
  Plus,
  Radio,
  Search,
} from "lucide-react";
import type { Transition, Variants } from "motion/react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import useSWR from "swr";

export type QueueItem = {
  videoId: string;
  title: string;
  channel: string;
  length: string;
  thumbnail?: string;
  singer: string;
  playedAt?: string;
};

type SearchResult = Omit<QueueItem, "singer">;

type SearchResponse = { results: SearchResult[] };

async function fetcher(url: string) {
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Search failed");
  return data as SearchResponse;
}

const tabs = [
  { id: "queue", label: "Queue", icon: ListMusic },
  { id: "search", label: "Search", icon: Search },
  { id: "history", label: "History", icon: History },
];

const variants: Variants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 48 : -48,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -48 : 48,
    opacity: 0,
  }),
};

const transition: Transition = {
  type: "spring",
  stiffness: 340,
  damping: 32,
};

interface HiveTabsProps {
  queue: QueueItem[];
  history: QueueItem[];
  currentSong: QueueItem | null;
  onQueueAdd: (item: QueueItem) => void;
  onSongPlay: (item: QueueItem) => void;
  canAddToQueue: boolean;
  canPlay: boolean;
  singerName?: string;
}

export default function HiveTabs({
  queue,
  history,
  currentSong,
  onQueueAdd,
  onSongPlay,
  canAddToQueue,
  canPlay,
  singerName = "You",
}: HiveTabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [direction, setDirection] = useState(1);

  const [queryInput, setQueryInput] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(queryInput.trim()), 450);
    return () => clearTimeout(t);
  }, [queryInput]);

  const handleTabChange = (newId: string) => {
    const prevIdx = tabs.findIndex((t) => t.id === activeTab);
    const nextIdx = tabs.findIndex((t) => t.id === newId);
    setDirection(nextIdx > prevIdx ? 1 : -1);
    setActiveTab(newId);
  };

  return (
    <div className="w-full h-full flex flex-col rounded-2xl border border-amber-500/25 bg-slate-900/50 overflow-hidden shadow-lg shadow-amber-500/5">
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full flex flex-col flex-1 min-h-0"
      >
        <TabsList
          variant="line"
          className="shrink-0 flex w-full border-b border-amber-500/20 bg-transparent p-0! rounded-none h-auto! gap-0! justify-start!"
          onMouseLeave={() => setHoveredTab(null)}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isHovered = hoveredTab === tab.id;

            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                onMouseEnter={() => setHoveredTab(tab.id)}
                className={cn(
                  "relative flex items-center justify-center cursor-pointer text-xs font-black uppercase tracking-wider transition-colors outline-none whitespace-nowrap bg-transparent",
                  "data-[state=active]:bg-transparent data-[state=active]:text-foreground",
                  "border-transparent data-[state=active]:border-transparent shadow-none data-[state=active]:shadow-none after:hidden",
                  isActive
                    ? "text-amber-200"
                    : "text-slate-500 hover:text-slate-300",
                )}
              >
                <span className="relative flex items-center gap-1.5 px-3 py-3 sm:px-4 rounded-md z-10">
                  {isHovered && (
                    <motion.span
                      layoutId="hive-tabs-hover"
                      className="absolute inset-0 bg-amber-500/10 rounded-md pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <Icon className="w-3.5 h-3.5 relative z-10" />
                  <span className="relative z-10">{tab.label}</span>
                </span>

                {isActive && (
                  <motion.div
                    layoutId="hive-tabs-indicator"
                    className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-amber-400"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <div className="relative overflow-hidden flex-1 min-h-[460px]">
          <AnimatePresence mode="wait" custom={direction}>
            <PanelShell key={activeTab} dir={direction}>
              {activeTab === "queue" && (
                <div>
                  {currentSong && (
                    <div className="mb-6">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 mb-2 flex items-center gap-1.5">
                        <Radio size={12} className="animate-pulse" /> Now
                        Playing
                      </p>
                      <div className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3">
                        {currentSong.thumbnail && (
                          <img
                            src={currentSong.thumbnail}
                            alt=""
                            className="w-16 h-10 rounded-md object-cover shrink-0 bg-slate-800"
                            loading="lazy"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <MarqueeText className="text-sm font-bold text-amber-100">
                            {currentSong.title}
                          </MarqueeText>
                          <p className="text-[11px] text-amber-300/70 truncate">
                            {currentSong.singer}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">
                    Up Next · {queue.length}
                  </p>
                  {queue.length === 0 ? (
                    <p className="mt-8 text-xs text-slate-600 text-center leading-relaxed">
                      The queue is empty. Search for a song to get the hive
                      singing.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {queue.map((song, i) => (
                        <li
                          key={song.videoId}
                          className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2.5"
                        >
                          <span className="size-6 shrink-0 rounded-full bg-amber-500/15 text-amber-300 text-[11px] font-black flex items-center justify-center">
                            {i + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-slate-200 truncate">
                              {song.title}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {song.channel}
                            </p>
                          </div>
                          <span className="text-[10px] font-bold text-amber-300/80 truncate max-w-20 shrink-0">
                            {song.singer}
                          </span>
                          {canPlay && (
                            <button
                              type="button"
                              onClick={() => onSongPlay(song)}
                              aria-label={`Play ${song.title}`}
                              title="Play now"
                              className="size-6 shrink-0 rounded-full bg-amber-500/15 text-amber-300 hover:bg-amber-500/40 flex items-center justify-center cursor-pointer transition-colors"
                            >
                              <Play size={11} />
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {activeTab === "search" && (
                <div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500 pointer-events-none" />
                    <input
                      type="text"
                      value={queryInput}
                      onChange={(e) => setQueryInput(e.target.value)}
                      placeholder="Search YouTube songs, artists…"
                      disabled={!canAddToQueue}
                      className="w-full h-10 rounded-xl bg-slate-950 border border-slate-700 pl-9 pr-9 text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {queryInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setQueryInput("");
                          setDebouncedQuery("");
                        }}
                        aria-label="Clear search"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {!canAddToQueue && (
                    <p className="mt-2 text-[11px] text-slate-500">
                      The host has disabled guest song requests.
                    </p>
                  )}

                  <div className="mt-3">
                    <SearchResults
                      query={debouncedQuery}
                      enabled={canAddToQueue}
                      queue={queue}
                      singerName={singerName}
                      onQueueAdd={onQueueAdd}
                    />
                  </div>
                </div>
              )}

              {activeTab === "history" && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">
                    Recently Played · {history.length}
                  </p>
                  {history.length === 0 ? (
                    <p className="mt-8 text-xs text-slate-600 text-center leading-relaxed">
                      Songs played in this hive will appear here.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {history.map((song) => (
                        <li
                          key={`${song.videoId}-${song.playedAt}`}
                          className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2.5"
                        >
                          {song.thumbnail ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={song.thumbnail}
                              alt=""
                              className="w-12 h-8 rounded-md object-cover shrink-0 bg-slate-800"
                              loading="lazy"
                            />
                          ) : (
                            <span className="size-7 shrink-0 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center">
                              <Music className="size-3.5" />
                            </span>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-slate-200 truncate">
                              {song.title}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              Sung by {song.singer}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </PanelShell>
          </AnimatePresence>
        </div>
      </Tabs>
    </div>
  );
}

function SearchResults({
  query,
  enabled,
  queue,
  singerName,
  onQueueAdd,
  trendingSongs = [],
}: {
  query: string;
  enabled: boolean;
  queue: QueueItem[];
  singerName: string;
  onQueueAdd: (item: QueueItem) => void;
  trendingSongs?: { title: string; videoId: string; thumbnail?: string; count: number }[];
}) {
  // Separate fetcher for stats (different response shape)
  async function statsFetcher(url: string) {
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Stats failed");
    return data as { trendingSongs: QueueItem[] };
  }

  const { data: stats } = useSWR<{ trendingSongs: QueueItem[] }>(
    "/api/stats",
    statsFetcher
  );

  const shouldFetch = enabled && query.length >= 2;
  const { data, error, isLoading } = useSWR<SearchResponse>(
    shouldFetch ? `/api/youtube-search?q=${encodeURIComponent(query)}` : null,
    fetcher,
    { keepPreviousData: true },
  );

  if (!shouldFetch) {
    return (
      <div className="mt-6">
        <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 mb-3 px-1">
          Trending on Beereel
        </h4>
        <ul className="space-y-2">
          {stats?.trendingSongs?.slice(0, 5).map((r) => {
            const alreadyQueued = queue.some((q) => q.videoId === r.videoId);
            return (
              <li
                key={r.videoId}
                className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/60 px-2.5 py-2"
              >
                {r.thumbnail ? (
                  <img
                    src={r.thumbnail}
                    alt=""
                    className="w-24 h-16 rounded-md object-cover shrink-0 bg-slate-800"
                    loading="lazy"
                  />
                ) : (
                  <span className="w-24 h-16 rounded-md bg-slate-800 shrink-0 flex items-center justify-center">
                    <Music className="size-5 text-slate-500" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-200 line-clamp-1">
                    {r.title}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {r.channel}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onQueueAdd({ ...r, singer: singerName })}
                  disabled={alreadyQueued || !enabled}
                  className={cn(
                    "gap-1 shrink-0 h-7 px-2 text-[11px] font-black cursor-pointer",
                    alreadyQueued
                      ? "opacity-40"
                      : "text-amber-300 border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-200",
                  )}
                  aria-label={`Add ${r.title} to queue`}
                >
                  {alreadyQueued ? "Queued" : <><Plus size={12} /> Queue</>}
                </Button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
  if (error)
    return (
      <p className="mt-4 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2.5">
        {error instanceof Error ? error.message : "failed to load"}
      </p>
    );
  if (isLoading && !data) {
    return (
      <ul className="mt-2 space-y-2">
        {[0, 1, 2].map((i) => (
          <li
            key={i}
            className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/60 px-2.5 py-2 animate-pulse"
          >
            <span className="w-16 h-9 rounded-md bg-slate-800 shrink-0" />
            <span className="flex-1 space-y-1.5">
              <span className="block h-3 w-3/4 rounded bg-slate-800" />
              <span className="block h-2.5 w-1/3 rounded bg-slate-800/70" />
            </span>
          </li>
        ))}
      </ul>
    );
  }

  const results = data?.results ?? [];
  if (results.length === 0) {
    return (
      <p className="mt-6 text-xs text-slate-600 text-center leading-relaxed">
        No videos found for “{query}”.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {results.map((r) => {
        console.log(r);
        const alreadyQueued = queue.some((q) => q.videoId === r.videoId);
        return (
          <li
            key={r.videoId}
            className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/60 px-2.5 py-2"
          >
            {r.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={r.thumbnail}
                alt=""
                className="w-24 h-16 rounded-md object-cover shrink-0 bg-slate-800"
                loading="lazy"
              />
            ) : (
              <span className="w-24 h-16 rounded-md bg-slate-800 shrink-0 flex items-center justify-center">
                <Music className="size-5 text-slate-500" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-200 line-clamp-1">
                {r.title}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {r.channel}
                {r.length ? ` · ${r.length}` : ""}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onQueueAdd({ ...r, singer: singerName })}
              disabled={alreadyQueued || !enabled}
              className={cn(
                "gap-1 shrink-0 h-7 px-2 text-[11px] font-black cursor-pointer",
                alreadyQueued
                  ? "opacity-40"
                  : "text-amber-300 border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-200",
              )}
              aria-label={`Add ${r.title} to queue`}
            >
              {alreadyQueued ? (
                "Queued"
              ) : (
                <>
                  <Plus size={12} /> Queue
                </>
              )}
            </Button>
          </li>
        );
      })}
    </ul>
  );
}

function PanelShell({
  children,
  dir,
}: {
  children: React.ReactNode;
  dir: number;
}) {
  return (
    <motion.div
      custom={dir}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={transition}
      className="absolute inset-0 p-4 overflow-y-auto"
    >
      {children}
    </motion.div>
  );
}
