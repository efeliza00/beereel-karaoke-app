import { Plus } from "lucide-react";
import Link from "next/link";

import { ChangelogTable } from "@/components/admin/changelog-table";
import { Button } from "@/components/ui/button";
import { getChangelog } from "@/lib/changelog";

export default async function AdminChangelogPage() {
  let entries: Awaited<ReturnType<typeof getChangelog>>;
  try {
    entries = await getChangelog();
  } catch {
    entries = [];
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            <span className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 bg-clip-text text-transparent">
              Changelog
            </span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage the release notes shown on the public changelog page.
          </p>
        </div>
        <Link href="/admin/changelog/new">
          <Button className="cursor-pointer">
            <Plus className="size-4" />
            New Entry
          </Button>
        </Link>
      </div>

      <ChangelogTable entries={entries} />
    </div>
  );
}
