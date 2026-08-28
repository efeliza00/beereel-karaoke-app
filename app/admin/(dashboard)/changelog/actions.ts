"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import type { ChangelogStatus } from "@/lib/changelog-meta";
import {
  changelogEntrySchema,
  type ChangelogEntryValues,
} from "@/lib/validations";

function revalidate() {
  revalidatePath("/changelog");
  revalidatePath("/admin/changelog");
}

export async function createChangelogEntry(
  data: ChangelogEntryValues,
  status: ChangelogStatus = "draft",
) {
  const validated = changelogEntrySchema.parse(data);

  await prisma.changelogEntry.create({
    data: {
      ...validated,
      status,
      publishedAt: status === "published" ? new Date() : null,
    },
  });

  revalidate();
}

export async function updateChangelogEntry(
  id: string,
  data: ChangelogEntryValues,
  status: ChangelogStatus,
) {
  const validated = changelogEntrySchema.parse(data);

  const existing = await prisma.changelogEntry.findUnique({
    where: { id },
    select: { publishedAt: true },
  });

  const publishedAt =
    status === "published" ? (existing?.publishedAt ?? new Date()) : null;

  await prisma.changelogEntry.update({
    where: { id },
    data: { ...validated, status, publishedAt },
  });

  revalidate();
}

export async function publishChangelogEntry(id: string) {
  await prisma.changelogEntry.update({
    where: { id },
    data: { status: "published", publishedAt: new Date() },
  });

  revalidate();
}

export async function unpublishChangelogEntry(id: string) {
  await prisma.changelogEntry.update({
    where: { id },
    data: { status: "draft", publishedAt: null },
  });

  revalidate();
}

export async function deleteChangelogEntry(id: string) {
  await prisma.changelogEntry.delete({
    where: { id },
  });

  revalidate();
}
