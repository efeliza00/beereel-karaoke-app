"use client";

import HoneycombRoom, {
  type HiveRoom,
} from "@/components/landing/honeycomb-room";
import { NumberTicker } from "@/components/shadcn-space/number-ticker/number-ticker-05";
import SwarmCursor from "@/components/SwarmCursor";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BEEHIVE_FEATURES,
  HIVE_ROOMS,
  NAV_LINKS,
  SITE_CONFIG,
  STATS,
} from "@/constants";
import { useHivePresence, type ActiveHive } from "@/lib/use-hive-presence";
import { zodResolver } from "@hookform/resolvers/zod";
import { MicIcon, PlayIcon, RadioIcon, ZapIcon } from "lucide-animated";
import { KeyRound, LogIn, Music, Plus } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import { z } from "zod";

const createHiveSchema = z.object({
  stageName: z
    .string()
    .trim()
    .min(1, "Enter a stage name")
    .max(40, "Stage name must be 40 characters or less"),
});

const joinHiveSchema = z.object({
  beeName: z
    .string()
    .trim()
    .min(1, "Enter your bee name")
    .max(40, "Bee name must be 40 characters or less"),
  hexCode: z
    .string()
    .trim()
    .regex(/^[A-Z]{2,3}-\d{4}$/i, "Enter a valid hive code like HEX-1234"),
});

type CreateHiveFormData = z.infer<typeof createHiveSchema>;
type JoinHiveFormData = z.infer<typeof joinHiveSchema>;

const LIVE_PALETTE = [
  {
    gradient: "from-amber-400 via-amber-500 to-yellow-500",
    glow: "shadow-amber-500/20",
    border: "border-amber-500/30",
  },
  {
    gradient: "from-yellow-400 via-amber-500 to-amber-600",
    glow: "shadow-yellow-500/20",
    border: "border-yellow-500/30",
  },
  {
    gradient: "from-amber-500 via-orange-500 to-yellow-400",
    glow: "shadow-orange-500/20",
    border: "border-orange-500/30",
  },
  {
    gradient: "from-orange-400 via-amber-400 to-yellow-300",
    glow: "shadow-orange-400/20",
    border: "border-orange-400/30",
  },
];

