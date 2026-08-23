"use client";

import { Music } from "lucide-react";
import {
  MicIcon,
  UsersIcon,
  HeartIcon,
  SparklesIcon,
  UserRoundPlusIcon,
  FlameIcon,
  RadioIcon,
} from "lucide-animated";

export const SITE_CONFIG = {
  name: "Beereel",
  description: "Virtual karaoke rooms to sing together in real-time.",
};

export const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Community", href: "#community" },
];

export const FOOTER_LINKS = [
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
  { label: "Contact", href: "#" },
];

export const FEATURES = [
  {
    icon: MicIcon,
    title: "Create Rooms",
    description:
      "Start your own karaoke room in seconds. Choose a name, pick a theme, and invite your crew to sing along.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: UsersIcon,
    title: "Join the Party",
    description:
      "Jump into any open room with a single tap. Discover new friends, discover new songs, and sing your heart out together.",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    icon: HeartIcon,
    title: "React & Vibe",
    description:
      "Send emojis, cheers, and reactions in real-time. Hype up your friends and keep the energy flowing.",
    gradient: "from-amber-500 to-orange-600",
  },
];

export const HOW_IT_WORKS = [
  {
    step: "01",
    icon: SparklesIcon,
    title: "Create a Room",
    description: "Pick a name and theme for your karaoke session.",
  },
  {
    step: "02",
    icon: UserRoundPlusIcon,
    title: "Invite Friends",
    description: "Share the room link and get your crew together.",
  },
  {
    step: "03",
    icon: Music,
    title: "Sing & React",
    description: "Pick songs, take turns, and send reactions in real-time.",
  },
];

export const STATS = [
  { value: "12,400+", label: "Active Bees", icon: UsersIcon },
  { value: "85,000+", label: "Songs in Cell", icon: Music },
  { value: "3,200+", label: "Live Hives", icon: RadioIcon },
  { value: "1.2M", label: "Honey Gifts", icon: SparklesIcon },
];

export const HIVE_ROOMS = [
  {
    id: "hive-1",
    name: "Golden Hits Hive",
    genre: "Pop & Classic Hits",
    singers: 12,
    nowSinging: "Bohemian Rhapsody",
    host: "Maya B.",
    avatar: "MB",
    gradient: "from-amber-400 via-amber-500 to-yellow-500",
    glow: "shadow-amber-500/20",
    border: "border-amber-500/30",
    badge: "LIVE PARTY",
    activeWave: true,
  },
  {
    id: "hive-2",
    name: "Honeycomb Beats",
    genre: "Hip-Hop & R&B Vibe",
    singers: 8,
    nowSinging: "Blinding Lights",
    host: "Buzz J",
    avatar: "BJ",
    gradient: "from-yellow-400 via-amber-500 to-amber-600",
    glow: "shadow-yellow-500/20",
    border: "border-yellow-500/30",
    badge: "HOT STAGE",
    activeWave: true,
  },
  {
    id: "hive-3",
    name: "Sweet Melodies",
    genre: "Acoustic & Chill",
    singers: 15,
    nowSinging: "Hotel California",
    host: "Queen Bee",
    avatar: "QB",
    gradient: "from-amber-500 via-orange-500 to-yellow-400",
    glow: "shadow-orange-500/20",
    border: "border-orange-500/30",
    badge: "TRENDING",
    activeWave: false,
  },
  {
    id: "hive-4",
    name: "Neon Buzz Karaoke",
    genre: "80s Synth & Rock",
    singers: 20,
    nowSinging: "Take On Me",
    host: "Stinger V.",
    avatar: "SV",
    gradient: "from-yellow-300 via-amber-400 to-amber-600",
    glow: "shadow-amber-400/20",
    border: "border-amber-400/30",
    badge: "FULL HOUSE",
    activeWave: true,
  },
];

export const BEEHIVE_FEATURES = [
  {
    icon: MicIcon,
    step: "01",
    title: "Create Your Hive Cell",
    desc: "Start a honeycomb karaoke room in seconds. Choose audio filters, custom pitch presets, and invite your squad.",
  },
  {
    icon: UsersIcon,
    step: "02",
    title: "Gather the Swarm",
    desc: "Invite friends via quick room hex-codes or join public live sing-alongs with real-time room sync.",
  },
  {
    icon: FlameIcon,
    step: "03",
    title: "Earn Nectar & Rank Up",
    desc: "Get hyped with virtual honey gifts, live emoji cheers, and unlock golden leaderboard badges.",
  },
];

// Aliases for backward compatibility
export const features = FEATURES;
export const howItWorks = HOW_IT_WORKS;
export const stats = STATS;
