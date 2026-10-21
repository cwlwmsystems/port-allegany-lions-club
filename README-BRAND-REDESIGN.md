# Port Allegany Lions Club – Brand-aligned redesign

Next.js 15 project based on the uploaded `lions-lodge-inspired.zip`. Homepage rebuilt with an editorial nonprofit layout, mobile-responsive typography, community visual assets, service sections, and calls to action. Existing internal pages, components, and inquiry flow retained.

## Start

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Artwork and authenticity

- `public/images/lions-emblem-official.png` is the **original** image provided by the user, not an AI-generated substitute.
- All `public/images/*.jpg` files are generated **illustrations**, not real photographic evidence of Port Allegany or club activities. Replace them with genuine, properly licensed/consented photos before presenting them as real. The hero and gallery are intended as visual concepts.
- The page does not invent club statistics, event dates, member names or actual service accomplishments.
- The official palette is Lions Blue `#00338D`, Lions Yellow `#EBB700`, and navy `#0D2240`.
- Existing inquiry endpoint may require production email/environment configuration; check `.env.example` from your original archive.
- The club Facebook URL is set in `lib/content.ts`.

## What to customize next

1. Add verified meetings and events to `lib/content.ts`.
2. Add approved, verified local community photos and service stories.
3. Confirm club contact email, officer-approved meeting details and membership process.
4. Test inquiry delivery end-to-end before launch.
