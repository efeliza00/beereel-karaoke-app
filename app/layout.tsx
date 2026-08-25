import type { Metadata } from "next";
import { Geist, Geist_Mono, Figtree } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { cn } from "@/lib/utils";

const figtree = Figtree({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Beereel - Sing Together, Anywhere",
  description:
    "Create virtual karaoke rooms, invite friends, and sing your favorite songs together in real-time. No stage needed.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("dark h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", figtree.variable)}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}<Toaster position="top-center" theme="dark" toastOptions={{
        className: "!bg-slate-900 !border !border-amber-500/25 !text-slate-100 !rounded-2xl",
      }} /></body>
    </html>
  );
}
