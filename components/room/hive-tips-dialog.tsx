"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { HeartHandshake } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const STORAGE_KEY = "bee-tips-dont-show";

const tipsSchema = z.object({
  dontShow: z.boolean(),
});

type TipsFormData = z.infer<typeof tipsSchema>;

const DIALOG_ANIMATION =
  "data-open:slide-in-from-top-8 data-closed:slide-out-to-top-8 data-open:zoom-in-100 data-closed:zoom-out-100 duration-300 [[data-slot=dialog-overlay]:has(~_&)]:duration-300";

export default function HiveTipsDialog({
  reopenSignal = 0,
}: {
  reopenSignal?: number;
}) {
  const [open, setOpen] = useState(false);

  const { register, getValues } = useForm<TipsFormData>({
    resolver: zodResolver(tipsSchema),
    defaultValues: { dontShow: false },
  });

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== "1") {
        const t = setTimeout(() => setOpen(true), 600);
        return () => clearTimeout(t);
      }
    } catch {
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    if (reopenSignal > 0) setOpen(true);
  }, [reopenSignal]);

  const handleClose = () => {
    try {
      if (getValues("dontShow")) localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        className={`${DIALOG_ANIMATION} border-[#eadfc9] bg-[#fdfaf3] max-w-sm`}
        showCloseButton={false}
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="flex items-center justify-center size-14 rounded-full bg-amber-400/10 text-amber-500">
            <HeartHandshake className="size-7" />
          </div>

          <DialogHeader className="items-center">
            <DialogTitle className="text-xl text-[#3b2f21]">
              Keep the hive buzzing! 🐝
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-[#857558]">
              Beereel is free and runs on honey (and love). If you&apos;re
              enjoying the show, a small tip helps us keep the servers humming
              and the music playing. Every drop counts — no pressure, just
              good vibes!
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-3 shadow-lg shadow-amber-500/5">
            <Image
              src="/qrcode/qrcode-maintenance.jpg"
              alt="Tip jar QR code"
              width={200}
              height={200}
              className="rounded-xl"
              priority
            />
            <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-amber-500/80">
              Scan to tip the hive
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              {...register("dontShow")}
              className="size-4 rounded border-[#eadfc9] bg-[#fdfaf3] accent-amber-500 cursor-pointer"
            />
            <span className="text-xs font-medium text-[#857558]">
              Don&apos;t show this again
            </span>
          </label>

          <div className="flex flex-col w-full gap-2">
            <Button
              onClick={() => {
                void fetch("/api/gifts", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ amount: 1 }),
                }).catch(() => {});
                handleClose();
              }}
              className="w-full cursor-pointer bg-amber-400 hover:bg-amber-300 text-[#3b2f21] font-bold"
            >
              🍯 I sent a tip!
            </Button>
            <Button
              variant="ghost"
              onClick={handleClose}
              className="w-full cursor-pointer text-[#857558] hover:text-[#3b2f21] hover:bg-[#efe6d2]/60 text-sm"
            >
              Maybe later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
