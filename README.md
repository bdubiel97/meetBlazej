# Personal site — CV, Photography, Music

A retro personal site built with [Astro](https://astro.build), in the visual style of the
"Back to 90s" Framer template: monochrome palette, "Press Start 2P" pixel headings,
"Cascadia Mono" body text, hard-edged bordered panels, a MENU/CONNECT top bar, and a
GeoCities-style visitor counter + live clock in the footer.

## Editing content

You do **not** need to touch any layout/component code for routine updates. Content lives in
plain JSON files:

| What | File |
| --- | --- |
| Your name, job title, summary, experience, education, skills, contact links | `src/data/cv.json` |
| Site title, tagline, contact email used by the CONNECT button | `src/data/site.json` |
| Music embeds (SoundCloud/YouTube) and gig photos | `src/data/music.json` |
| Photography albums (one file per album) | `src/content/photography/*.json` |

After editing, run `npm run dev` to preview locally, then commit and push — Vercel rebuilds
and redeploys automatically on every push to `main`.

### Editing your CV

Open `src/data/cv.json` and replace the placeholder values (name, title, contact info,
summary, experience entries, education, skills). To add or remove a job/education entry,
copy an existing object in the `experience`/`education` array and edit it — no need to touch
`src/pages/index.astro`.

Your profile photo: replace `public/images/cv/profile-placeholder.svg` with a real photo
(e.g. `profile.jpg`) and update the `"photo"` field in `cv.json` to point at it.

### Adding a photography album

1. Create a new file `src/content/photography/<your-slug>.json` (the filename becomes the
   URL, e.g. `my-trip.json` → `/photography/my-trip`). Copy the shape from an existing album
   file:
   ```json
   {
     "title": "Album Title",
     "description": "One or two sentences about this album.",
     "coverImage": "/images/photography/my-trip/cover.jpg",
     "photos": [
       { "src": "/images/photography/my-trip/photo-1.jpg", "alt": "Description for screen readers", "caption": "Optional caption shown in the lightbox" }
     ]
   }
   ```
2. Put the actual image files in a matching folder: `public/images/photography/my-trip/`.
3. The album automatically appears in the `/photography` grid — no other file needs editing.

To remove an album, delete its JSON file and its image folder.

### Adding a music embed

Open `src/data/music.json` and add an entry to `"sets"`:

```json
{ "platform": "youtube", "url": "https://youtu.be/VIDEO_ID", "title": "My DJ Set", "description": "Recorded live at ..." }
```

- `platform` is either `"youtube"` or `"soundcloud"`.
- `url` is just the normal share link you'd copy from YouTube or SoundCloud — no embed code
  needed.

Gig photos work the same way as photography — add entries to `"gigPhotos"` and drop the
matching images in `public/images/music/gigs/`.

## Local development

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # production build to ./dist/
npm run preview  # preview the production build locally
```

## Deployment

This repo is connected to [Vercel](https://vercel.com) — every push to `main` triggers an
automatic build and deploy, and every other branch/PR gets its own preview URL.

## Project structure

```
src/
├── components/     # shared UI: TopBar, StatusBar, Breadcrumb, RetroPanel, ListRow, Lightbox, EmbedPlayer
├── content/
│   └── photography/  # one JSON file per photo album (content collection)
├── content.config.ts # schema for the photography collection
├── data/           # site.json, cv.json, music.json — edit these for content updates
├── layouts/
│   └── BaseLayout.astro
├── pages/
│   ├── index.astro           # CV (home page)
│   ├── photography/
│   │   ├── index.astro       # album grid
│   │   └── [album].astro     # per-album gallery + lightbox
│   └── music/
│       └── index.astro       # embeds + gig photos
└── styles/
    └── global.css      # color/font tokens, retro border/shadow/button utilities
```
