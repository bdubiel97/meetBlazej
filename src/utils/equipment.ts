import type { CollectionEntry } from "astro:content";
import { slugify } from "./slugify";

export type EquipmentKind = "camera" | "film" | "lens";

export interface EquipmentGroup {
  label: string;
  slug: string;
  albums: CollectionEntry<"photography">[];
}

// Every distinct value used for a given equipment category across all
// albums (e.g. every camera anyone's album lists), each paired with the
// albums that used it — powers both the nav dropdown and the filter pages.
export function groupAlbumsByEquipment(
  albums: CollectionEntry<"photography">[],
  kind: EquipmentKind
): EquipmentGroup[] {
  const groups = new Map<string, EquipmentGroup>();

  for (const album of albums) {
    for (const label of album.data.equipment[kind]) {
      const slug = slugify(label);
      let group = groups.get(slug);
      if (!group) {
        group = { label, slug, albums: [] };
        groups.set(slug, group);
      }
      group.albums.push(album);
    }
  }

  return [...groups.values()].sort((a, b) => a.label.localeCompare(b.label));
}
