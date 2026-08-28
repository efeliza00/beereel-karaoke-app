import { CircleCheck, Sparkles, Wrench, type LucideIcon } from "lucide-react";

export type ChangelogItemIcon = "fix" | "update" | "check";

export type ChangelogStatus = "draft" | "published";

export type ChangelogListItem = {
  text: string;
  icon: ChangelogItemIcon;
};

export type ChangelogEntry = {
  id: string;
  version: string;
  title: string;
  description: string | null;
  type: string;
  date: Date;
  listItems: ChangelogListItem[];
  status: ChangelogStatus;
  publishedAt: Date | null;
  createdAt: Date;
};

export const ENTRY_TYPES = [
  { value: "feature", label: "Feature" },
  { value: "fix", label: "Bug Fix" },
  { value: "improvement", label: "Improvement" },
] as const;

export type EntryTypeValue = (typeof ENTRY_TYPES)[number]["value"];

export const ITEM_ICONS: {
  value: ChangelogItemIcon;
  label: string;
  icon: LucideIcon;
  className: string;
}[] = [
  { value: "fix", label: "Fix", icon: Wrench, className: "text-red-500" },
  {
    value: "update",
    label: "Update",
    icon: Sparkles,
    className: "text-amber-500",
  },
  {
    value: "check",
    label: "Check",
    icon: CircleCheck,
    className: "text-green-500",
  },
];

export const ITEM_SECTIONS: {
  value: ChangelogItemIcon;
  label: string;
  icon: LucideIcon;
  className: string;
}[] = [
  {
    value: "check",
    label: "New",
    icon: CircleCheck,
    className: "text-emerald-500",
  },
  {
    value: "update",
    label: "Improvements",
    icon: Sparkles,
    className: "text-amber-500",
  },
  { value: "fix", label: "Fixes", icon: Wrench, className: "text-red-500" },
];

export const TYPE_STYLES: Record<string, string> = {
  feature: "bg-amber-100 text-amber-800",
  fix: "bg-red-100 text-red-800",
  improvement: "bg-green-100 text-green-800",
};

export const STATUS_STYLES: Record<ChangelogStatus, string> = {
  draft: "bg-secondary text-muted-foreground",
  published: "bg-green-100 text-green-800",
};

export function itemIconOf(value: ChangelogItemIcon) {
  return ITEM_ICONS.find((i) => i.value === value) ?? ITEM_ICONS[0];
}
