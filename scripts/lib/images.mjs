import sharp from "sharp";
import exifReader from "exif-reader";

// Strips all EXIF/IPTC/XMP metadata (camera model, GPS location, timestamps,
// etc.) except the Copyright tag, which is preserved. This is a deliberate
// two-pass process: sharp's withMetadata() *merges* with whatever metadata
// the source already has rather than replacing it, so injecting Copyright
// directly onto the original would leave GPS and everything else intact.
// Running it against an already-fully-stripped image instead guarantees
// only Copyright survives. EXIF orientation is baked into the actual pixels
// first (via .rotate() with no arguments), so a photo shot on its side still
// displays upright once the orientation tag itself is gone. Output is
// normalized to JPEG (or PNG if the source has transparency) since not
// every input format (e.g. HEIC) can be re-encoded back to itself.
export async function scrubMetadata(buffer) {
  const source = sharp(buffer);
  const meta = await source.metadata();

  let copyright;
  if (meta.exif) {
    try {
      copyright = exifReader(meta.exif)?.Image?.Copyright;
    } catch {
      // Unparseable EXIF block — proceed without a copyright tag.
    }
  }

  const encode = (pipeline) => (meta.hasAlpha ? pipeline.png() : pipeline.jpeg({ quality: 92 }));

  const clean = await encode(sharp(buffer).rotate()).toBuffer();
  if (!copyright) return clean;

  return encode(sharp(clean).withMetadata({ exif: { IFD0: { Copyright: copyright } } })).toBuffer();
}

// Returns true on success (including "already exists", so re-runs are
// idempotent), throws on a real failure.
export async function uploadImage({ accountId, apiToken, buffer, filename, imageId }) {
  const form = new FormData();
  form.append("id", imageId);
  form.append("file", new Blob([buffer]), filename);

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${apiToken}` },
      body: form,
    }
  );

  const body = await response.json().catch(() => null);

  if (response.ok && body?.success) return true;

  // Cloudflare returns error code 5409 when an image ID already exists —
  // treat that as success so a re-run after a partial failure is safe.
  const alreadyExists = body?.errors?.some((e) => e.code === 5409);
  if (alreadyExists) return true;

  const message = body?.errors?.map((e) => e.message).join("; ") ?? `HTTP ${response.status}`;
  throw new Error(message);
}
