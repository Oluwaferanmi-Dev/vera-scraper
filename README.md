# VERA event scraper (v1)

This scheduled service discovers anime, gaming, fandom, and cosplay events in Nigeria and places them in `event_candidates` for review. It includes a deployable, passwordless review desk for Vera. It never writes to `events` and never auto-approves a candidate.

## Setup

1. Apply [`migrations/20260722_create_event_candidates.sql`](migrations/20260722_create_event_candidates.sql) to the existing Tikketsu Supabase project.
2. Copy `.env.example` to `.env` and supply a server-only Supabase service-role key.
3. Copy `.env.example` to `.env`, then set Vera's email in `VERA_REVIEWER_EMAILS`. In Supabase Auth, configure the deployed URL and add `https://YOUR_DOMAIN/auth/callback` to Redirect URLs.
4. Install dependencies and run the checks:

   ```sh
   npm install
   npm test
   npm run scrape
   ```

## Deploy the review desk

Deploy this repository to Vercel (the included app is a standard Next.js app). Configure these production environment variables there:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` — server-only; never prefix it with `NEXT_PUBLIC_`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `VERA_REVIEWER_EMAILS` — Vera's approved email address, or a comma-separated reviewer list

Give Vera the deployed URL. She enters her approved email and receives a Supabase magic link; the application then shows the pending queue where she can approve or reject each candidate. The service-role key is used only inside authenticated server routes.

The included GitHub Actions workflow runs daily at 04:17 UTC (and supports manual dispatch). Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` as production environment secrets before enabling it. It is intentionally sequential and waits for two seconds between every network request, including `robots.txt` checks.

## Source policy

- Every web source is checked against `robots.txt` before its event page is requested. A missing `robots.txt` is allowed; an unavailable one is skipped safely.
- The scraper identifies itself with `VeraEventDiscoveryBot/1.0` rather than posing as a browser.
- It reads `schema.org/Event` JSON-LD first. HTML fallback code exists but is disabled per source until that source has been explicitly verified not to publish Event JSON-LD.
- Meetup is API-only and disabled until a valid developer/API route is confirmed. It has no HTML scraper.
- Add the university club URLs to `src/config/sources.js` only after receiving them and checking their robots policies.

## Candidate lifecycle

Rows begin as `pending_review`. The unique `source_fingerprint` makes scheduled runs idempotent for the same source URL/title/date; it is not matching against `events` or `organisers`.

For future matching, add nullable `matched_event_id` and `matched_organiser_id` foreign keys only after defining a human-confirmed match workflow. Matching should compare a normalised title, event start time, venue/city, and canonicalized source/organiser names; no automatic merge should occur before review.

## Security

`event_candidates` has RLS enabled and intentionally has no browser-facing policies. The scraper uses a `SUPABASE_SERVICE_ROLE_KEY` only on the server. Add narrow reviewer policies when the review UI is built.
