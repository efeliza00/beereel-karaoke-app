"use client";

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
import { Switch } from "@/components/ui/switch";
import { SlidersHorizontal } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";

type HiveSettings = {
  everyoneCanSing: boolean;
  everyoneCanControl: boolean;
  requireApproval: boolean;
  queueLimit: number;
  guestLimit: number;
  autoPlayNext: boolean;
  allowDuplicateSongs: boolean;
  roomLocked: boolean;
};

const hiveSettingsSchema = z.object({
  queueLimit: z.number().int().min(1).max(100),
  guestLimit: z.number().int().min(2).max(200),
});

type HiveSettingsFormData = z.infer<typeof hiveSettingsSchema>;

interface HiveSettingsDialogProps {
  settings: HiveSettings;
  onUpdate: (newSettings: HiveSettings) => void;
}

const DIALOG_ANIMATION =
  "data-open:slide-in-from-top-8 data-closed:slide-out-to-top-8 data-open:zoom-in-100 data-closed:zoom-out-100 duration-300 [[data-slot=dialog-overlay]:has(~_&)]:duration-300";

export default function HiveSettingsDialog({
  settings,
  onUpdate,
}: HiveSettingsDialogProps) {
  const { register, watch } = useForm<HiveSettingsFormData>({
    resolver: zodResolver(hiveSettingsSchema),
    defaultValues: {
      queueLimit: settings.queueLimit,
      guestLimit: settings.guestLimit,
    },
  });

  const queueLimitVal = watch("queueLimit");
  const guestLimitVal = watch("guestLimit");

  useEffect(() => {
    const t = setTimeout(() => {
      const n = Number(queueLimitVal);
      if (Number.isNaN(n)) return;
      const clamped = Math.min(100, Math.max(1, n));
      if (clamped !== settings.queueLimit) {
        onUpdate({ ...settings, queueLimit: clamped });
      }
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queueLimitVal]);

  useEffect(() => {
    const t = setTimeout(() => {
      const n = Number(guestLimitVal);
      if (Number.isNaN(n)) return;
      const clamped = Math.min(200, Math.max(2, n));
      if (clamped !== settings.guestLimit) {
        onUpdate({ ...settings, guestLimit: clamped });
      }
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guestLimitVal]);

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer gap-1.5 text-[#b45309] border-[#f59e0b]/40 hover:bg-[#f59e0b]/10 hover:text-[#451a03] px-2.5 sm:px-3"
          />
        }
      >
        <SlidersHorizontal size={14} className="shrink-0" />
        <span className="hidden sm:inline">Hive Settings</span>
      </DialogTrigger>
      <DialogContent
        className={`${DIALOG_ANIMATION} sm:max-w-[425px] bg-[#fdfaf3] border-amber-500/25 shadow-2xl shadow-amber-500/10`}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#3b2f21]">
            <SlidersHorizontal size={16} className="text-[#b45309]" />
            Hive Settings
          </DialogTitle>
          <DialogDescription className="text-[#3b2f21]/80">
            As the host queen, you control how this hive operates. Changes are
            saved automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-4 rounded-xl border-2 border-[#3b2f21] bg-[#fdfaf3]/60 px-4 py-3">
            <div>
              <p className="text-sm font-bold text-[#3b2f21]">Guest Control</p>
              <p className="text-xs text-[#3b2f21]/80">
                Guests can add songs to the queue
              </p>
            </div>
            <Switch
              id="everyoneCanSing"
              checked={settings.everyoneCanSing}
              onCheckedChange={(checked: boolean) =>
                onUpdate({ ...settings, everyoneCanSing: checked })
              }
              className="data-[state=checked]:bg-amber-500 data-[state=unchecked]:bg-[#eadfc9]"
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border-2 border-[#3b2f21] bg-[#fdfaf3]/60 px-4 py-3">
            <div>
              <p className="text-sm font-bold text-[#3b2f21] flex items-center gap-2">
                Media Control
                <span className="inline-flex items-center rounded-full border-2 border-[#3b2f21] bg-[#efe6d2]/80 px-1.5 py-0.5 text-xs font-black uppercase tracking-wider text-[#3b2f21]/80">
                  Prefer disabled
                </span>
              </p>
              <p className="text-xs text-[#3b2f21]/80">
                Guests can play, pause, and seek video
              </p>
            </div>
            <Switch
              id="everyoneCanControl"
              checked={settings.everyoneCanControl}
              onCheckedChange={(checked: boolean) =>
                onUpdate({ ...settings, everyoneCanControl: checked })
              }
              className="data-[state=checked]:bg-amber-500 data-[state=unchecked]:bg-[#eadfc9]"
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border-2 border-[#3b2f21] bg-[#fdfaf3]/60 px-4 py-3">
            <div>
              <p className="text-sm font-bold text-[#3b2f21]">Queue Limit</p>
              <p className="text-xs text-[#3b2f21]/80">
                Max songs allowed in the queue
              </p>
            </div>
            <Input
              id="queueLimit"
              type="number"
              min={1}
              max={100}
              {...register("queueLimit", { valueAsNumber: true })}
              className="w-20 h-8 text-center bg-[#fdfaf3] border-[#eadfc9] text-[#3b2f21] font-mono font-bold focus-visible:ring-amber-400"
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border-2 border-[#3b2f21] bg-[#fdfaf3]/60 px-4 py-3">
            <div>
              <p className="text-sm font-bold text-[#3b2f21]">Guest Limit</p>
              <p className="text-xs text-[#3b2f21]/80">
                Max bees allowed in the hive
              </p>
            </div>
            <Input
              id="guestLimit"
              type="number"
              min={2}
              max={200}
              {...register("guestLimit", { valueAsNumber: true })}
              className="w-20 h-8 text-center bg-[#fdfaf3] border-[#eadfc9] text-[#3b2f21] font-mono font-bold focus-visible:ring-amber-400"
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border-2 border-[#3b2f21] bg-[#fdfaf3]/60 px-4 py-3">
            <div>
              <p className="text-sm font-bold text-[#3b2f21]">Auto Play Next</p>
              <p className="text-xs text-[#3b2f21]/80">
                Start the next song automatically
              </p>
            </div>
            <Switch
              id="autoPlayNext"
              checked={settings.autoPlayNext}
              onCheckedChange={(checked: boolean) =>
                onUpdate({ ...settings, autoPlayNext: checked })
              }
              className="data-[state=checked]:bg-amber-500 data-[state=unchecked]:bg-[#eadfc9]"
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border-2 border-[#3b2f21] bg-[#fdfaf3]/60 px-4 py-3">
            <div>
              <p className="text-sm font-bold text-[#3b2f21]">
                Allow Duplicate Songs
              </p>
              <p className="text-xs text-[#3b2f21]/80">
                Same song can be queued twice
              </p>
            </div>
            <Switch
              id="allowDuplicateSongs"
              checked={settings.allowDuplicateSongs}
              onCheckedChange={(checked: boolean) =>
                onUpdate({ ...settings, allowDuplicateSongs: checked })
              }
              className="data-[state=checked]:bg-amber-500 data-[state=unchecked]:bg-[#eadfc9]"
            />
          </div>

          <div
            className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3 ${
              settings.roomLocked
                ? "border-red-500/40 bg-red-500/5"
                : "border-[#eadfc9] bg-[#fdfaf3]/60"
            }`}
          >
            <div>
              <p
                className={`text-sm font-bold ${
                  settings.roomLocked ? "text-red-700" : "text-[#3b2f21]"
                }`}
              >
                Room Lock
              </p>
              <p className="text-xs text-[#3b2f21]/80">
                Prevent new bees from joining
              </p>
            </div>
            <Switch
              id="roomLocked"
              checked={settings.roomLocked}
              onCheckedChange={(checked: boolean) =>
                onUpdate({ ...settings, roomLocked: checked })
              }
              className="data-[state=checked]:bg-red-500 data-[state=unchecked]:bg-[#eadfc9]"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
