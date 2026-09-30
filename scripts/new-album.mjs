#!/usr/bin/env node
// Scaffolds a new photography album: uploads every photo in a local folder
// to Cloudflare Images, then writes src/content/photography/<slug>.json.
//
// Usage: npm run new-album -- <path-to-local-folder>
//
// Requires CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in a local .env
// (see .env.example) — never committed, and never needed by the deployed
// site itself, only by this script.

import { readdir, writeFile, access, readFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import exifReader from "exif-reader";

const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".heif",
  ".tif",
  ".tiff",
  ".avif",
]);

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const contentDir = path.join(rootDir, "src", "content", "photography");

function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
}

function fail(message) {
  console.error(`\n✗ ${message}`);
  process.exit(1);
}

async function fileExists(p) {
  try {
    await access(p, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const folder = process.argv[2];
  if (!folder) {
    fail("Usage: npm run new-album -- <path-to-local-folder>");
  }

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !apiToken) {
    fail(
      "Missing CLOUDFLARE_ACCOUNT_ID and/or CLOUDFLARE_API_TOKEN.\n" +
        "  Copy .env.example to .env and fill in your Cloudflare credentials."
    );
  }

  const absFolder = path.resolve(folder);
  let entries;
  try {
    entries = await readdir(absFolder, { withFileTypes: true });
  } catch {
    fail(`Could not read folder: ${absFolder}`);
  }

  const iCloudStubs = entries.filter((e) => e.name.endsWith(".icloud"));
  if (iCloudStubs.length > 0) {
    fail(
      `Found ${iCloudStubs.length} ".icloud" placeholder file(s) — these photos aren't actually ` +
        "downloaded to disk yet. Open the folder in Finder (or wait for it to sync) so the real " +
        "files are present, then re-run this script."
    );
  }

  const files = entries
    .filter((e) => e.isFile() && IMAGE_EXTENSIONS.has(path.extname(e.name).toLowerCase()))
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  if (files.length === 0) {
    fail(`No image files found in ${absFolder}`);
  }

  console.log(`\nFound ${files.length} image${files.length === 1 ? "" : "s"} in ${absFolder}\n`);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  async function ask(question, defaultValue) {
    const suffix = defaultValue ? ` [${defaultValue}]` : "";
    while (true) {
      const answer = (await rl.question(`${question}${suffix}: `)).trim();
      if (answer) return answer;
      if (defaultValue) return defaultValue;
      console.log("  (required)");
    }
  }

  const title = await ask("Album title");
  const description = await ask("Description");

  let slug = slugify(title);
  while (true) {
    const answer = (await ask("URL slug", slug)).trim();
    const candidate = slugify(answer) || slug;
    if (await fileExists(path.join(contentDir, `${candidate}.json`))) {
      console.log(`  "${candidate}.json" already exists — pick a different slug.`);
      slug = candidate;
      continue;
    }
    slug = candidate;
    break;
  }

  files.forEach((name, i) => console.log(`  ${i + 1}) ${name}`));
  const coverAnswer = await ask("\nCover photo — number or filename", "1");
  const coverIndex = /^\d+$/.test(coverAnswer)
    ? Math.min(Math.max(Number(coverAnswer) - 1, 0), files.length - 1)
    : Math.max(files.indexOf(coverAnswer), 0);

  const altPrefix = await ask("Alt-text prefix", title);

  const confirm = await ask(
    `\nUpload ${files.length} image(s) to Cloudflare Images (folder: photography/${slug}/)? [y/N]`,
    "N"
  );
  rl.close();

  if (!/^y(es)?$/i.test(confirm)) {
    console.log("Cancelled — nothing was uploaded.");
    return;
  }

  const uploaded = [];
  for (let i = 0; i < files.length; i++) {
    const name = files[i];
    const filePath = path.join(absFolder, name);
    const baseName = slugify(path.parse(name).name) || `photo-${i + 1}`;
    const imageId = `photography/${slug}/${baseName}`;

    process.stdout.write(`[${i + 1}/${files.length}] ${name} -> ${imageId} ... `);

    let ok = false;
    let lastError = null;
    for (let attempt = 0; attempt < 2 && !ok; attempt++) {
      try {
        const original = await readFile(filePath);
        const scrubbed = await scrubMetadata(original);
        ok = await uploadImage({ accountId, apiToken, buffer: scrubbed, filename: name, imageId });
      } catch (err) {
        lastError = err;
      }
    }

    if (!ok) {
      console.log("FAILED");
      console.error(`\n✗ Upload failed for ${name}: ${lastError?.message ?? "unknown error"}`);
      console.error("Already uploaded in this run:");
      uploaded.forEach((id) => console.error(`  - ${id}`));
      console.error(
        `\nRe-run the same command to resume — already-uploaded images are skipped, not duplicated.`
      );
      process.exit(1);
    }

    console.log("done");
    uploaded.push(imageId);
  }

  const coverImageId = uploaded[coverIndex];
  const doc = {
    title,
    description,
    location: "PLACEHOLDER — where this was shot",
    equipment: {
      // A single string is fine for one item; use an array (e.g.
      // ["Minolta XD7", "Canon AE-1"]) to list more than one.
      camera: "PLACEHOLDER — camera(s) used for this album",
      film: "PLACEHOLDER — film stock(s) used for this album",
      lens: "PLACEHOLDER — lens(es) used for this album",
    },
    coverImage: coverImageId,
    photos: uploaded.map((id, i) => ({
      src: id,
      alt: `${altPrefix} — photo ${i + 1}`,
    })),
  };

  const outPath = path.join(contentDir, `${slug}.json`);
  await writeFile(outPath, JSON.stringify(doc, null, 2) + "\n", { flag: "wx" });

  console.log(`\n✓ Wrote src/content/photography/${slug}.json  (${uploaded.length} photos)`);
  console.log(`  Preview:  npm run dev  ->  http://localhost:4321/photography/${slug}`);
  console.log(`\nNext steps (nothing was committed, and no image bytes entered the repo):`);
  console.log(`  1. Review the album, add captions / fix alt text / fill in location & equipment`);
  console.log(`  2. git add src/content/photography/${slug}.json`);
  console.log(`  3. git commit -m "Add ${title} album" && git push`);
}

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
async function scrubMetadata(buffer) {
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
async function uploadImage({ accountId, apiToken, buffer, filename, imageId }) {
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

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
