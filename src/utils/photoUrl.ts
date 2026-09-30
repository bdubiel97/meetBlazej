import site from "../data/site.json";

export type PhotoPreset = "cover" | "thumb" | "reel" | "full";

// A legacy/placeholder value is a local path or an already-resolved URL —
// render it untouched. Anything else is treated as a Cloudflare Images ID
// and resolved through the account's delivery URL + a named variant
// (cover/thumb/reel/full, created once in the Cloudflare dashboard).
function isResolvedUrl(src: string): boolean {
  return src.startsWith("/") || /^(https?:|data:)/.test(src);
}

export function photoUrl(src: string, preset: PhotoPreset): string {
  if (isResolvedUrl(src)) return src;
  return `https://imagedelivery.net/${site.cloudflareImagesAccountHash}/${src}/${preset}`;
}
