import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// A category can be written as a single string ("Minolta XD7") or an array
// of strings (["Minolta XD7", "Canon AE-1"]) when there's more than one —
// either way it's normalized to an array for rendering.
const equipmentCategory = z
  .union([z.string(), z.array(z.string())])
  .transform((value) => (Array.isArray(value) ? value : [value]));

const photography = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/photography" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    location: z.string(),
    equipment: z.object({
      camera: equipmentCategory,
      film: equipmentCategory,
      lens: equipmentCategory,
    }),
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
