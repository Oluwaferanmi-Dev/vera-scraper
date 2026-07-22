import { SOURCES } from './config/sources.js';
import { createDatabaseClient, saveCandidates } from './lib/supabase.js';
import { scrapeMeetupApi } from './sources/meetup-api.js';
import { scrapeCustomHtml } from './sources/custom-html.js';
import { scrapeWebPage } from './sources/web-page.js';
import { scrapeGoogleCSE } from './sources/google-cse.js';
import { scrapePuppeteerSocial } from './sources/puppeteer-social.js';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function fetchWithTimeout(url, options) {
  return fetch(url, { ...options, signal: AbortSignal.timeout(20_000), redirect: 'follow' });
}

export async function run() {
  const userAgent = process.env.SCRAPER_USER_AGENT || 'VeraEventDiscoveryBot/1.0 (+mailto:ops@example.com)';
  const requestDelayMs = Number(process.env.REQUEST_DELAY_MS || 2_000);
  const database = createDatabaseClient();
  const candidates = [];
  let lastRequestAt = 0;

  const enabledSources = SOURCES.filter((item) => item.enabled !== false);
  const usePuppeteer = enabledSources.some((s) => s.adapter === 'puppeteer-social');
  let browser = null;
  
  if (usePuppeteer) {
    puppeteer.use(StealthPlugin());
    const launchOptions = {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    };
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    }
    browser = await puppeteer.launch(launchOptions);
  }

  // Applies equally to robots.txt and event-page requests, regardless of source.
  async function politeFetch(url, options) {
    const waitFor = requestDelayMs - (Date.now() - lastRequestAt);
    if (waitFor > 0) await delay(waitFor);
    const response = await fetchWithTimeout(url, options);
    lastRequestAt = Date.now();
    return response;
  }

  for (const source of enabledSources) {
    try {
      let result;
      if (source.adapter === 'meetup-api') result = await scrapeMeetupApi(source);
      else if (source.adapter === 'google-cse') result = await scrapeGoogleCSE(source, { fetchImpl: politeFetch, userAgent });
      else if (source.adapter === 'puppeteer-social') result = await scrapePuppeteerSocial(source, { fetchImpl: politeFetch, userAgent, browser });
      else if (source.adapter === 'custom-html') result = await scrapeCustomHtml(source, { fetchImpl: politeFetch, userAgent });
      else result = await scrapeWebPage(source, { fetchImpl: politeFetch, userAgent });
      candidates.push(...result.candidates);
      console.info(JSON.stringify({ source: source.key, found: result.candidates.length, skipped: result.skipped }));
    } catch (error) {
      // Source isolation: one bad site can never terminate the scheduled run.
      console.error(JSON.stringify({ source: source.key, error: error.message }));
    }
    await delay(requestDelayMs);
  }

  if (browser) {
    await browser.close();
  }

  const saved = await saveCandidates(database, candidates);
  const result = { completed: true, candidatesSaved: saved };
  console.info(JSON.stringify(result));
  return result;
}
