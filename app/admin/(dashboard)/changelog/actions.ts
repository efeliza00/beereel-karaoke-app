"use server";

import { prisma } from "@/lib/prisma";
import { changelogEntrySchema, type ChangelogEntryValues } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function createChangelogEntry(data: ChangelogEntryValues) {
  const validated = changelogEntrySchema.parse(data);

  await prisma.changelogEntry.create({
    data: validated,
  });

  revalidatePath("/changelog");
  revalidatePath("/admin/changelog");
}

export async function updateChangelogEntry(
  id: string,
  data: ChangelogEntryValues,
) {
  const validated = changelogEntrySchema.parse(data);

  await prisma.changelogEntry.update({
    where: { id },
    data: validated,
  });

  revalidatePath("/changelog");
  revalidatePath("/admin/changelog");
}

export async function deleteChangelogEntry(id: string) {
  await prisma.changelogEntry.delete({
    where: { id },
  });

  revalidatePath("/changelog");
  revalidatePath("/admin/changelog");
}
