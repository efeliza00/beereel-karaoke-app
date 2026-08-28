"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

import {
  createChangelogEntry,
  updateChangelogEntry,
} from "@/app/admin/(dashboard)/changelog/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ENTRY_TYPES,
  ITEM_ICONS,
  itemIconOf,
  type ChangelogEntry,
  type ChangelogItemIcon,
} from "@/lib/changelog-meta";
import { changelogEntrySchema, type ChangelogEntryValues } from "@/lib/validations";

export function ChangelogForm({ entry }: { entry?: ChangelogEntry }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEdit = Boolean(entry);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ChangelogEntryValues>({
    resolver: zodResolver(changelogEntrySchema),
    defaultValues: entry
      ? {
          version: entry.version,
          title: entry.title,
          description: entry.description ?? "",
          type: entry.type as ChangelogEntryValues["type"],
          listItems: entry.listItems.length
            ? entry.listItems
            : [{ text: "", icon: "update" as const }],
        }
      : {
          version: "",
          title: "",
          description: "",
          type: "feature",
          listItems: [{ text: "", icon: "update" as const }],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "listItems",
  });

  function onSubmit(data: ChangelogEntryValues) {
    startTransition(async () => {
      try {
        if (isEdit && entry) {
          await updateChangelogEntry(entry.id, data);
        } else {
          await createChangelogEntry(data);
        }
        router.refresh();
        router.push("/admin/changelog");
      } catch (error) {
        console.error("Failed to save changelog entry:", error);
      }
    });
  }

  return (
    <Card className="w-full max-w-3xl rounded-xl">
      <CardHeader>
        <CardTitle className="text-lg font-bold">
          {isEdit ? "Edit Changelog Entry" : "Add Changelog Entry"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="version">Version</Label>
            <Input
              id="version"
              placeholder="1.0.0"
              disabled={isPending}
              aria-invalid={!!errors.version}
              className="rounded-lg"
              {...register("version")}
            />
            {errors.version ? (
              <p className="text-xs text-destructive">
                {errors.version.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="What changed"
              disabled={isPending}
              aria-invalid={!!errors.title}
              className="rounded-lg"
              {...register("title")}
            />
            {errors.title ? (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the change"
              disabled={isPending}
              className="rounded-lg"
              {...register("description")}
            />
          </div>

          <div className="grid gap-2">
            <Label>Type</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => field.onChange(value as string)}
                  disabled={isPending}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {(value) =>
                        ENTRY_TYPES.find((t) => t.value === value)?.label ??
                        "Select a type"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {ENTRY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type ? (
              <p className="text-xs text-destructive">{errors.type.message}</p>
            ) : null}
          </div>

          <div className="grid gap-3">
            <div className="space-y-1">
              <Label>List Items</Label>
              <p className="text-xs text-muted-foreground">
                Highlight specific changes with an icon.
              </p>
            </div>

            <div className="grid gap-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid gap-2 rounded-lg border border-border/60 bg-background/40 p-3"
                >
                  <Label className="text-xs text-muted-foreground">
                    Item {index + 1}
                  </Label>
                  <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
                    <Input
                      placeholder="Item text"
                      disabled={isPending}
                      aria-invalid={!!errors.listItems?.[index]?.text}
                      className="rounded-lg"
                      {...register(`listItems.${index}.text`)}
                    />
                    <Controller
                      control={control}
                      name={`listItems.${index}.icon`}
                      render={({ field: iconField }) => (
                        <Select
                          value={iconField.value}
                          onValueChange={(value) =>
                            iconField.onChange(value as ChangelogItemIcon)
                          }
                          disabled={isPending}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue>
                              {(value) => {
                                if (!value) return "Icon";
                                const icon = itemIconOf(
                                  value as ChangelogItemIcon,
                                );
                                return (
                                  <span className="flex items-center gap-2">
                                    <icon.icon
                                      className={`size-4 ${icon.className}`}
                                    />
                                    {icon.label}
                                  </span>
                                );
                              }}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {ITEM_ICONS.map((icon) => (
                              <SelectItem key={icon.value} value={icon.value}>
                                <icon.icon className={icon.className} />
                                {icon.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1 || isPending}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Remove item"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  {errors.listItems?.[index]?.text ? (
                    <p className="text-xs text-destructive">
                      {errors.listItems[index]?.text?.message}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ text: "", icon: "update" })}
              disabled={isPending}
              className="w-fit"
            >
              <Plus className="size-4" />
              Add Item
            </Button>
          </div>

          <div className="flex justify-end gap-3 border-t border-border pt-5">
            <Button
              type="button"
              variant="ghost"
              disabled={isPending}
              onClick={() => router.push("/admin/changelog")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Add Entry"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
