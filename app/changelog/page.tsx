import { ArrowLeft, CalendarDays, Music } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { SiteFooter } from "@/components/landing/site-footer";
import {
  Timeline,
  TimelineContent,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
} from "@/components/reui/timeline";
import { Badge } from "@/components/ui/badge";
import { getPublishedChangelog } from "@/lib/changelog";
import {
  ENTRY_TYPES,
  ITEM_SECTIONS,
  TYPE_STYLES,
  type ChangelogEntry,
} from "@/lib/changelog-meta";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const entries = await getPublishedChangelog();
  const latestEntry = entries[0];

  return {
    title: "Changelog - Beereel",
    description:
      "What's new in Beereel - latest updates, features, and bug fixes",
    openGraph: {
      title: "Changelog - Beereel",
      description:
        "What's new in Beereel - latest updates, features, and bug fixes",
      type: "website",
      siteName: "Beereel",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "Beereel Changelog",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Changelog - Beereel",
      description:
        "What's new in Beereel - latest updates, features, and bug fixes",
      images: ["/og-image.png"],
    },
    alternates: {
      canonical: "/changelog",
    },
    other: {
      "article:published_time":
        latestEntry?.publishedAt?.toISOString() ?? new Date().toISOString(),
      "article:modified_time":
        latestEntry?.publishedAt?.toISOString() ?? new Date().toISOString(),
    },
  };
}

function formatMonthYear(date: Date | string) {
  return new Date(date).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function typeLabelOf(type: string) {
  return ENTRY_TYPES.find((t) => t.value === type)?.label ?? type;
}

function sectionsOf(entry: ChangelogEntry) {
  return ITEM_SECTIONS.map((section) => ({
    ...section,
    items: entry.listItems.filter((item) => item.icon === section.value),
  })).filter((section) => section.items.length > 0);
}

export default async function ChangelogPage() {
  const entries = await getPublishedChangelog();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* Background Honeycomb Hex Pattern SVG */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.08]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="changelog-hexagons"
              width="56"
              height="100"
              patternUnits="userSpaceOnUse"
              patternTransform="scale(1)"
            >
              <path
                d="M28 66L0 50L0 16L28 0L56 16L56 50L28 66Z M28 100L0 84L0 50L28 66L56 50L56 84L28 100Z"
                fill="none"
                stroke="#b45309"
                strokeWidth="1"
                strokeOpacity="0.35"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#changelog-hexagons)" />
        </svg>
      </div>

      {/* Radial Honey Glow Gradient */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.16),transparent_65%)]" />

      <header className="relative z-10 border-b border-border/60 bg-background/60 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 sm:py-10">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 sm:gap-3">
              <Image
                src="/logo/favicon-96x96.png"
                alt="Beereel Logo"
                width={40}
                height={40}
                quality={75}
                className="rounded-xl"
              />
              <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-lg font-extrabold tracking-tight text-transparent sm:text-xl">
                Beereel
              </span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-amber-600"
            >
              <ArrowLeft className="size-4" />
              Back to home
            </Link>
          </div>

          <div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              <span className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 bg-clip-text text-transparent">
                Changelog
              </span>
            </h1>
            <p className="mt-2 text-muted-foreground sm:text-lg">
              What&apos;s new in Beereel
            </p>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-3xl px-4 py-10 sm:py-14">
        {entries.length > 0 ? (
          <Timeline defaultValue={entries.length} className="w-full">
            {entries.map((entry, index) => {
              const sections = sectionsOf(entry);

              return (
                <TimelineItem key={entry.id} step={index + 1}>
                  <TimelineIndicator className="bg-primary ring-4 ring-primary/15" />
                  <TimelineSeparator />
                  <TimelineContent className="mb-2 rounded-4xl bg-card p-6 text-foreground shadow-neumorph-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-neumorph sm:p-8">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <Badge
                        className={
                          TYPE_STYLES[entry.type] ??
                          "bg-gray-100  text-gray-800"
                        }
                      >
                        {typeLabelOf(entry.type)}
                      </Badge>
                      <span className="font-mono text-sm font-semibold text-amber-600">
                        v{entry.version}
                      </span>
                      <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarDays className="size-3.5" />
                        {formatMonthYear(entry.publishedAt ?? entry.date)}
                      </span>
                    </div>

                    <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                      {entry.title}
                    </h2>

                    {entry.description ? (
                      <p className="mt-3 leading-relaxed text-muted-foreground sm:text-base">
                        {entry.description}
                      </p>
                    ) : null}

                    {sections.length > 0 ? (
                      <div className="mt-6 grid gap-5">
                        {sections.map((section) => (
                          <section key={section.value}>
                            <h3 className="flex items-center gap-2 text-lg font-bold uppercase tracking-widest text-foreground/70">
                              {section.label}
                            </h3>
                            <ul className="mt-3 space-y-2">
                              {section.items.map((item, i) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-2.5 text-sm leading-relaxed sm:text-base"
                                >
                                  <section.icon
                                    className={`mt-1 size-4 shrink-0 ${section.className}`}
                                  />
                                  <span>{item.text}</span>
                                </li>
                              ))}
                            </ul>
                          </section>
                        ))}
                      </div>
                    ) : null}
                  </TimelineContent>
                </TimelineItem>
              );
            })}
          </Timeline>
        ) : (
          <div className="flex flex-col items-center rounded-4xl bg-card py-16 text-center shadow-neumorph">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-[#fde68a] to-[#fbbf24] text-[#78350f] shadow-neumorph-inset-sm">
              <Music className="size-8" />
            </div>
            <h2 className="mb-2 text-xl font-bold">No updates yet</h2>
            <p className="text-muted-foreground">
              Release notes will appear here once the hive starts buzzing.
            </p>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
