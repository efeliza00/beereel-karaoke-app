"use client";

import { Lock, QrCodeIcon } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface HiveQrDialogProps {
  roomId: string;
  locked?: boolean;
  full?: boolean;
  capacity?: number;
}

export default function HiveQrDialog({
  roomId,
  locked = false,
  full = false,
  capacity,
}: HiveQrDialogProps) {
  const joinUrl =
    typeof window === "undefined"
      ? ""
      : `${window.location.origin}/room/${roomId}`;

  const unavailable = locked || full;

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className={`cursor-pointer ${
              unavailable ? "text-red-300 border-red-500/40" : ""
            }`}
            aria-label="Show hive QR code"
          />
        }
      >
        {unavailable ? <Lock size={14} /> : <QrCodeIcon />}
      </DialogTrigger>
      <DialogContent className="data-open:slide-in-from-top-8 data-closed:slide-out-to-top-8 data-open:zoom-in-100 data-closed:zoom-out-100 duration-300 [[data-slot=dialog-overlay]:has(~_&)]:duration-300 bg-[#fdfaf3] border-amber-500/25">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="flex items-center justify-center size-12 rounded-full bg-amber-500/10 text-amber-500">
            <QrCodeIcon size={20} />
          </div>
          <DialogHeader className="items-center">
            <DialogTitle className="text-[#3b2f21]">
              Scan to Join the Hive
            </DialogTitle>
            <DialogDescription className="text-[#857558]">
              Point your camera at the code to jump straight into room{" "}
              <span className="font-mono font-bold text-[#b45309]">
                {roomId}
              </span>
              .
            </DialogDescription>
          </DialogHeader>

          {unavailable ? (
            <div className="w-full rounded-2xl border border-red-500/30 bg-red-500/5 p-6 text-center">
              <Lock className="size-8 mx-auto mb-2 text-red-500" />
              <p className="text-sm font-black text-red-700">
                {locked ? "This hive is locked" : "This hive is full"}
              </p>
              <p className="text-xs text-[#857558] mt-1.5 leading-relaxed">
                New bees can&apos;t join right now
                {capacity !== undefined && !locked
                  ? ` — capacity is ${capacity}.`
                  : ". "}
                {locked
                  ? "Scanning will work again once the host unlocks the room."
                  : "Scanning will work again once space frees up."}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-[#eadfc9] bg-white p-3 shadow-sm">
                {joinUrl ? <QRCodeSVG value={joinUrl} size={192} /> : null}
              </div>
              <p className="text-xs font-mono text-[#857558] break-all">
                {joinUrl}
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
