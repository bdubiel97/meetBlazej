// A single-track share link can carry an "in" param pointing back at the
// playlist it was shared from (e.g. "?in=user/sets/slug") — resolve that so
// the widget loads with real playlist context and next()/prev() can move
// between tracks, instead of just embedding one isolated track.
function resolveSoundCloudUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    const inContext = parsed.searchParams.get("in");
    return inContext ? `https://soundcloud.com/${inContext}` : rawUrl;
  } catch {
    return rawUrl;
  }
}

export function getSoundCloudEmbedSrc(rawUrl: string): string {
  const params = new URLSearchParams({
    url: resolveSoundCloudUrl(rawUrl),
    color: "#101010",
    auto_play: "false",
    show_user: "true",
    show_reposts: "false",
    show_artwork: "true",
  });
  return `https://w.soundcloud.com/player/?${params.toString()}`;
}
