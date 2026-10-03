import music from "../data/music.json";
import { slugify } from "./slugify";

export type MusicSet = (typeof music.sets)[number] & { id: string };

export type MusicBlock =
  | { kind: "about"; order: number }
  | { kind: "gigPhotos"; order: number }
  | { kind: "set"; order: number; set: MusicSet };

// Every panel on the Yoshee page with its `order`; highest first (top of the page).
// Ties keep the order they're listed in music.json.
export function getMusicBlocks(): MusicBlock[] {
  const blocks: MusicBlock[] = [
    { kind: "about", order: music.aboutOrder },
    { kind: "gigPhotos", order: music.gigPhotosOrder },
    ...music.sets.map((set, i) => ({
      kind: "set" as const,
      order: set.order,
      // Anchor ids use the set's position in music.json so existing links stay stable.
      set: { ...set, id: `${slugify(set.title)}-${i}` },
    })),
  ];
  return blocks.sort((a, b) => b.order - a.order);
}
