import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Figtree, Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://beereel.vercel.app";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Beereel — Sing Together, Anywhere",
    template: "%s · Beereel",
  },
  description:
    "Create a hive, invite your friends, and karaoke together in real time. Live honeycomb rooms, synced playback, and instant reactions — no stage needed.",
  applicationName: "Beereel",
  alternates: {
    canonical: "/",
  },
  keywords: [
    "karaoke",
    "sing together",
    "virtual karaoke rooms",
    "real-time karaoke",
    "online karaoke party",
    "Beereel",
  ],
  manifest: "/logo/site.webmanifest",
  icons: {
    icon: [
      { url: "/logo/favicon.svg", type: "image/svg+xml" },
      {
        url: "/logo/favicon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
    ],
    apple: "/logo/apple-touch-icon.png",
  },
  openGraph: {
    title: "Beereel — Sing Together, Anywhere",
    description:
      "Create a hive, invite your friends, and karaoke together in real time. Live honeycomb rooms, synced playback, and instant reactions.",
    siteName: "Beereel",
    type: "website",
    images: [
      {
        url: `${BASE_URL}/og-image.png`, // Put your preview image file in the /public folder
        width: 1200,
        height: 630,
        alt: "Beereel Karaoke Stage Preview",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Beereel — Sing Together, Anywhere",
    description:
      "Create a hive, invite your friends, and karaoke together in real time.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        figtree.variable,
      )}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
        <Toaster
          position="top-center"
          theme="light"
          toastOptions={{
            className:
              "!bg-[#fdfaf3] !text-[#3b2f21] !rounded-2xl !border !border-[#eadfc9]",
          }}
        />
        <TooltipProvider></TooltipProvider>
      </body>
    </html>
  );
}
