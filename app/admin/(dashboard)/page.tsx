import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { NumberTicker } from "@/components/shadcn-space/number-ticker/number-ticker-05";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getStats } from "@/lib/stats";
import {
  ArrowUpRight,
  Gift,
  Hexagon,
  ListMusic,
  Music,
  Play,
  Plus,
  TrendingUp,
  Users,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Dashboard",
};

const STAT_CONFIG = [
  {
    key: "totalHives",
    label: "Honeycombs",
    hint: "Rooms created",
    icon: Users,
  },
  {
    key: "songsInCell",
    label: "Songs in Cell",
    hint: "Queued across rooms",
    icon: ListMusic,
  },
  {
    key: "honeyGifts",
    label: "Honey Gifts",
    hint: "Gifts sent",
    icon: Gift,
  },
  {
    key: "honeyDrops",
    label: "Honey Drops",
    hint: "Total amount",
    icon: Hexagon,
  },
] as const;

export default async function AdminDashboardPage() {
  let stats: Awaited<ReturnType<typeof getStats>>;
  try {
    stats = await getStats();
  } catch {
    stats = {
      songsInCell: 0,
      honeyGifts: 0,
      honeyDrops: 0,
      totalHives: 0,
      trendingSongs: [],
    };
  }

  const values: Record<string, number> = {
    totalHives: stats.totalHives,
    songsInCell: stats.songsInCell,
    honeyGifts: stats.honeyGifts,
    honeyDrops: stats.honeyDrops,
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Admin{" "}
            <span className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 bg-clip-text text-transparent">
              Overview
            </span>
          </h1>
          <p className="text-sm text-muted-foreground">
            A live pulse of your honeycomb karaoke hive.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/changelog">
            <Button variant="outline" className="cursor-pointer">
              <Plus className="size-4" />
              Changelog
            </Button>
          </Link>
          <Link href="/" target="_blank">
            <Button className="cursor-pointer">
              View site
              <ArrowUpRight className="size-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STAT_CONFIG.map((stat) => (
          <Card
            key={stat.key}
            className="group transition-all duration-300 hover:-translate-y-0.5 hover:shadow-neumorph"
          >
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {stat.label}
              </CardTitle>
              <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fde68a] to-[#fbbf24] text-[#78350f] shadow-neumorph-inset-sm">
                <stat.icon className="size-5" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <NumberTicker
                value={values[stat.key]}
                className="text-4xl font-extrabold tabular-nums"
              />
              <p className="text-xs text-muted-foreground">{stat.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trending songs */}
      <Card className="rounded-4xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <TrendingUp className="size-5 text-amber-600" />
            Trending songs
          </CardTitle>
          <CardDescription>
            Most-performed tracks across all honeycombs.
          </CardDescription>
          <CardAction>
            <Badge variant="secondary" className="rounded-full">
              {stats.trendingSongs.length} tracks
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          {stats.trendingSongs.length > 0 ? (
            <ol className="divide-y divide-border">
              {stats.trendingSongs.map((song, i) => (
                <li
                  key={song.videoId}
                  className="flex items-center gap-4 py-3"
                >
                  <span className="flex w-8 shrink-0 justify-center">
                    {i < 3 ? (
                      <span
                        className={`inline-flex size-8 items-center justify-center rounded-full text-sm font-bold ${
                          i === 0
                            ? "bg-[#f59e0b] text-[#451a03]"
                            : i === 1
                              ? "bg-[#fde68a] text-[#b45309]"
                              : "bg-[#f1e9d6] text-[#857558]"
                        }`}
                      >
                        {i + 1}
                      </span>
                    ) : (
                      <span className="text-sm font-bold text-muted-foreground">
                        {i + 1}
                      </span>
                    )}
                  </span>

                  {song.thumbnail ? (
                    <Image
                      src={song.thumbnail}
                      alt={song.title}
                      width={48}
                      height={48}
                      className="size-12 shrink-0 rounded-xl bg-muted object-cover"
                    />
                  ) : (
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted">
                      <Music className="size-5 text-muted-foreground" />
                    </div>
                  )}

                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                    {song.title}
                  </span>

                  <Badge
                    variant="secondary"
                    className="shrink-0 gap-1 rounded-full tabular-nums"
                  >
                    <Play className="size-3" />
                    {song.count}
                  </Badge>
                </li>
              ))}
            </ol>
          ) : (
            <div className="flex flex-col items-center justify-center py-14 text-muted-foreground">
              <Music className="mb-3 size-8 opacity-40" />
              <p className="text-sm italic">
                No songs performed yet. Start a hive and be the first!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
