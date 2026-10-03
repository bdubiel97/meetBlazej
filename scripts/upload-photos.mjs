#!/usr/bin/env node
// Uploads individual photos to Cloudflare Images (EXIF/GPS scrubbed, same as
// new-album) under a folder-like prefix, and prints the image IDs to paste
// into a JSON file.
//
// Usage: npm run upload-photos -- <id-prefix> <photo> [<photo> ...]
// e.g.   npm run upload-photos -- music/gigs ~/Pictures/Budchen_V.JPG

import { readFile } from "node:fs/promises";
import path from "node:path";
import { scrubMetadata, uploadImage } from "./lib/images.mjs";

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

const [prefixArg, ...files] = process.argv.slice(2);
if (!prefixArg || files.length === 0) {
  fail("Usage: npm run upload-photos -- <id-prefix> <photo> [<photo> ...]");
}

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const apiToken = process.env.CLOUDFLARE_API_TOKEN;
if (!accountId || !apiToken) {
  fail(
    "Missing CLOUDFLARE_ACCOUNT_ID and/or CLOUDFLARE_API_TOKEN.\n" +
      "  Copy .env.example to .env and fill in your Cloudflare credentials."
  );
}

const prefix = prefixArg.replace(/^\/+|\/+$/g, "");
const ids = [];

for (const file of files) {
  const filePath = path.resolve(file);
  const imageId = `${prefix}/${slugify(path.parse(file).name)}`;
  process.stdout.write(`${path.basename(file)} -> ${imageId} ... `);
  try {
    const scrubbed = await scrubMetadata(await readFile(filePath));
    await uploadImage({ accountId, apiToken, buffer: scrubbed, filename: path.basename(file), imageId });
  } catch (err) {
    console.log("FAILED");
    fail(`Upload failed for ${file}: ${err.message}`);
  }
  console.log("done");
  ids.push(imageId);
}

console.log("\nImage IDs (use as \"src\" in your JSON):");
ids.forEach((id) => console.log(`  ${id}`));
