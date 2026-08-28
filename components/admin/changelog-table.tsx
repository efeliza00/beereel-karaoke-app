"use client";

import {
  CalendarDays,
  EllipsisVertical,
  Eye,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteChangelogEntry } from "@/app/admin/(dashboard)/changelog/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TYPE_STYLES,
  itemIconOf,
  type ChangelogEntry,
  type ChangelogItemIcon,
} from "@/lib/changelog-meta";

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ChangelogTable({ entries }: { entries: ChangelogEntry[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [viewEntry, setViewEntry] = useState<ChangelogEntry | null>(null);
  const [deleteEntry, setDeleteEntry] = useState<ChangelogEntry | null>(null);

  function handleDelete() {
    if (!deleteEntry) return;
    startTransition(async () => {
      await deleteChangelogEntry(deleteEntry.id);
      setDeleteEntry(null);
      router.refresh();
    });
  }

  if (entries.length === 0) {
    return (
      <Card className="rounded-4xl">
        <CardContent className="flex flex-col items-center py-16 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-[#fde68a] to-[#fbbf24] text-[#78350f] shadow-neumorph-inset-sm">
            <Plus className="size-8" />
          </div>
          <h3 className="mb-2 text-xl font-bold">No changelog entries yet</h3>
          <p className="mb-6 text-muted-foreground">
            Start documenting your changes by creating your first entry.
          </p>
          <Link href="/admin/changelog/new">
            <Button className="cursor-pointer">
              <Plus className="size-4" />
              Create First Entry
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full gap-6 overflow-hidden rounded-4xl pb-0 pt-6">
        <CardHeader className="px-6">
          <CardTitle className="text-lg font-bold">Entries</CardTitle>
          <CardDescription>
            {entries.length} changelog{" "}
            {entries.length === 1 ? "entry" : "entries"} published.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <Table className="min-w-2xl">
              <TableHeader>
                <TableRow className="hover:bg-transparent!">
                  <TableHead className="w-12 p-3 ps-6">#</TableHead>
                  <TableHead className="p-2">Entry</TableHead>
                  <TableHead className="p-2">Type</TableHead>
                  <TableHead className="p-2">Version</TableHead>
                  <TableHead className="p-3 pe-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {entries.map((entry, index) => (
                  <TableRow key={entry.id}>
                    <TableCell className="whitespace-nowrap p-3 ps-6 text-sm text-muted-foreground">
                      {index + 1}
                    </TableCell>

                    <TableCell className="max-w-0 p-2">
                      <div className="min-w-0">
                        <h6 className="truncate text-sm font-medium">
                          {entry.title}
                        </h6>
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CalendarDays className="size-3" />
                          {formatDate(entry.date)}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="whitespace-nowrap p-2">
                      <Badge
                        className={
                          TYPE_STYLES[entry.type] ?? "bg-gray-100 text-gray-800"
                        }
                      >
                        {entry.type}
                      </Badge>
                    </TableCell>

                    <TableCell className="whitespace-nowrap p-2 font-mono text-sm text-amber-600">
                      v{entry.version}
                    </TableCell>

                    <TableCell className="whitespace-nowrap p-3 pe-6">
                      <div className="flex items-center justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <span className="flex cursor-pointer items-center justify-center rounded-full p-2 hover:bg-muted">
                              <EllipsisVertical className="size-4" />
                            </span>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => setViewEntry(entry)}
                            >
                              <Eye className="size-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              render={
                                <Link
                                  href={`/admin/changelog/${entry.id}/edit`}
                                />
                              }
                            >
                              <Pencil className="size-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              className="cursor-pointer"
                              onClick={() => setDeleteEntry(entry)}
                            >
                              <Trash2 className="size-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View dialog */}
      <Dialog
        open={viewEntry !== null}
        onOpenChange={(open) => {
          if (!open) setViewEntry(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          {viewEntry ? (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      TYPE_STYLES[viewEntry.type] ??
                      "bg-gray-100  text-gray-800"
                    }
                  >
                    {viewEntry.type}
                  </Badge>
                  <span className="font-mono text-xs text-muted-foreground">
                    v{viewEntry.version}
                  </span>
                </div>
                <DialogTitle className="text-lg font-bold">
                  {viewEntry.title}
                </DialogTitle>
                <DialogDescription>
                  {formatDate(viewEntry.date)}
                </DialogDescription>
              </DialogHeader>

              {viewEntry.description ? (
                <p className="text-sm leading-relaxed">
                  {viewEntry.description}
                </p>
              ) : null}

              {viewEntry.listItems && viewEntry.listItems.length > 0 ? (
                <ul className="space-y-2">
                  {viewEntry.listItems.map((item, i) => {
                    const meta = itemIconOf(item.icon as ChangelogItemIcon);
                    return (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <meta.icon className={`size-4 ${meta.className}`} />
                        <span>{item.text}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteEntry !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteEntry(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete entry</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                {deleteEntry?.title}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteEntry(null)}
              disabled={isPending}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
              className="cursor-pointer"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
