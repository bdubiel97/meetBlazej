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

Real photos are hosted on [Cloudflare Images](https://developers.cloudflare.com/images/) —
the repo never stores photo files, only lightweight references (`src/utils/photoUrl.ts`
turns those into properly-sized delivery URLs for the album grid, the film reel, and the
lightbox).

**One-time setup** (only needed once, ever):
1. Enable Cloudflare Images on your account and note your **Account ID** (Cloudflare
   dashboard → Manage Account) and your **Account Hash** (shown on the Images overview page —
   put this in `src/data/site.json` as `"cloudflareImagesAccountHash"`).
2. Create an **API Token** (My Profile → API Tokens → Create Token) scoped to
   "Cloudflare Images: Edit".
3. Copy `.env.example` to `.env` and fill in `CLOUDFLARE_ACCOUNT_ID` and
   `CLOUDFLARE_API_TOKEN`.
4. Under Images → Variants in the Cloudflare dashboard, create four named variants (these
   map directly to the presets in `src/utils/photoUrl.ts`):

   | Variant name | Size | Fit |
   | --- | --- | --- |
   | `cover` | 600×400 | Cover |
   | `thumb` | 480×360 | Cover |
   | `reel` | 300×212 | Cover |
   | `full` | max width 2560 | Scale down |

**Publishing a new album:**
1. Put the album's photos in any local folder (they don't need to live in this repo, or
   even on this machine permanently — just present when you run the script).
2. Run:
   ```sh
   npm run new-album -- /path/to/your/photos
   ```
   It uploads every photo to Cloudflare Images, asks for the album title, description,
   URL slug, and which photo is the cover, then writes
   `src/content/photography/<slug>.json` for you.
3. Open that file and fill in `location`, `equipment` (`camera`/`film`/`lens` — each can be
   a single string or an array if you used more than one), and any per-photo captions (all
   currently left as placeholders by the script). Filling in `equipment` isn't just cosmetic:
   each value you list automatically makes the album appear under the matching **Cameras**,
   **Films**, and **Lenses** entries in the MENU dropdown and their filter pages
   (`/photography/cameras/<camera>`, `/photography/films/<film>`, `/photography/lenses/<lens>`)
   — no extra step needed.
4. `git add`, commit, push — the script never touches git itself.

To remove an album, delete its JSON file (its Cloudflare-hosted images can be deleted
separately from the Cloudflare dashboard if you want to reclaim space).

**Film reel frames**: the scrolling film-canister strip on the photography page auto-populates
at build time — it shuffles together every photo from every album (`src/components/FilmReel.astro`)
and picks 10, so a freshly published album's photos can appear there immediately with no
separate list to maintain.

### Adding a music embed

Open `src/data/music.json` and add an entry to `"sets"`:

```json
{ "platform": "youtube", "url": "https://youtu.be/VIDEO_ID", "title": "My DJ Set", "description": "Recorded live at ..." }
```

- `platform` is either `"youtube"` or `"soundcloud"`.
- `url` is just the normal share link you'd copy from YouTube or SoundCloud — no embed code
  needed.

**Order of panels on the Yoshee page**: every panel has an `order` number in `music.json` —
`"aboutOrder"` for About, `"order"` inside each entry of `"sets"`, and `"gigPhotosOrder"` for
the gig photos. Highest number is shown at the top. The MENU dropdown follows the same order
(all YouTube sets stay together in one "YouTube Sets" group, placed where the top-most one is).

Gig photos live in `"gigGalleries"` in `music.json` — a list of grids, each defined by its
shape, with photos placed in order. Drop the image files in `public/images/music/gigs/`
(resize to ~1200px on the long side first; they're served as-is) and reference them by path:

```json
{
  "rows": 1,
  "cols": 3,
  "cellRatio": "2/3",
  "photos": [
    { "src": "/images/music/gigs/left.jpg", "alt": "Portrait shot" },
    { "src": "/images/music/gigs/wide.jpg", "alt": "Wide shot", "cols": 2 }
  ]
}
```

- `rows` x `cols` is the grid's size; `cellRatio` is the shape of one slot (`"2/3"` portrait,
  `"3/2"` landscape, `"1/1"` square).
- A photo takes 1 slot by default; add `"cols": 2` and/or `"rows": 2` to span more.
- Photos fill the grid left-to-right, top-to-bottom. The build fails with a clear message if
  they need more slots than `rows x cols` provides.
- To add another grid, append another object to `gigGalleries`.

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
├── components/     # shared UI: TopBar, StatusBar, Breadcrumb, AlbumGrid, FilmReel, Lightbox, EmbedPlayer
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
│   │   ├── [album].astro     # per-album gallery + lightbox
│   │   ├── cameras/[camera].astro  # albums filtered by camera
│   │   ├── films/[film].astro      # albums filtered by film
│   │   └── lenses/[lens].astro     # albums filtered by lens
│   └── music/
│       └── index.astro       # embeds + gig photos
├── utils/          # photoUrl (Cloudflare delivery URLs), equipment (camera/film/lens grouping), slugify
└── styles/
    └── global.css      # color/font tokens, retro border/shadow/button utilities
```
