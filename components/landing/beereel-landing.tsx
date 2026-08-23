"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BEEHIVE_FEATURES,
  HIVE_ROOMS,
  NAV_LINKS,
  SITE_CONFIG,
  STATS,
} from "@/constants";
import {
  Award,
  Hexagon,
  Music,
} from "lucide-react";
import {
  MicIcon,
  UsersIcon,
  RadioIcon,
  PlayIcon,
  SparklesIcon,
  ZapIcon,
  ChevronRightIcon,
} from "lucide-animated";
import { motion } from "motion/react";
import { useState } from "react";

export default function BeereelLanding() {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950 relative overflow-hidden font-sans">
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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Hexagon className="w-6 h-6 text-slate-950 fill-amber-300 stroke-amber-950 stroke-2" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
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

            <div className="flex items-center gap-3">
              <Button className="bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-bold hover:from-amber-300 hover:to-amber-500 shadow-lg shadow-amber-500/25 border border-amber-300/50">
                <PlayIcon size={16} animateOnHover />
                Enter Hive
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
            Honey Beehive
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Connect with thousands of singers in interactive honeycomb rooms. Drop
          lyrics, stream live vocals, and collect virtual honey cheers!
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Button
            size="lg"
            className="bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-extrabold text-base px-8 py-6 shadow-xl shadow-amber-500/30 hover:scale-105 transition-transform border border-amber-300 gap-2"
          >
            <MicIcon size={20} animateOnHover />
            Start Singing Now
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-amber-500/40 text-amber-300 hover:bg-amber-500/10 hover:border-amber-400 text-base px-8 py-6 gap-2"
          >
            <RadioIcon size={20} animateOnHover />
            Browse Live Hives
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
                <span className="text-2xl md:text-3xl font-black bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent">
                  {st.value}
                </span>
                {st.icon && (
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform shrink-0">
                    <st.icon size={16} className="w-4 h-4" animateOnHover />
                  </div>
                )}
              </div>
              <div className="text-xs uppercase font-bold tracking-wider text-slate-400 text-left">
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
              Singing Hives
            </span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto mt-3 text-sm md:text-base">
            Pick a room, step up to the hexagonal stage, and start performing
            live.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {HIVE_ROOMS.map((room) => (
            <motion.div
              key={room.id}
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
            >
              <Card
                className={`h-full bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-900/90 backdrop-blur-xl ${room.border} hover:border-amber-400/90 transition-all duration-300 shadow-xl ${room.glow} hover:shadow-2xl hover:shadow-amber-500/25 overflow-hidden group cursor-pointer flex flex-col justify-between relative`}
                onClick={() => setSelectedRoom(room.name)}
              >
                {/* Top Colored Honey Line Accent */}
                <div
                  className={`h-1.5 w-full bg-gradient-to-r ${room.gradient}`}
                />

                <CardContent className="p-6 flex flex-col flex-1 justify-between">
                  <div>
                    {/* Header Badge & Singer Count */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-inner">
                        {room.badge}
                      </span>
                      <span className="text-xs text-slate-300 flex items-center gap-1.5 font-bold px-2 py-0.5 rounded-md bg-slate-900/80 border border-amber-500/20">
                        <UsersIcon size={14} animateOnHover />
                        {room.singers} Bees
                      </span>
                    </div>

                    {/* Room Title & Genre */}
                    <h3 className="text-xl font-extrabold text-slate-100 group-hover:text-amber-300 transition-colors mb-1">
                      {room.name}
                    </h3>
                    <p className="text-xs font-medium text-slate-400 mb-5">
                      {room.genre}
                    </p>

                    {/* Now Singing Player Box */}
                    <div className="bg-slate-950/80 rounded-xl p-3.5 border border-amber-500/20 mb-5 relative overflow-hidden group-hover:border-amber-400/40 transition-colors">
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-amber-400 font-bold mb-1.5">
                        <span className="flex items-center gap-1.5">
                          <Music className="w-3 h-3 text-amber-400 animate-pulse" />
                          Now Singing
                        </span>
                        {/* Audio Wave Equalizer Bars */}
                        <div className="flex items-end gap-0.5 h-3">
                          <span className="w-0.5 h-full bg-amber-400 animate-pulse" />
                          <span className="w-0.5 h-2/3 bg-amber-400 animate-bounce" />
                          <span className="w-0.5 h-full bg-amber-400 animate-pulse" />
                        </div>
                      </div>
                      <div className="text-sm font-bold text-slate-100 truncate">
                        {room.nowSinging}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Host & Join Action */}
                  <div className="flex items-center justify-between pt-3 border-t border-amber-500/15 mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-[11px] font-black text-amber-300">
                        {room.avatar}
                      </div>
                      <span className="text-xs text-slate-400">
                        Host:{" "}
                        <strong className="text-slate-200">{room.host}</strong>
                      </span>
                    </div>
                    <span className="text-xs text-slate-950 font-black px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 group-hover:from-amber-300 group-hover:to-amber-400 transition-all flex items-center gap-1 shadow-md shadow-amber-500/20">
                      Join <ChevronRightIcon size={14} animateOnHover />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
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
                      <feat.icon size={28} className="w-7 h-7 text-slate-950 stroke-[2.5]" animateOnHover />
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
          <Button
            size="lg"
            className="bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-black text-base px-8 py-6 shadow-xl shadow-amber-500/30 hover:scale-105 transition-transform border border-amber-300/50 gap-2"
          >
            <ZapIcon size={20} animateOnHover />
            Launch My Hive Room
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-amber-500/20 text-center text-xs text-slate-500 relative z-10">
        &copy; {new Date().getFullYear()} {SITE_CONFIG.name}. All rights
        reserved.
      </footer>
    </div>
  );
}
