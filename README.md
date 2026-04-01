# PodFeed — Next.js Podcast Aggregator

A podcast RSS aggregator converted from Flask + Redis to **Next.js + Vercel KV**.

## Features

- **Home feed** — all episodes sorted newest-first, paginated 15/page
- **Search** — filter episodes by title keyword
- **Date filter** — see all episodes published on a specific day
- **Manage feeds** — add/remove RSS feeds via the UI at `/feeds`; persisted in Vercel KV
- **Caching** — articles cached 1 hour in Vercel KV (in-memory fallback for local dev)

---

## Getting started locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

No env vars needed locally — the app uses an in-memory cache fallback automatically.

---

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import it in [vercel.com/new](https://vercel.com/new).
3. In your Vercel project → **Storage → Create → KV Database** → link to project.  
   This auto-adds `KV_REST_API_URL`, `KV_REST_API_TOKEN`, and `KV_REST_API_READ_ONLY_TOKEN`.
4. Deploy.

---

## Managing feeds

Go to `/feeds` in the app. You can add any podcast RSS URL and give it a name. Feeds are stored in Vercel KV and persist across deployments.

Default feeds (used until you make changes via the UI):
- PTFO, Nothing Personal, Basketball Illuminati, Pivot, Cinephobe, Cautionary Tales, Today Explained, The Daily

---

## Env vars reference

```
KV_REST_API_URL=          # auto-set by Vercel KV
KV_REST_API_TOKEN=        # auto-set by Vercel KV
KV_REST_API_READ_ONLY_TOKEN=  # auto-set by Vercel KV
```
