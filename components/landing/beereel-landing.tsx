"use client";

import { NumberTicker } from "@/components/shadcn-space/number-ticker/number-ticker-05";
import SwarmCursor from "@/components/SwarmCursor";
import HoneycombRoom, {
  type HiveRoom,
} from "@/components/landing/honeycomb-room";
import { Badge } from "@/components/ui/badge";
import { BeeIcon } from "@/components/ui/bee-icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  ChevronRightIcon,
  MicIcon,
  PlayIcon,
  RadioIcon,
  SparklesIcon,
  ZapIcon,
} from "lucide-animated";
import { Award, Hexagon, KeyRound, LogIn, Music, Plus } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import useSWR from "swr";

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
    name: `Hive ${hive.roomId}`,
    genre: hive.host ? `Hosted by ${hive.host}` : "Live karaoke hive",
    singers: hive.members,
    nowSinging: "",
    host: hive.host ?? "",
    avatar: initials(hive.host) ?? hive.roomId.slice(0, 2).toUpperCase(),
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
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [createUserName, setCreateUserName] = useState("");
  const [joinUserName, setJoinUserName] = useState("");
  const [joinHiveCode, setJoinHiveCode] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [highlightedCard, setHighlightedCard] = useState<
    "create" | "join" | null
  >(null);

  const joinInputRef = useRef<HTMLInputElement>(null);
  const createInputRef = useRef<HTMLInputElement>(null);

  const { activeBees, liveHives, activeRooms } = useHivePresence(null);
  const { data: dbStats } = useSWR<{ songsInCell: number; honeyGifts: number }>(
    "/api/stats",
    (url: string) => fetch(url).then((r) => r.json()),
    { refreshInterval: 15000 },
  );

  // Real values only — no fake marketing placeholders. `null` renders as "—"
  // until the first live sync arrives.
  const statNumbers: Record<string, number | null> = {
    "Active Bees": activeBees > 0 ? activeBees : null,
    "Live Hives": liveHives > 0 ? liveHives : null,
    "Songs in Cell":
      typeof dbStats?.songsInCell === "number" ? dbStats.songsInCell : null,
    "Honey Gifts":
      typeof dbStats?.honeyGifts === "number" ? dbStats.honeyGifts : null,
  };

  const handleNavigate = (targetId: string, option?: "create" | "join") => {
    if (option) {
      setHighlightedCard(option);
      setTimeout(() => {
        if (option === "join" && joinInputRef.current) {
          joinInputRef.current.focus();
        } else if (option === "create" && createInputRef.current) {
          createInputRef.current.focus();
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
      className="min-h-dvh bg-slate-950"
    >
      <div className="min-h-screen text-slate-100 selection:bg-amber-500 selection:text-slate-950 relative overflow-x-hidden font-sans">
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

        {/* Radial Honey Glow Gradients */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-amber-500/25 via-yellow-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 -left-40 w-[500px] h-[500px] bg-yellow-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-amber-500/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <Image
                  src={`/logo/favicon-96x96.png`}
                  alt="Beereel Logo"
                  width={40}
                  height={40}
                  quality={100}
                  className="rounded-md"
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
                    className="text-sm font-medium text-slate-300 hover:text-amber-400 transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <Button
                  onClick={() => handleNavigate("create-or-join", "join")}
                  size="sm"
                  className="h-9 px-3 sm:h-10 sm:px-4 text-xs sm:text-sm gap-1.5 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-bold hover:from-amber-300 hover:to-amber-500 shadow-lg shadow-amber-500/25 border border-amber-300/50 cursor-pointer"
                >
                  <PlayIcon size={16} animateOnHover />
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
          >
            <Badge
              variant="outline"
              className="mb-6 px-4 py-1.5 border-amber-500/40 bg-amber-500/10 text-amber-300 inline-flex items-center gap-2 text-sm font-semibold shadow-inner shadow-amber-500/20"
            >
              <SparklesIcon size={16} animateOnHover />
              Next-Gen Honeycomb Karaoke Experience
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-100 tracking-tight leading-none mb-6"
          >
            Join the Karaoke <br />
            <span className="bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(245,158,11,0.35)]">
              Beehive
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Connect with thousands of singers in interactive honeycomb rooms.
            Drop lyrics, stream live vocals, and collect virtual honey cheers!
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
              className="bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-extrabold text-base px-8 py-6 shadow-xl shadow-amber-500/30 hover:scale-105 transition-transform border border-amber-300 gap-2 cursor-pointer"
            >
              <MicIcon size={20} animateOnHover />
              Start Singing Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => handleNavigate("features")}
              className="border-amber-500/40 text-amber-300 hover:bg-amber-500/10 hover:border-amber-400 text-base px-8 py-6 gap-2 cursor-pointer"
            >
              <RadioIcon size={20} animateOnHover />
              Browse Live Honeycombs
            </Button>
          </motion.div>

          {/* Polished Honeycomb Visual Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {STATS.map((st, i) => (
              <motion.div
                key={st.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="bg-slate-900/80 border border-amber-500/30 hover:border-amber-400/70 rounded-2xl p-5 backdrop-blur-xl relative overflow-hidden group shadow-lg shadow-amber-500/5 hover:shadow-amber-500/20 transition-all duration-300"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/25 transition-colors" />
                <div className="flex items-center justify-between mb-2">
                  {typeof statNumbers[st.label] === "number" ? (
                    <NumberTicker
                      value={statNumbers[st.label] as number}
                      className="text-2xl md:text-3xl font-black text-white"
                    />
                  ) : (
                    <span className="text-2xl md:text-3xl font-black text-white">
                      —
                    </span>
                  )}
                  {st.icon && (
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform shrink-0">
                      <st.icon size={16} className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div className="text-xs uppercase font-bold tracking-wider text-slate-300 text-left">
                  {st.label}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Polished Live Honeycomb Rooms Section */}
        <section
          id="features"
          className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10"
        >
          <div className="text-center mb-14">
            <Badge
              variant="outline"
              className="border-amber-500/40 bg-amber-500/10 text-amber-300 mb-3 px-3 py-1 gap-1.5"
            >
              <RadioIcon size={14} animateOnHover />
              Live Honeycomb Cells
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black text-slate-100">
              Explore Active{" "}
              <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                Singing Honeycombs
              </span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto mt-3 text-sm md:text-base">
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
            <Badge
              variant="outline"
              className="border-amber-500/40 bg-amber-500/10 text-amber-300 mb-3 px-3 py-1 gap-1.5"
            >
              <SparklesIcon size={14} animateOnHover />
              Instant Hive Access
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black text-slate-100">
              Create or Join a{" "}
              <span className="bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                Honeycomb Stage
              </span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto mt-3 text-sm md:text-base">
              Start your own custom honeycomb room or enter a room code to drop
              right into the live choir.
            </p>
          </div>

          {actionMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-xl mx-auto mb-8 p-4 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-300 text-center font-bold text-sm shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
            >
              <SparklesIcon size={18} animateOnHover />
              {actionMessage}
            </motion.div>
          )}

          <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 max-w-6xl mx-auto">
            {/* Option 1: Create Hive */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`flex-1 bg-slate-900/80 border rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between transition-all duration-500 ${
                highlightedCard === "create"
                  ? "border-amber-400 ring-4 ring-amber-400/50 shadow-2xl shadow-amber-500/40 scale-[1.02]"
                  : "border-amber-500/30 hover:border-amber-400/70 shadow-xl shadow-amber-500/5"
              }`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0 text-slate-950 font-black">
                    <Plus className="w-6 h-6 stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-100">
                      Create New Honeycomb
                    </h3>
                    <p className="text-xs text-slate-400">
                      Host a room and invite your squad
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mb-6 text-left">
                  <div>
                    <Label
                      htmlFor="create-username"
                      className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider"
                    >
                      Your Stage Name (Host)
                    </Label>
                    <Input
                      id="create-username"
                      ref={createInputRef}
                      type="text"
                      placeholder="e.g. QueenBee_99"
                      value={createUserName}
                      onChange={(e) => setCreateUserName(e.target.value)}
                      className="w-full bg-slate-950/80 border-amber-500/20 focus-visible:ring-amber-400 text-slate-100 placeholder:text-slate-500 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={() => {
                  const host = createUserName.trim() || "QueenBee_99";
                  const roomId = `HEX-${Math.floor(1000 + Math.random() * 9000)}`;

                  sessionStorage.setItem(
                    `bee:${roomId}`,
                    JSON.stringify({ name: host, isHost: true }),
                  );
                  setActionMessage(
                    `🎉 Hive Room created by ${host}! Code: #${roomId}`,
                  );
                  router.push(`/room/${roomId}`);
                }}
                className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-black text-sm py-6 shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-transform border border-amber-300 gap-2"
              >
                <MicIcon size={18} animateOnHover />
                Create Honeycomb
              </Button>
            </motion.div>

            {/* Separator Line with OR */}
            <div className="flex md:flex-col items-center justify-center gap-3 my-4 md:my-0 shrink-0">
              <div className="h-px w-full md:w-px md:h-full min-h-[40px] bg-gradient-to-r md:bg-gradient-to-b from-transparent via-amber-500/40 to-transparent" />
              <span className="text-amber-400 text-xs font-black tracking-widest uppercase shrink-0">
                OR
              </span>
              <div className="h-px w-full md:w-px md:h-full min-h-[40px] bg-gradient-to-r md:bg-gradient-to-b from-transparent via-amber-500/40 to-transparent" />
            </div>

            {/* Option 2: Join Hive */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`flex-1 bg-slate-900/80 border rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between transition-all duration-500 ${
                highlightedCard === "join"
                  ? "border-amber-400 ring-4 ring-amber-400/50 shadow-2xl shadow-amber-500/40 scale-[1.02]"
                  : "border-amber-500/30 hover:border-amber-400/70 shadow-xl shadow-amber-500/5"
              }`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/30 shrink-0 text-slate-950 font-black">
                    <KeyRound className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-100">
                      Join with Room Code
                    </h3>
                    <p className="text-xs text-slate-400">
                      Enter a 6-character hex code
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mb-6 text-left">
                  <div>
                    <Label
                      htmlFor="join-username"
                      className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider"
                    >
                      Your Bee Name (Singer)
                    </Label>
                    <Input
                      id="join-username"
                      type="text"
                      placeholder="e.g. HoneyVocalist"
                      value={joinUserName}
                      onChange={(e) => setJoinUserName(e.target.value)}
                      className="w-full bg-slate-950/80 border-amber-500/20 focus-visible:ring-amber-400 text-slate-100 placeholder:text-slate-500 rounded-xl"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="join-code"
                      className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider"
                    >
                      Hive Hex Code
                    </Label>
                    <Input
                      id="join-code"
                      ref={joinInputRef}
                      type="text"
                      placeholder="e.g. #HEX-8492"
                      value={joinHiveCode}
                      onChange={(e) =>
                        setJoinHiveCode(e.target.value.toUpperCase())
                      }
                      className="w-full bg-slate-950/80 border-amber-500/20 focus-visible:ring-amber-400 text-slate-100 placeholder:text-slate-500 rounded-xl font-mono tracking-wider uppercase"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={() => {
                  const user = joinUserName.trim() || "HoneyVocalist";
                  const code =
                    joinHiveCode.trim().replace(/^#/, "").toUpperCase() ||
                    "HEX-4231";
                  sessionStorage.setItem(
                    `bee:${code}`,
                    JSON.stringify({ name: user, isHost: false }),
                  );
                  setActionMessage(
                    `🐝 ${user} joining Hive #${code}... Connected to live room!`,
                  );
                  router.push(`/room/${code}`);
                }}
                variant="outline"
                className="w-full border-amber-500/40 text-amber-300 hover:bg-amber-500/10 hover:border-amber-400 font-bold text-sm py-6 gap-2"
              >
                <LogIn className="w-5 h-5" />
                Enter Code
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Polished Honeycomb Workflow Cards Section */}
        <section
          id="how-it-works"
          className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10"
        >
          <div className="bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-900/90 border border-amber-500/30 rounded-3xl p-8 md:p-14 shadow-2xl shadow-amber-500/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="text-center mb-14">
              <Badge
                variant="outline"
                className="border-amber-500/40 bg-amber-500/10 text-amber-300 mb-3 px-3 py-1"
              >
                <Hexagon className="w-3.5 h-3.5 fill-amber-400 text-amber-950" />
                Beehive Workflow
              </Badge>
              <h2 className="text-3xl md:text-5xl font-black text-slate-100">
                How the{" "}
                <span className="bg-gradient-to-r from-yellow-300 to-amber-500 bg-clip-text text-transparent">
                  Hive Operates
                </span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {BEEHIVE_FEATURES.map((feat) => (
                <div
                  key={feat.title}
                  className="bg-slate-950/80 border border-amber-500/25 rounded-2xl p-7 relative group hover:border-amber-400/60 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform shrink-0">
                        <feat.icon
                          size={28}
                          className="w-7 h-7 text-slate-950 stroke-[2.5]"
                        />
                      </div>
                      <span className="text-2xl font-black text-amber-400/30 group-hover:text-amber-400/60 transition-colors">
                        {feat.step}
                      </span>
                    </div>

                    <h3 className="text-xl font-extrabold text-slate-100 mb-3 group-hover:text-amber-300 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed font-normal">
                      {feat.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-amber-500/15 flex items-center gap-2 text-xs font-bold text-amber-400">
                    <SparklesIcon size={14} animateOnHover />
                    <span>Beehive Feature</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center relative z-10">
          <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-600/20 border border-amber-500/40 rounded-3xl p-10 backdrop-blur-xl relative overflow-hidden shadow-2xl shadow-amber-500/15">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Award className="w-8 h-8 text-amber-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-100 mb-3">
              Ready to Rule the Beehive Stage?
            </h2>
            <p className="text-slate-300 max-w-xl mx-auto mb-8 text-sm md:text-base">
              Create your custom hexagon karaoke room in seconds. Invite friends
              and share the sweet sound.
            </p>
            <a href="#create-or-join">
              <Button
                size="lg"
                className="bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-black text-base px-8 py-6 shadow-xl shadow-amber-500/30 hover:scale-105 transition-transform border border-amber-300/50 gap-2"
              >
                <ZapIcon size={20} animateOnHover />
                Launch My Hive Room
              </Button>
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-amber-500/20 text-center text-xs text-slate-500 relative z-10">
          &copy; {new Date().getFullYear()} {SITE_CONFIG.name}. All rights
          reserved.
        </footer>
      </div>
    </SwarmCursor>
  );
}
