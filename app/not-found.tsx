"use client";

import SwarmCursor from "@/components/SwarmCursor";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";
import { motion } from "motion/react";

export default function NotFound() {
  return (
    <SwarmCursor
      color="#f59e0b"
      accentColor="#fde68a"
      count={2}
      size={10}
      glow={0.1}
      trail={0.05}
      speed={3}
      className="min-h-dvh bg-slate-950"
    >
      <div className="min-h-dvh flex flex-col items-center justify-center px-4 relative z-10">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-20 size-96 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="absolute -bottom-40 -right-20 size-96 rounded-full bg-amber-400/10 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center max-w-md"
        >
          {/* Error code with bee */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl"
            >
              🐝
            </motion.div>
            <span className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 leading-none">
              404
            </span>
            <motion.div
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
              className="text-6xl"
            >
              🍯
            </motion.div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-black text-slate-100 mb-4">
            Hive Not Found
          </h1>

          {/* Description */}
          <p className="text-slate-400 text-lg mb-10 max-w-sm mx-auto leading-relaxed">
            This hive appears to be empty. The bees must have swarmed elsewhere.
            No karaoke stage exists at this path — but don&apos;t worry,
            we&apos;ll help you find your way back to the music.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-black hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/25 gap-2"
              onClick={() => (window.location.href = "/")}
            >
              <Home className="size-5" />
              Back to the Hive
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-amber-500/30 text-amber-300 hover:bg-amber-500/10 hover:border-amber-400 gap-2"
              onClick={() => window.history.back()}
            >
              <Search className="size-5" />
              Search for a Song
            </Button>
          </div>

          {/* Decorative honeycomb pattern */}
          <div className="mt-16 flex justify-center gap-1.5 opacity-30">
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                className="w-3 h-3.5"
                style={{
                  clipPath:
                    "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                }}
              >
                <div
                  className="w-full h-full bg-gradient-to-br from-amber-400/30 to-amber-600/30"
                  style={{
                    clipPath:
                      "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                  }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </SwarmCursor>
  );
}
