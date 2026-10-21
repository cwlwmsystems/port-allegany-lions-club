# Port Allegany Lions Club — working website prototype

A responsive Next.js website for the Port Allegany Lions Club's club revitalization initiative.

## Start locally

```bash
npm install
npm run dev
```

Visit http://localhost:3000.

## Included pages

- `/` Homepage: mission, invitations to join/volunteer/partner, current activities CTA
- `/about` Club mission and revitalization message
- `/join` Membership/volunteer/partner inquiry form
- `/events` Public events listing (starts empty until approved event data is added)
- `/impact` Service stories (starts empty; no fabricated impact claims)
- `/contact` Contact form

## Configure before launch (required)

1. **Club ownership:** Have a club officer approve the site and ensure the domain, Vercel project, and repo are owned by the club, with two admin contacts.
2. **Official Lions logo:** Replace the custom typographic “L” placeholder with an authorized asset. Review https://www.lionsclubs.org/en/resources-for-members/brand-guidelines .
3. **Public contacts & schedule:** Update `lib/content.ts` with a verified club email, meeting information, and official social URL. Never publish personal information without consent.
4. **Events & impact:** Edit `events` and `impactStories` arrays in `lib/content.ts` using verified/approved facts. Empty states are intentional until approved information exists.
5. **Form delivery:** Create a club-owned Formspree form. Set the `FORMSPREE_ENDPOINT` environment variable locally in `.env.local`, and in Vercel Environment Variables in production. Example: `https://formspree.io/f/xxxxxxxx`. Test with a real submission and confirm receipt. Until configured, requests get a clear 503 error and are **not** stored. The form cannot accept submissions before configuration.
6. **Privacy / consent:** Confirm the club's chosen retention policy and publish fuller privacy details before outreach campaigns. Avoid collecting unnecessary information.
7. **Domain / launch:** Connect club domain in Vercel, verify HTTPS and mobile responsiveness, then review page copy with club officers.

## Deploy to Vercel

- Create a new GitHub repo, upload these files, import it into Vercel.
- Framework: Next.js, Build command `npm run build`.
- Set production `FORMSPREE_ENDPOINT` after creating a club-owned form.
- Add domain in Vercel and follow its DNS instructions.

## Why no content management system yet?

This first version is deliberately easy to run and review. A nontechnical editing interface (Sanity, etc.) can be added after the club settles its content process; content is centralized in `lib/content.ts` to make that migration straightforward.

## What is a placeholder?

- The lettermark logo, not the official Lions emblem.
- No meeting dates, street addresses, project outcomes, membership prices or officer details are invented.
- The "Our invitation to the community" quote is a proposed slogan, not attributed to a person.
