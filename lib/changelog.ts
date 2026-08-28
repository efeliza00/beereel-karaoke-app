import { prisma } from "@/lib/prisma";
import type { ChangelogEntry, ChangelogListItem } from "@/lib/changelog-meta";

function normalize<T extends { listItems: unknown }>(entry: T) {
  return {
    ...entry,
    listItems: (entry.listItems as ChangelogListItem[] | null) ?? [],
  };
}

export async function getChangelog(): Promise<ChangelogEntry[]> {
  const entries = await prisma.changelogEntry.findMany({
    orderBy: { createdAt: "desc" },
  });

  return entries.map((entry) => normalize(entry) as unknown as ChangelogEntry);
}

export async function getPublishedChangelog(): Promise<ChangelogEntry[]> {
  const entries = await prisma.changelogEntry.findMany({
    where: { status: "published" },
    orderBy: { publishedAt: "desc" },
  });

  return entries.map((entry) => normalize(entry) as unknown as ChangelogEntry);
}

export async function getChangelogEntry(
  id: string,
): Promise<ChangelogEntry | null> {
  const entry = await prisma.changelogEntry.findUnique({ where: { id } });
  if (!entry) return null;

  return normalize(entry) as unknown as ChangelogEntry;
}