function initials(name?: string) {
  if (!name) return undefined;
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function liveToHiveRoom(hive: ActiveHive, i: number): HiveRoom {
  const palette = LIVE_PALETTE[i % LIVE_PALETTE.length];
  return {
    id: hive.roomId,
    roomId: hive.roomId,
    name: hive.host ? `${hive.host}'s Hive` : "Live Hive",
    genre: hive.host ? `Hosted by ${hive.host}` : "Live karaoke hive",
    singers: hive.members,
    nowSinging: "",
    host: hive.host ?? "",
    avatar: initials(hive.host) ?? "B",
    badge:
      hive.members >= 15
        ? "FULL HOUSE"
        : hive.members >= 8
          ? "HOT STAGE"
          : "LIVE PARTY",
    activeWave: true,
    ...palette,
  };
}

export default function BeereelLanding() {
  const router = useRouter();
  const [highlightedCard, setHighlightedCard] = useState<
    "create" | "join" | null
  >(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const createForm = useForm<CreateHiveFormData>({
    resolver: zodResolver(createHiveSchema),
    defaultValues: { stageName: "" },
  });
  const create = createForm.register;

  const joinForm = useForm<JoinHiveFormData>({
    resolver: zodResolver(joinHiveSchema),
    defaultValues: { beeName: "", hexCode: "" },
  });
  const join = joinForm.register;

  const { activeBees, liveHives, activeRooms } = useHivePresence(null);
  const { data: dbStats } = useSWR<{
    songsInCell: number;
    honeyGifts: number;
    honeyDrops: number;
    totalHives: number;
    trendingSongs: {
      title: string;
      count: number;
      videoId: string;
      thumbnail?: string;
    }[];
  }>("/api/stats", (url: string) => fetch(url).then((r) => r.json()), {
    refreshInterval: 15000,
  });

  // Real values only — no fake marketing placeholders. `null` renders as "—"
  // until the first live sync arrives.
  const statNumbers: Record<string, number | null> = {
    "Active Bees": activeBees > 0 ? activeBees : null,
    "Live Honeycombs": liveHives > 0 ? liveHives : null,
    "Honey Gifts":
      typeof dbStats?.honeyGifts === "number" ? dbStats.honeyGifts : null,
    "Honeycombs Created":
      typeof dbStats?.totalHives === "number" ? dbStats.totalHives : null,
  };

  const handleCreateHive = (data: CreateHiveFormData) => {
    const host = data.stageName;
    const roomId = `HEX-${Math.floor(1000 + Math.random() * 9000)}`;
    sessionStorage.setItem(
      `bee:${roomId}`,
      JSON.stringify({ name: host, isHost: true }),
    );
    router.push(`/room/${roomId}`);
  };

  const handleJoinHive = (data: JoinHiveFormData) => {
    const user = data.beeName;
    const code = data.hexCode.trim().replace(/^#/, "").toUpperCase();
    sessionStorage.setItem(
      `bee:${code}`,
      JSON.stringify({ name: user, isHost: false }),
    );
    router.push(`/room/${code}`);
  };

  const handleNavigate = (targetId: string, option?: "create" | "join") => {
    if (option) {
      setHighlightedCard(option);
      setTimeout(() => {
        if (option === "join") {
          joinForm.setFocus("hexCode");
        } else if (option === "create") {
          createForm.setFocus("stageName");
        }
      }, 400);
      setTimeout(() => {
        setHighlightedCard(null);
      }, 3500);
    }
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <SwarmCursor
      color="#f59e0b"
      accentColor="#fde68a"
      count={6}
      size={11}
      glow={0.1}
      trail={0.05}
      speed={3}
      className="min-h-dvh "
    >
      <div className="min-h-screen text-[#3b2f21] selection:bg-amber-500 selection:text-slate-950 relative overflow-x-hidden font-sans">
        {/* Background Honeycomb Hex Pattern SVG */}
        <div className="absolute inset-0 opacity-15 pointer-events-none z-0">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="hexagons"
                width="56"
                height="100"
                patternUnits="userSpaceOnUse"
                patternTransform="scale(1)"
              >
                <path
                  d="M28 66L0 50L0 16L28 0L56 16L56 50L28 66Z M28 100L0 84L0 50L28 66L56 50L56 84L28 100Z"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="1"
                  strokeOpacity="0.4"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hexagons)" />
          </svg>
        </div>

        {/* Radial Honey Glow Gradient */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-amber-500/25 via-yellow-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Top Navbar */}
        <nav
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            scrolled ? "bg-[#f7f1e4]/80 backdrop-blur-lg" : "bg-transparent"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <Image
                  src={`/logo/favicon-96x96.png`}
                  alt="Beereel Logo"
                  width={40}
                  height={40}
                  quality={100}
                  className="rounded-xl"
                />
                <div className="truncate">
                  <span className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                    Beereel
                  </span>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-8">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-sm font-medium text-[#857558] hover:text-amber-400 transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <Button
                  onClick={() => handleNavigate("create-or-join", "join")}
                  size="sm"
                  className="h-9 px-3 sm:h-10 sm:px-4 text-xs sm:text-sm gap-1.5  text-white font-thin  transition-all duration-300 active:text-[#451a03] active:shadow-neumorph-pressed active:bg-[#f7f1e4] border-0 cursor-pointer"
                >
                  <PlayIcon size={12} animateOnHover />
                  <span className="hidden min-[400px]:inline whitespace-nowrap">
                    Enter Honeycomb
                  </span>
                  <span className="inline min-[400px]:hidden whitespace-nowrap">
                    Enter
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center mb-10 justify-center"
          >
            <iframe
              src="https://appbuildersph.com/embed/apps/beereel"
              title="Beereel votes on App Builders PH"
              width="280"
              height="72"
              loading="lazy"
            ></iframe>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl md:text-8xl lg:text-9xl font-medium text-[#3b2f21] tracking-tight leading-none mb-6"
          >
            Join the Karaoke <br />
            <span className="bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 bg-clip-text text-transparent">
              Hive
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-[#857558] max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Turn any moment into a live karaoke party. Create a private hive,
            share the code, and your friends join instantly — no installs, no
            accounts, just pure harmony.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Button
              size="lg"
              onClick={() => handleNavigate("create-or-join", "create")}
              className="bg-[#f7f1e4] text-white font-thin text-lg sm:text-xl px-10 sm:px-12 py-7 sm:py-8 shadow-neumorph-sm transition-all duration-300 bg-[#f59e0b] hover:text-[#451a03] active:shadow-neumorph-pressed border-0 gap-3 cursor-pointer"
            >
              <MicIcon size={24} animateOnHover />
              Start Singing Now
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={() => handleNavigate("features")}
              className="bg-[#f7f1e4] text-[#b45309] text-lg sm:text-xl px-10 sm:px-12 py-7 sm:py-8  transition-all duration-300  hover:text-[#451a03] hover:shadow-neumorph-sm active:shadow-neumorph-pressed gap-3 cursor-pointer"
            >
              <RadioIcon size={24} animateOnHover />
              Browse Live Honeycombs
            </Button>
          </motion.div>
        </section>

        {/* Live Stats Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-2 gap-5 max-w-2xl mx-auto">
            {STATS.map((st, i) => (
              <motion.div
                key={st.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="aspect-square rounded-[50px] shadow-neumorph-inset-sm  flex flex-col items-center justify-center gap-1.5 px-4"
              >
                {typeof statNumbers[st.label] === "number" ? (
                  <NumberTicker
                    value={statNumbers[st.label] as number}
                    label={st.label}
                    className="text-3xl md:text-4xl font-light text-[#3b2f21]"
                  />
                ) : (
                  <span className="text-3xl md:text-4xl font-light text-[#3b2f21]">
                    —
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* Leaderboard Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#3b2f21] mb-4">
              Most Sang <span className="text-[#b45309]">Songs</span>
            </h2>
            <p className="text-[#857558] max-w-xl mx-auto text-sm md:text-base">
              Top 5 tracks performed across all honeycombs.
            </p>
          </motion.div>

          <div className="rounded-4xl overflow-hidden p-1.5">
            {dbStats?.trendingSongs && dbStats.trendingSongs.length > 0 ? (
              <div className="divide-y divide-[#f0e8d6]">
                {dbStats.trendingSongs.map((song, i) => (
                  <motion.div
                    key={song.videoId}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-4 px-6 py-4 transition-colors group"
                  >
                    <div className="w-8 shrink-0 text-center">
                      {i < 3 ? (
                        <span
                          className={`inline-flex items-center justify-center size-8 rounded-full text-lg font-bold ${
                            i === 0
                              ? "bg-[#fde68a] text-[#b45309]"
                              : i === 1
                                ? "bg-white text-[#857558]"
                                : "bg-[#f1e9d6] text-[#b45309]"
                          }`}
                        >
                          {i + 1}
                        </span>
                      ) : (
                        <span className="text-[#a39478] font-bold text-sm">
                          {i + 1}
                        </span>
                      )}
                    </div>

                    {song.thumbnail ? (
                      <Image
                        src={song.thumbnail}
                        alt={song.title + "-"}
                        width={10}
                        height={10}
                        className="size-10 rounded-lg object-cover bg-[#eadfc9] shrink-0"
                      />
                    ) : (
                      <div className="size-10 rounded-lg bg-[#f1e9d6] flex items-center justify-center shrink-0">
                        <PlayIcon size={16} className="text-[#b45309]" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[#3b2f21] truncate transition-colors">
                        {song.title}
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fde68a] text-[#b45309] font-bold text-xs shrink-0">
                      <PlayIcon size={12} />
                      {song.count}
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-[#a39478]">
                <Music size={32} className="mb-3 opacity-40" />
                <p className="italic text-sm">
                  No songs performed yet. Start a hive and be the first!
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Polished Live Honeycomb Rooms Section */}
        <section
          id="features"
          className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10"
        >
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#3b2f21]">
              Explore Active{" "}
              <span className="text-[#b45309]">Singing Honeycombs</span>
            </h2>
            <p className="text-[#857558] max-w-xl mx-auto mt-3 text-sm md:text-base">
              Pick a room, step up to the hexagonal stage, and start performing
              live.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-x-3 sm:gap-x-5 gap-y-2 max-w-5xl mx-auto">
            {activeRooms.length > 0
              ? activeRooms.slice(0, 8).map((hive, i) => (
                  <div key={hive.roomId}>
                    <HoneycombRoom room={liveToHiveRoom(hive, i)} index={i} />
                  </div>
                ))
              : HIVE_ROOMS.map((room, i) => (
                  <div key={room.id}>
                    <HoneycombRoom room={room} index={i} />
                  </div>
                ))}
          </div>
        </section>

        {/* Create or Join a Hive Options Section */}
        <section
          id="create-or-join"
          className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10"
        >
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#3b2f21]">
              Create or Join a{" "}
              <span className="text-[#b45309]">Honeycomb Stage</span>
            </h2>
            <p className="text-[#857558] max-w-xl mx-auto mt-3 text-sm md:text-base">
              Start your own custom honeycomb room or enter a room code to drop
              right into the live choir.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 max-w-6xl mx-auto">
            {/* Option 1: Create Hive */}
            <motion.div
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`flex-1 bg-[#fdfaf3] p-8 relative overflow-hidden flex flex-col justify-between transition-all duration-500 ${
                highlightedCard === "create"
                  ? "ring-2 ring-[#f59e0b]  rounded-3xl"
                  : " rounded-3xl "
              }`}
            >
              <form
                onSubmit={createForm.handleSubmit(handleCreateHive)}
                className="flex flex-col h-full"
              >
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[#fde68a] text-[#b45309] flex items-center justify-center shrink-0">
                      <Plus className="w-6 h-6 stroke-[3]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-[#3b2f21]">
                        Create New Honeycomb
                      </h3>
                      <p className="text-xs text-[#857558]">
                        Host a room and invite your squad
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6 text-left">
                    <div>
                      <Label
                        htmlFor="create-username"
                        className="block text-xs font-bold text-[#857558] mb-2 uppercase tracking-wider"
                      >
                        Your Stage Name (Host)
                      </Label>
                      <Input
                        id="create-username"
                        type="text"
                        placeholder="e.g. QueenBee_99"
                        aria-invalid={!!createForm.formState.errors.stageName}
                        {...create("stageName")}
                        className="w-full rounded-xl bg-white border border-[#eadfc9] shadow-none text-[#3b2f21] placeholder:text-[#a39478] focus-visible:ring-2 focus-visible:ring-[#f59e0b] focus-visible:border-[#f59e0b]"
                      />
                      {createForm.formState.errors.stageName && (
                        <p className="mt-1.5 text-[11px] font-medium text-red-400">
                          {createForm.formState.errors.stageName.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full mt-auto  text-white font-bold text-sm py-6 rounded-xl transition-all duration-300 hover:text-[#b45309] border-0 gap-2"
                >
                  <MicIcon size={18} animateOnHover />
                  Create Honeycomb
                </Button>
              </form>
            </motion.div>

            {/* Separator Line with OR */}
            <div className="hidden md:flex items-center justify-center gap-3 shrink-0 flex-col">
              <div className="h-px w-full max-w-[140px] mx-auto md:mx-0 md:w-px md:h-full min-h-[40px] md:max-w-none bg-gradient-to-r md:bg-gradient-to-b from-transparent via-amber-500/40 to-transparent" />
              <span className="text-amber-400 text-xs font-black tracking-widest uppercase shrink-0">
                OR
              </span>
              <div className="h-px w-full max-w-[140px] mx-auto md:mx-0 md:w-px md:h-full min-h-[40px] md:max-w-none bg-gradient-to-r md:bg-gradient-to-b from-transparent via-amber-500/40 to-transparent" />
            </div>

            {/* Option 2: Join Hive */}
            <motion.div
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`flex-1 bg-[#fdfaf3] p-8 relative overflow-hidden  flex flex-col justify-between transition-all duration-500 ${
                highlightedCard === "join"
                  ? "ring-2 ring-[#f59e0b] rounded-3xl"
                  : " rounded-3xl "
              }`}
            >
              <form
                onSubmit={joinForm.handleSubmit(handleJoinHive)}
                className="flex flex-col h-full"
              >
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[#fde68a] text-[#b45309] flex items-center justify-center shrink-0">
                      <KeyRound className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-[#3b2f21]">
                        Join with Room Code
                      </h3>
                      <p className="text-xs text-[#857558]">
                        Enter a 6-character hex code
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6 text-left">
                    <div>
                      <Label
                        htmlFor="join-username"
                        className="block text-xs font-bold text-[#857558] mb-2 uppercase tracking-wider"
                      >
                        Your Bee Name (Singer)
                      </Label>
                      <Input
                        id="join-username"
                        type="text"
                        placeholder="e.g. HoneyVocalist"
                        aria-invalid={!!joinForm.formState.errors.beeName}
                        {...join("beeName")}
                        className="w-full rounded-xl bg-white border border-[#eadfc9] shadow-none text-[#3b2f21] placeholder:text-[#a39478] focus-visible:ring-2 focus-visible:ring-[#f59e0b] focus-visible:border-[#f59e0b]"
                      />
                      {joinForm.formState.errors.beeName && (
                        <p className="mt-1.5 text-[11px] font-medium text-red-400">
                          {joinForm.formState.errors.beeName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="join-code"
                        className="block text-xs font-bold text-[#857558] mb-2 uppercase tracking-wider"
                      >
                        Hive Hex Code
                      </Label>
                      <Input
                        id="join-code"
                        type="text"
                        placeholder="e.g. #HEX-8492"
                        aria-invalid={!!joinForm.formState.errors.hexCode}
                        {...join("hexCode")}
                        onBlur={(e) => {
                          const val = e.target.value.toUpperCase();
                          joinForm.setValue("hexCode", val, {
                            shouldValidate: true,
                          });
                        }}
                        className="w-full rounded-xl bg-white border border-[#eadfc9] shadow-none text-[#3b2f21] placeholder:text-[#a39478] focus-visible:ring-2 focus-visible:ring-[#f59e0b] focus-visible:border-[#f59e0b] font-mono tracking-wider uppercase"
                      />
                      {joinForm.formState.errors.hexCode && (
                        <p className="mt-1.5 text-[11px] font-medium text-red-400">
                          {joinForm.formState.errors.hexCode.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="outline"
                  className="w-full mt-auto bg-white border border-[#eadfc9] text-[#3b2f21] font-bold text-sm py-6 rounded-xl hover:border-[#b45309] hover:text-[#b45309] gap-2"
                >
                  <LogIn className="w-5 h-5" />
                  Enter Code
                </Button>
              </form>
            </motion.div>
          </div>
        </section>

        {/* Polished Honeycomb Workflow Cards Section */}
        <section
          id="how-it-works"
          className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10"
        >
          <div className="rounded-3xl p-8 md:p-12 ">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#3b2f21]">
                How the <span className="text-[#b45309]">Hive Operates</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {BEEHIVE_FEATURES.map((feat) => (
                <div
                  key={feat.title}
                  className="rounded-3xl bg-[#fdfaf3] p-7 relative group hover:shadow-neumorph-sm transition-shadow duration-500 ease-in-out flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-xl bg-[#fde68a] text-[#b45309] flex items-center justify-center">
                        <feat.icon size={28} className="w-7 h-7 stroke-[2.5]" />
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-[#3b2f21] mb-3">
                      {feat.title}
                    </h3>
                    <p className="text-sm text-[#857558] leading-relaxed font-normal">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center relative z-10">
          <div className="rounded-3xl bg-[#fdfaf3] p-10 relative overflow-hidden shadow-neumorph">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#3b2f21] mb-3">
              Ready to Rule the Beehive Stage?
            </h2>
            <p className="text-[#857558] max-w-xl mx-auto mb-8 text-sm md:text-base">
              Create your custom hexagon karaoke room in seconds. Invite friends
              and share the sweet sound.
            </p>
            <a href="#create-or-join">
              <Button
                size="lg"
                className="bg-[#b45309] text-white font-bold text-base px-8 py-6 rounded-xl border-0 hover:bg-[#78350f] gap-2"
              >
                <ZapIcon size={20} animateOnHover />
                Launch My Hive Room
              </Button>
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-[#e4d8bd] text-center text-xs text-[#a39478] relative z-10 flex flex-col items-center gap-4">
          <div className="flex items-center gap-6 mb-2">
            <Dialog>
              <DialogTrigger
                render={
                  <button className="hover:text-amber-400 transition-colors cursor-pointer" />
                }
              >
                Terms of Service
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-[#fdfaf3] border-[#e4d8bd] text-[#3b2f21] rounded-3xl overflow-hidden">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black text-amber-400">
                    Terms of Service
                  </DialogTitle>
                  <DialogDescription className="text-[#857558]">
                    Last updated: {new Date().toLocaleDateString()}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar text-left py-4">
                  <section>
                    <h4 className="text-amber-300 font-bold mb-1">
                      1. The Hive Rules
                    </h4>
                    <p className="text-xs leading-relaxed">
                      Beereel is a platform for synchronized karaoke. By
                      creating or joining a &quot;Hive&quot;, you agree to use
                      the service for entertainment purposes only. Don&apos;t be
                      a buzzkill—respect other singers.
                    </p>
                  </section>
                  <section>
                    <h4 className="text-amber-300 font-bold mb-1">
                      2. Content & Media
                    </h4>
                    <p className="text-xs leading-relaxed">
                      All video content is streamed via third-party providers
                      (YouTube). We do not host the media files. Users are
                      responsible for complying with the content provider&apos;s
                      terms. Please ensure your song choices respect copyright
                      and community standards.
                    </p>
                  </section>
                  <section>
                    <h4 className="text-amber-300 font-bold mb-1">
                      3. Room Privacy
                    </h4>
                    <p className="text-xs leading-relaxed">
                      Hosts have full authority over their Hives, including the
                      ability to lock rooms, manage the queue, and remove
                      participants. Joining a room means you accept the
                      host&apos;s moderation.
                    </p>
                  </section>
                  <section>
                    <h4 className="text-amber-300 font-bold mb-1">
                      4. Real-time Data
                    </h4>
                    <p className="text-xs leading-relaxed">
                      We use Supabase Realtime for synchronization. Your
                      presence (name and host status) is visible to other
                      members of the same hive. Temporary room state is stored
                      to ensure the music stays in sync.
                    </p>
                  </section>
                  <section>
                    <h4 className="text-amber-300 font-bold mb-1">
                      5. Limitation of Liability
                    </h4>
                    <p className="text-xs leading-relaxed">
                      Beereel is provided &quot;as is&quot;. We aren&apos;t
                      liable for off-key singing, missed high notes, or
                      synchronized playback drift due to internet latency. Rock
                      on at your own risk.
                    </p>
                  </section>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger
                render={
                  <button className="hover:text-amber-400 transition-colors cursor-pointer" />
                }
              >
                Privacy Policy
              </DialogTrigger>
              <DialogContent className="max-w-xl bg-[#fdfaf3] border-[#e4d8bd] text-[#3b2f21] rounded-3xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black text-amber-400">
                    Privacy Policy
                  </DialogTitle>
                  <DialogDescription className="text-[#857558]">
                    How we handle your bee data.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 text-left py-4">
                  <p className="text-xs leading-relaxed">
                    We believe in privacy. Beereel does not require accounts or
                    email registration. Your &quot;Bee Name&quot; and room
                    preferences are stored locally on your device
                    (sessionStorage) and shared temporarily with other hive
                    members via encrypted real-time channels to enable
                    synchronization.
                  </p>
                  <p className="text-xs leading-relaxed">
                    Room states (queues and history) are persisted to a
                    temporary database to allow rooms to survive refreshes. No
                    permanent personal profiles are created.
                  </p>
                </div>
              </DialogContent>
            </Dialog>

            <Link
              href="/changelog"
              className="hover:text-amber-400 transition-colors"
            >
              Changelog
            </Link>
          </div>
          <p className="opacity-60">
            &copy; {new Date().getFullYear()} {SITE_CONFIG.name}. All rights
            reserved.
          </p>
        </footer>
      </div>
    </SwarmCursor>
  );
}
