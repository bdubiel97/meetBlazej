import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const photography = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/photography" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    coverImage: z.string(),
    photos: z.array(
      z.object({
        src: z.string(),
        alt: z.string(),
        caption: z.string().optional(),
      })
    ),
  }),
});

export const collections = { photography };
