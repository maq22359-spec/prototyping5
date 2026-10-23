import { z } from "zod";

export const idSchema = z.uuid();
const webUrl = z.string().trim().max(2048).refine((value) => {
  if (!value) return true;
  try { return ["http:", "https:"].includes(new URL(value).protocol); }
  catch { return false; }
}, "Use a full http:// or https:// URL.");

export const boardSchema = z.object({
  title: z.string().trim().min(1, "Give your board a title.").max(120),
  description: z.string().trim().max(1000),
  is_public: z.boolean(),
});

export const itemSchema = z.object({
  image_url: webUrl,
  link_url: webUrl,
  title: z.string().trim().max(200),
  note: z.string().trim().max(2000),
}).refine((item) => Boolean(item.image_url || item.link_url), {
  message: "Add an image URL or a link to save an item.",
});
