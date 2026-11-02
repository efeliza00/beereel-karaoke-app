"use client";

import HoneycombRoom, {
  type HiveRoom,
} from "@/components/landing/honeycomb-room";
import { NumberTicker } from "@/components/shadcn-space/number-ticker/number-ticker-05";
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
import { ArrowRight, LogIn, Mic, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

function initials(name?: string) {
  if (!name) return undefined;
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function liveToHiveRoom(hive: ActiveHive): HiveRoom {
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
  };
}

export default function BeereelLanding() {
  const router = useRouter();
  const [highlightedCard, setHighlightedCard] = useState<
    "create" | "join" | null
  >(null);

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
          joinForm.setFocus(
            joinForm.getValues("hexCode") ? "beeName" : "hexCode",
          );
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

  const handleJoinRoom = (roomId: string) => {
    joinForm.setValue("hexCode", roomId, { shouldValidate: true });
    handleNavigate("create-or-join", "join");
  };

  return (
    <div className="relative w-full min-h-dvh">
      <div className="min-h-screen text-[#3b2f21] selection:bg-[#3b2f21] selection:text-[#fdfaf3] relative overflow-x-hidden font-sans">
        {/* Top Navbar */}
        <nav
          aria-label="Main"
          className="sticky top-0 z-50 flex flex-wrap items-stretch justify-between border-b-4 border-[#3b2f21] bg-[#f7f1e4]"
        >
          <div className="flex items-center gap-2 px-4 py-2 sm:px-6">
            <Image
              src={`/logo/favicon-96x96.png`}
              alt=""
              width={36}
              height={36}
              quality={75}
            />
            <span className="text-xl font-black uppercase tracking-tighter sm:text-2xl">
              Beereel
            </span>
          </div>

          <div className="flex items-stretch text-sm font-bold uppercase">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hidden items-center border-l-4 border-[#3b2f21] px-5 hover:bg-[#fde68a] md:flex"
              >
                {link.label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => handleNavigate("create-or-join", "join")}
              className="flex min-h-11 cursor-pointer items-center gap-2 border-l-4 border-[#3b2f21] bg-[#3b2f21] px-4 font-bold uppercase text-[#fdfaf3] hover:bg-[#b45309] sm:px-6"
            >
              <Play className="size-4" aria-hidden="true" />
              <span className="hidden min-[400px]:inline">Enter Honeycomb</span>
              <span className="min-[400px]:hidden">Enter</span>
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="overflow-hidden border-b-4 border-[#3b2f21] bg-[#f59e0b] px-4 pb-8 pt-6 sm:px-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm font-bold uppercase sm:text-base">
              Live tonight, every night, wherever you are
            </p>
            <iframe
              src="https://appbuildersph.com/embed/apps/beereel"
              title="Beereel votes on App Builders PH"
              width="280"
              height="72"
              loading="lazy"
            ></iframe>
          </div>
          <h1 className="text-[clamp(4rem,15.5vw,15rem)] font-black uppercase leading-[0.86] tracking-tighter">
            Join the
            <br />
            Karaoke
            <br />
            <span className="font-display font-bold normal-case tracking-tight italic text-[#451a03]">
              Hive
            </span>
          </h1>
        </header>

        <section className="flex flex-wrap border-b-4 border-[#3b2f21]">
          <p className="flex-[999_1_30rem] px-4 py-8 text-xl font-medium leading-snug sm:px-6 md:text-3xl">
            Turn any moment into a live karaoke party. Create a private hive,
            share the code, and your friends join instantly — no installs, no
            accounts, just pure harmony.
          </p>
          <div className="flex flex-[1_1_20rem] flex-col border-t-4 border-[#3b2f21] md:border-l-4 md:border-t-0">
            <button
              type="button"
              onClick={() => handleNavigate("create-or-join", "create")}
              className="flex min-h-24 flex-1 cursor-pointer items-center justify-between gap-4 bg-[#3b2f21] px-6 text-left text-2xl font-black uppercase text-[#fdfaf3] hover:bg-[#b45309] md:text-3xl"
            >
              Start Singing Now
              <ArrowRight className="size-9 shrink-0" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => handleNavigate("features")}
              className="flex min-h-16 cursor-pointer items-center justify-between gap-4 border-t-4 border-[#3b2f21] px-6 text-left text-lg font-bold uppercase hover:bg-[#fde68a]"
            >
              Browse Live Honeycombs
              <ArrowRight className="size-6 shrink-0" aria-hidden="true" />
            </button>
          </div>
        </section>

        {/* Live Stats Section */}
        <section
          aria-label="Hive stats"
          className="grid grid-cols-2 gap-1 border-b-4 border-[#3b2f21] bg-[#3b2f21] lg:grid-cols-4"
        >
          {STATS.map((st) => (
            <div key={st.label} className="bg-[#f7f1e4] px-4 py-6 sm:px-6">
              {statNumbers[st.label] === null ? (
                <span className="text-4xl font-black tracking-tighter md:text-6xl">
                  —
                </span>
              ) : (
                <NumberTicker
                  value={statNumbers[st.label] as number}
                  className="text-4xl font-black tracking-tighter md:text-6xl"
                />
              )}
              <p className="mt-1 text-xs font-bold uppercase sm:text-sm">
                {st.label}
              </p>
            </div>
          ))}
        </section>

        {/* Polished Live Honeycomb Rooms Section */}
        <section
          id="features"
          className="scroll-mt-16 border-b-4 border-[#3b2f21]"
        >
          <h2 className="border-b-4 border-[#3b2f21] px-4 py-8 text-5xl font-black uppercase leading-none tracking-tighter sm:px-6 md:text-8xl">
            Tonight&apos;s{" "}
            <span className="font-display font-bold normal-case tracking-tight italic text-[#b45309]">
              lineup
            </span>
          </h2>
          {activeRooms.length > 0
            ? activeRooms
                .slice(0, 8)
                .map((hive) => (
                  <HoneycombRoom
                    key={hive.roomId}
                    room={liveToHiveRoom(hive)}
                    onJoin={handleJoinRoom}
                  />
                ))
            : HIVE_ROOMS.map((room) => (
                <HoneycombRoom key={room.id} room={room} />
              ))}
        </section>

        {/* Leaderboard Section */}
        <section className="border-b-4 border-[#3b2f21]">
          <h2 className="border-b-4 border-[#3b2f21] bg-[#fde68a] px-4 py-8 text-5xl font-black uppercase leading-none tracking-tighter sm:px-6 md:text-8xl">
            Most sang{" "}
            <span className="font-display font-bold normal-case tracking-tight italic text-[#451a03]">
              songs
            </span>
          </h2>
          {dbStats?.trendingSongs && dbStats.trendingSongs.length > 0 ? (
            <ol>
              {dbStats.trendingSongs.map((song, i) => (
                <li
                  key={song.videoId}
                  className="flex items-center gap-4 border-b-4 border-[#3b2f21] px-4 py-3 last:border-b-0 sm:px-6"
                >
                  <span className="w-10 shrink-0 text-4xl font-black text-[#b45309] md:w-14 md:text-6xl">
                    {i + 1}
                  </span>
                  {song.thumbnail && (
                    <Image
                      src={song.thumbnail}
                      alt=""
                      width={96}
                      height={56}
                      className="hidden h-14 w-24 shrink-0 border-2 border-[#3b2f21] object-cover sm:block"
                    />
                  )}
                  <p className="min-w-0 flex-1 truncate text-lg font-bold uppercase md:text-2xl">
                    {song.title}
                  </p>
                  <span className="shrink-0 text-sm font-bold uppercase">
                    {song.count} {song.count === 1 ? "play" : "plays"}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="px-4 py-12 text-lg font-medium sm:px-6">
              No songs performed yet. Start a hive and be the first!
            </p>
          )}
        </section>

        {/* Create or Join a Hive Options Section */}
        <section
          id="create-or-join"
          className="grid scroll-mt-16 gap-1 border-b-4 border-[#3b2f21] bg-[#3b2f21] md:grid-cols-2"
        >
          {/* Option 1: Create Hive */}
          <form
            onSubmit={createForm.handleSubmit(handleCreateHive)}
            className={`flex flex-col gap-4 bg-[#f7f1e4] px-4 py-8 sm:px-6 ${
              highlightedCard === "create"
                ? "ring-4 ring-inset ring-[#b45309]"
                : ""
            }`}
          >
            <div>
              <h2 className="text-4xl font-black uppercase leading-none tracking-tighter">
                Create New Honeycomb
              </h2>
              <p className="mt-2 font-medium">
                Host a room and invite your squad
              </p>
            </div>
            <div className="mt-auto">
              <Label
                htmlFor="create-username"
                className="mb-2 block text-sm font-bold uppercase"
              >
                Your Stage Name (Host)
              </Label>
              <Input
                id="create-username"
                type="text"
                placeholder="e.g. QueenBee_99"
                aria-invalid={!!createForm.formState.errors.stageName}
                {...create("stageName")}
                className="h-14 border-4 border-[#3b2f21] bg-white text-base md:text-base font-medium text-[#3b2f21] shadow-none placeholder:text-[#3b2f21]/70"
              />
              {createForm.formState.errors.stageName && (
                <p className="mt-2 text-sm font-bold text-destructive">
                  {createForm.formState.errors.stageName.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="flex min-h-16 cursor-pointer items-center justify-center gap-2 border-4 border-[#3b2f21] bg-[#f59e0b] text-xl font-black uppercase hover:bg-[#fde68a]"
            >
              <Mic className="size-5" aria-hidden="true" />
              Create Honeycomb
            </button>
          </form>

          {/* Option 2: Join Hive */}
          <form
            onSubmit={joinForm.handleSubmit(handleJoinHive)}
            className={`flex flex-col gap-4 bg-[#f7f1e4] px-4 py-8 sm:px-6 ${
              highlightedCard === "join"
                ? "ring-4 ring-inset ring-[#b45309]"
                : ""
            }`}
          >
            <div>
              <h2 className="text-4xl font-black uppercase leading-none tracking-tighter">
                Join with Room Code
              </h2>
              <p className="mt-2 font-medium">Got a hive code? Drop right in</p>
            </div>
            <div className="mt-auto grid gap-3 sm:grid-cols-2">
              <div>
                <Label
                  htmlFor="join-username"
                  className="mb-2 block text-sm font-bold uppercase"
                >
                  Your Bee Name (Singer)
                </Label>
                <Input
                  id="join-username"
                  type="text"
                  placeholder="e.g. HoneyVocalist"
                  aria-invalid={!!joinForm.formState.errors.beeName}
                  {...join("beeName")}
                  className="h-14 border-4 border-[#3b2f21] bg-white text-base md:text-base font-medium text-[#3b2f21] shadow-none placeholder:text-[#3b2f21]/70"
                />
                {joinForm.formState.errors.beeName && (
                  <p className="mt-2 text-sm font-bold text-destructive">
                    {joinForm.formState.errors.beeName.message}
                  </p>
                )}
              </div>
              <div>
                <Label
                  htmlFor="join-code"
                  className="mb-2 block text-sm font-bold uppercase"
                >
                  Hive Hex Code
                </Label>
                <Input
                  id="join-code"
                  type="text"
                  placeholder="e.g. HEX-8492"
                  aria-invalid={!!joinForm.formState.errors.hexCode}
                  {...join("hexCode")}
                  onBlur={(e) => {
                    const val = e.target.value.toUpperCase();
                    joinForm.setValue("hexCode", val, {
                      shouldValidate: true,
                    });
                  }}
                  className="h-14 border-4 border-[#3b2f21] bg-white font-mono text-base md:text-base font-medium uppercase tracking-wider text-[#3b2f21] shadow-none placeholder:text-[#3b2f21]/70"
                />
                {joinForm.formState.errors.hexCode && (
                  <p className="mt-2 text-sm font-bold text-destructive">
                    {joinForm.formState.errors.hexCode.message}
                  </p>
                )}
              </div>
            </div>
            <button
              type="submit"
              className="flex min-h-16 cursor-pointer items-center justify-center gap-2 border-4 border-[#3b2f21] bg-[#3b2f21] text-xl font-black uppercase text-[#fdfaf3] hover:bg-[#b45309]"
            >
              <LogIn className="size-5" aria-hidden="true" />
              Enter Code
            </button>
          </form>
        </section>

        {/* Polished Honeycomb Workflow Cards Section */}
        <section
          id="how-it-works"
          className="scroll-mt-16 border-b-4 border-[#3b2f21]"
        >
          <h2 className="border-b-4 border-[#3b2f21] px-4 py-8 text-5xl font-black uppercase leading-none tracking-tighter sm:px-6 md:text-8xl">
            How the{" "}
            <span className="font-display font-bold normal-case tracking-tight italic text-[#b45309]">
              hive operates
            </span>
          </h2>
          <div className="grid gap-1 bg-[#3b2f21] md:grid-cols-3">
            {BEEHIVE_FEATURES.map((feat) => (
              <div key={feat.title} className="bg-[#f7f1e4] px-4 py-8 sm:px-6">
                <div className="text-8xl font-black leading-none tracking-tighter text-[#b45309]">
                  {feat.step}
                </div>
                <h3 className="mt-3 text-2xl font-black uppercase leading-tight">
                  {feat.title}
                </h3>
                <p className="mt-2 font-medium">{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="flex flex-wrap items-center justify-between gap-6 border-b-4 border-[#3b2f21] bg-[#f59e0b] px-4 py-10 sm:px-6">
          <div className="max-w-3xl">
            <h2 className="text-4xl font-black uppercase leading-none tracking-tighter md:text-6xl">
              Ready to Rule the Beehive Stage?
            </h2>
            <p className="mt-3 text-lg font-medium">
              Create your custom hexagon karaoke room in seconds. Invite friends
              and share the sweet sound.
            </p>
          </div>
          <a
            href="#create-or-join"
            className="flex min-h-16 items-center gap-3 bg-[#3b2f21] px-8 text-xl font-black uppercase text-[#fdfaf3] hover:bg-[#451a03]"
          >
            Launch My Hive Room
            <ArrowRight className="size-6" aria-hidden="true" />
          </a>
        </section>

        {/* Footer */}
        <footer className="flex flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm font-bold uppercase sm:px-6">
          <div className="flex flex-wrap items-center gap-6">
            <Dialog>
              <DialogTrigger
                render={
                  <button className="uppercase hover:text-[#b45309] cursor-pointer" />
                }
              >
                Terms of Service
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-[#fdfaf3] border-[#e4d8bd] text-[#3b2f21] rounded-3xl overflow-hidden">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black text-[#b45309]">
                    Terms of Service
                  </DialogTitle>
                  <DialogDescription className="text-[#3b2f21]/80">
                    Last updated: {new Date().toLocaleDateString()}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar text-left py-4">
                  <section>
                    <h4 className="text-[#b45309] font-bold mb-1">
                      1. The Hive Rules
                    </h4>
                    <p className="text-sm normal-case font-medium leading-relaxed">
                      Beereel is a platform for synchronized karaoke. By
                      creating or joining a &quot;Hive&quot;, you agree to use
                      the service for entertainment purposes only. Don&apos;t be
                      a buzzkill—respect other singers.
                    </p>
                  </section>
                  <section>
                    <h4 className="text-[#b45309] font-bold mb-1">
                      2. Content & Media
                    </h4>
                    <p className="text-sm normal-case font-medium leading-relaxed">
                      All video content is streamed via third-party providers
                      (YouTube). We do not host the media files. Users are
                      responsible for complying with the content provider&apos;s
                      terms. Please ensure your song choices respect copyright
                      and community standards.
                    </p>
                  </section>
                  <section>
                    <h4 className="text-[#b45309] font-bold mb-1">
                      3. Room Privacy
                    </h4>
                    <p className="text-sm normal-case font-medium leading-relaxed">
                      Hosts have full authority over their Hives, including the
                      ability to lock rooms, manage the queue, and remove
                      participants. Joining a room means you accept the
                      host&apos;s moderation.
                    </p>
                  </section>
                  <section>
                    <h4 className="text-[#b45309] font-bold mb-1">
                      4. Real-time Data
                    </h4>
                    <p className="text-sm normal-case font-medium leading-relaxed">
                      We use Supabase Realtime for synchronization. Your
                      presence (name and host status) is visible to other
                      members of the same hive. Temporary room state is stored
                      to ensure the music stays in sync.
                    </p>
                  </section>
                  <section>
                    <h4 className="text-[#b45309] font-bold mb-1">
                      5. Limitation of Liability
                    </h4>
                    <p className="text-sm normal-case font-medium leading-relaxed">
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
                  <button className="uppercase hover:text-[#b45309] cursor-pointer" />
                }
              >
                Privacy Policy
              </DialogTrigger>
              <DialogContent className="max-w-xl bg-[#fdfaf3] border-[#e4d8bd] text-[#3b2f21] rounded-3xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black text-[#b45309]">
                    Privacy Policy
                  </DialogTitle>
                  <DialogDescription className="text-[#3b2f21]/80">
                    How we handle your bee data.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 text-left py-4">
                  <p className="text-sm normal-case font-medium leading-relaxed">
                    We believe in privacy. Beereel does not require accounts or
                    email registration. Your &quot;Bee Name&quot; and room
                    preferences are stored locally on your device
                    (sessionStorage) and shared temporarily with other hive
                    members via encrypted real-time channels to enable
                    synchronization.
                  </p>
                  <p className="text-sm normal-case font-medium leading-relaxed">
                    Room states (queues and history) are persisted to a
                    temporary database to allow rooms to survive refreshes. No
                    permanent personal profiles are created.
                  </p>
                </div>
              </DialogContent>
            </Dialog>

            <Link
              href="/changelog"
              className="uppercase hover:text-[#b45309]"
            >
              Changelog
            </Link>
          </div>
          <p>
            &copy; {new Date().getFullYear()} {SITE_CONFIG.name}. All rights
            reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
