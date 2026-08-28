"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SITE_CONFIG } from "@/constants";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="relative z-10 flex flex-col items-center gap-4 border-t border-[#e4d8bd] py-12 text-center text-xs text-[#a39478]">
      <div className="mb-2 flex items-center gap-6">
        <Dialog>
          <DialogTrigger
            render={
              <button className="cursor-pointer transition-colors hover:text-amber-400" />
            }
          >
            Terms of Service
          </DialogTrigger>
          <DialogContent className="max-w-2xl overflow-hidden rounded-3xl border-[#e4d8bd] bg-[#fdfaf3] text-[#3b2f21]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-amber-400">
                Terms of Service
              </DialogTitle>
              <DialogDescription className="text-[#857558]">
                Last updated: {new Date().toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            <div className="custom-scrollbar max-h-[60vh] space-y-4 overflow-y-auto py-4 pr-2 text-left">
              <section>
                <h4 className="mb-1 font-bold text-amber-300">
                  1. The Hive Rules
                </h4>
                <p className="text-xs leading-relaxed">
                  Beereel is a platform for synchronized karaoke. By creating or
                  joining a &quot;Hive&quot;, you agree to use the service for
                  entertainment purposes only. Don&apos;t be a buzzkill—respect
                  other singers.
                </p>
              </section>
              <section>
                <h4 className="mb-1 font-bold text-amber-300">
                  2. Content & Media
                </h4>
                <p className="text-xs leading-relaxed">
                  All video content is streamed via third-party providers
                  (YouTube). We do not host the media files. Users are
                  responsible for complying with the content provider&apos;s
                  terms. Please ensure your song choices respect copyright and
                  community standards.
                </p>
              </section>
              <section>
                <h4 className="mb-1 font-bold text-amber-300">
                  3. Room Privacy
                </h4>
                <p className="text-xs leading-relaxed">
                  Hosts have full authority over their Hives, including the
                  ability to lock rooms, manage the queue, and remove
                  participants. Joining a room means you accept the host&apos;s
                  moderation.
                </p>
              </section>
              <section>
                <h4 className="mb-1 font-bold text-amber-300">
                  4. Real-time Data
                </h4>
                <p className="text-xs leading-relaxed">
                  We use Supabase Realtime for synchronization. Your presence
                  (name and host status) is visible to other members of the same
                  hive. Temporary room state is stored to ensure the music stays
                  in sync.
                </p>
              </section>
              <section>
                <h4 className="mb-1 font-bold text-amber-300">
                  5. Limitation of Liability
                </h4>
                <p className="text-xs leading-relaxed">
                  Beereel is provided &quot;as is&quot;. We aren&apos;t liable
                  for off-key singing, missed high notes, or synchronized
                  playback drift due to internet latency. Rock on at your own
                  risk.
                </p>
              </section>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger
            render={
              <button className="cursor-pointer transition-colors hover:text-amber-400" />
            }
          >
            Privacy Policy
          </DialogTrigger>
          <DialogContent className="max-w-xl rounded-3xl border-[#e4d8bd] bg-[#fdfaf3] text-[#3b2f21]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-amber-400">
                Privacy Policy
              </DialogTitle>
              <DialogDescription className="text-[#857558]">
                How we handle your bee data.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 text-left">
              <p className="text-xs leading-relaxed">
                We believe in privacy. Beereel does not require accounts or
                email registration. Your &quot;Bee Name&quot; and room
                preferences are stored locally on your device (sessionStorage)
                and shared temporarily with other hive members via encrypted
                real-time channels to enable synchronization.
              </p>
              <p className="text-xs leading-relaxed">
                Room states (queues and history) are persisted to a temporary
                database to allow rooms to survive refreshes. No permanent
                personal profiles are created.
              </p>
            </div>
          </DialogContent>
        </Dialog>

        <Link href="/changelog" className="transition-colors hover:text-amber-400">
          Changelog
        </Link>
      </div>
      <p className="opacity-60">
        &copy; {new Date().getFullYear()} {SITE_CONFIG.name}. All rights
        reserved.
      </p>
    </footer>
  );
}
