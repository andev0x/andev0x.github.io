# andev0x — terminal tech blog

A fully static, keyboard-first blog built with React, Vite and Tailwind CSS.
Posts are markdown files compiled into the bundle at build time; there is no
runtime backend, database or comment API.

## Stack

- React 18 + TypeScript
- Vite 4 (static build)
- Tailwind CSS
- `react-markdown` + `remark-gfm`
- `prismjs` (only the grammars the posts use)
- Giscus (GitHub Discussions) for comments

Search is a small in-house scorer over the post metadata (`src/utils/search.ts`)
rather than a fuzzy-search library: the corpus is a few dozen posts, so an
index of every document and every key cost more memory than the searching it
enabled. The scoring is the same model `fuse.js` used — a query matches a
field when the field contains it with at most a third of the query length in
edits — so the results are unchanged.

Code highlighting uses Prism directly instead of a React wrapper. Prism emits
one HTML string per block, which is injected into the DOM once; the wrapper
turned every token into its own React element with an inline style, which
means a fiber and a style object per token and a much bigger bundle. The
tokens carry class names whose colours live in `src/index.css`.

A code block is only tokenised when it comes near the viewport, so opening a
long post does not pay for the code at the bottom of it.

## Development

```bash
npm install
npm run dev
```

Useful scripts:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build `dist/` |
| `npm run preview` | Preview the production build |
| `npm run typecheck` | Run TypeScript only |
| `npm run lint` | Run ESLint |

The dev server ignores the legacy `go-blog/` directory, `dist/`, `.git/`,
database files and `node_modules/` so file watching stays small.

## Writing posts

Add a markdown file to `src/data/posts/`. Front matter is read by
`build/postsPlugin.ts` at build time:

```yaml
---
title: A post title
slug: a-post-title
excerpt: One or two sentences for cards and search.
date: 2026-10-21
tags: [neovim, terminal]
categories: [Development]
featured: false
---
```

Only front matter is included in the initial bundle. Each post body becomes its
own lazy-loaded chunk, fetched when the article is opened.

## Routing

Article links live in the URL fragment (`#/post/<id>`), so deep links and
reloads resolve entirely in the browser. The build also copies `index.html` to
`404.html` and writes `.nojekyll`, which keeps GitHub Pages from showing its own
404 page for unknown paths.

## Deployment

`.github/workflows/vite-gh-pages.yml` builds the site on every push to `main`
and deploys `dist/` with `actions/deploy-pages@v4`. No Go, Docker or database
steps are involved.

This repository is the `andev0x.github.io` user site, so the Vite base path
stays `/`.

## Comments (Giscus)

Comments are rendered by `src/components/Comments.tsx` and are configured for:

- repository: `andev0x/andev0x.github.io`
- category: `Announcements`
- mapping: `specific`, using the post id as the discussion term

The thread is loaded **when the reader asks for it**, not when it scrolls into
view. Giscus renders the discussion in a cross-origin iframe, and Chrome gives
every cross-origin frame its own renderer process — loading it costs a
separate process and roughly 150 MB of resident memory, whether or not the
reader ever looks at the thread. Asking for it explicitly means that cost is
only paid by the people who want to read or write a comment.

Once loaded, the thread behaves normally: theme changes are forwarded to the
existing iframe with `postMessage`, so toggling light/dark does not reload it.

One-time GitHub setup:

1. Enable Discussions on the repository (already enabled).
2. Install the [giscus app](https://github.com/apps/giscus) on the repository.
3. Keep the `Announcements` category, or change the ids in `Comments.tsx`.

The values can be overridden without editing the component:

```bash
VITE_GISCUS_REPO=owner/repo
VITE_GISCUS_REPO_ID=R_...
VITE_GISCUS_CATEGORY=Announcements
VITE_GISCUS_CATEGORY_ID=DIC_...
```

## Contact form

The contact dialog posts to Formspree when `VITE_FORMSPREE_ID` is set. Without
it the form stays disabled.

## Legacy backend

`go-blog/` is a separate, local-only repository from the old full-stack setup.
It is git-ignored and is never imported by the frontend build, watched by Vite,
or deployed. The production site has no API dependency.

## Assets

`public/` holds the shipped favicons and cursor. The original artwork lives in
`assets/` and is not shipped. Regenerate the rasters with:

```bash
inkscape --export-type=png --export-width=36 --export-height=36 \
  --export-filename=public/kunai.png assets/kunai.svg
inkscape --export-type=png --export-width=192 --export-height=192 \
  --export-filename=public/favicon-192.png assets/sharingan-shisui.svg
```

Fonts are loaded from Google Fonts with `display=swap`; images rendered from
markdown always carry `loading="lazy"` and `decoding="async"`.
