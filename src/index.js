import { SOURCES } from './config/sources.js';
import { createDatabaseClient, saveCandidates } from './lib/supabase.js';
import { scrapeMeetupApi } from './sources/meetup-api.js';
import { scrapeWebPage } from './sources/web-page.js';

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function fetchWithTimeout(url, options) {
  return fetch(url, { ...options, signal: AbortSignal.timeout(20_000), redirect: 'follow' });
}

async function run() {
  const userAgent = process.env.SCRAPER_USER_AGENT || 'VeraEventDiscoveryBot/1.0 (+mailto:ops@example.com)';
  const requestDelayMs = Number(process.env.REQUEST_DELAY_MS || 2_000);
  const database = createDatabaseClient();
  const candidates = [];
  let lastRequestAt = 0;

  // Applies equally to robots.txt and event-page requests, regardless of source.
  async function politeFetch(url, options) {
    const waitFor = requestDelayMs - (Date.now() - lastRequestAt);
    if (waitFor > 0) await delay(waitFor);
    const response = await fetchWithTimeout(url, options);
    lastRequestAt = Date.now();
    return response;
  }

  for (const source of SOURCES.filter((item) => item.enabled !== false)) {
    try {
      const result = source.adapter === 'meetup-api'
        ? await scrapeMeetupApi(source)
        : await scrapeWebPage(source, { fetchImpl: politeFetch, userAgent });
      candidates.push(...result.candidates);
      console.info(JSON.stringify({ source: source.key, found: result.candidates.length, skipped: result.skipped }));
    } catch (error) {
      // Source isolation: one bad site can never terminate the scheduled run.
      console.error(JSON.stringify({ source: source.key, error: error.message }));
    }
    await delay(requestDelayMs);
  }

  const saved = await saveCandidates(database, candidates);
  console.info(JSON.stringify({ completed: true, candidatesSaved: saved }));
}

run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
