import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Username is required")
    .max(64, "Username is too long"),
  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password is too long"),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const changelogEntrySchema = z.object({
  version: z.string().min(1, "Version is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.enum(["feature", "fix", "improvement"]),
  listItems: z.array(
    z.object({
      text: z.string().min(1, "Item text is required"),
      icon: z.enum(["fix", "update", "check"]),
    })
  ).min(1, "At least one list item is required"),
});

export type ChangelogEntryValues = z.infer<typeof changelogEntrySchema>;
