# meetBlazej

A retro personal site built with [Astro](https://astro.build) to showcave my resume, analog photography and music.

I used "Back to 90s" Framer template as a staring point (https://www.framer.com/marketplace/templates/back-to-90s/).

Same style, three different stories. Done with the help of Claude Code.

## Local development

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # production build to ./dist/
npm run preview  # preview the production build locally
```

## Deployment

This repo is connected to [Vercel](https://vercel.com) — every push to `main` triggers an
automatic build and deploy and every other branch/PR gets its own preview URL.

## Images storage

Images are stored in the cloud service and requested by the visitor's browser directly from Cloudflare (https://www.cloudflare.com/.)

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
