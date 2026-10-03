import type { CollectionEntry } from "astro:content";

// Highest `order` first; ties fall back to title so the result is stable.
export function sortAlbums(
  albums: CollectionEntry<"photography">[]
): CollectionEntry<"photography">[] {
  return [...albums].sort(
    (a, b) => b.data.order - a.data.order || a.data.title.localeCompare(b.data.title)
  );
}
