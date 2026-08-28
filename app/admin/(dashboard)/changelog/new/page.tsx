import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { ChangelogForm } from "@/components/admin/changelog-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "New changelog entry",
};

export default function NewChangelogEntryPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            <span className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 bg-clip-text text-transparent">
              New Entry
            </span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Add a release note to the changelog.
          </p>
        </div>
        <Link href="/admin/changelog">
          <Button variant="ghost" className="cursor-pointer">
            <ArrowLeft className="size-4" />
            Back
          </Button>
        </Link>
      </div>

      <ChangelogForm />
    </div>
  );
}
