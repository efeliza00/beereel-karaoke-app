# 🐝 Beereel — Karaoke Hive

Real-time karaoke rooms. Create a hive, share the code, and sing together —
one host runs the stage while everyone queues songs, reacts live, and enjoys
the show.

## Features

- **Rooms (hives)** — join with a room ID, share via QR / copy button
- **Host-authoritative stage** — host controls playback; queue & history sync
  to everyone and survive host refresh
- **Media control settings** — optionally let guests play/pause/seek
  (`everyoneCanControl`, default off)
- **Live reactions** — floating emoji with sender name, synced across the room
- **Now-playing awareness** — marquee title bar, "up next" toast at 75% of the
  track, now-playing card in the queue tab
- **Vinyl guest view** — non-hosts get a spinning-vinyl player (muted, synced)

## Tech Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase Realtime (presence + broadcast channels per room)
- media-chrome + youtube-video-element for playback
- Prisma (PostgreSQL) scaffolded for future server-side persistence

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), create a hive, and share
the room code.

### Environment

`.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SERPAPI_API_KEY=...        # YouTube search backend
DATABASE_URL=...           # Postgres (Prisma, optional today)
DIRECT_URL=...
```

## Project Layout

```
app/                 # routes: landing, room/[roomId], youtube-search API
components/
  room/              # beereel-room orchestrator, player, tabs, reactions…
  kibo-ui/           # video-player primitives
  shadcn-space/      # curated dialog/button/tabs/sonner demos
  ui/                # base UI components
lib/supabase/client  # browser Supabase client
```
