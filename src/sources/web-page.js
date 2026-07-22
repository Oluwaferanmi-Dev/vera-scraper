import { DISCOVERY_TERMS } from '../config/sources.js';
import { extractHtmlFallback, extractJsonLdEvents, normaliseCandidate } from '../lib/extract.js';
import { isAllowedByRobots } from '../lib/robots.js';

export async function scrapeWebPage(source, context) {
  const permission = await isAllowedByRobots(source.url, context);
  if (!permission.allowed) return { source, skipped: permission.reason, candidates: [] };

  const response = await context.fetchImpl(source.url, {
    headers: { 'User-Agent': context.userAgent, Accept: 'text/html,application/xhtml+xml' },
  });
  if (!response.ok) throw new Error(`${source.url} returned HTTP ${response.status}`);
  const html = await response.text();
  const structuredEvents = extractJsonLdEvents(html)
    .filter((event) => DISCOVERY_TERMS.test(`${event.name || ''} ${event.description || ''}`));

  if (structuredEvents.length) {
    return { source, candidates: structuredEvents.map((event) => normaliseCandidate(event, source)) };
  }

  // This remains opt-in: do not scrape arbitrary HTML until the individual source
  // has been checked and recorded as lacking Event JSON-LD.
  if (!source.allowHtmlFallback) return { source, skipped: 'no matching Event JSON-LD; HTML fallback not approved', candidates: [] };
  const fallback = extractHtmlFallback(html);
  if (!fallback.title || !DISCOVERY_TERMS.test(`${fallback.title} ${fallback.description}`)) {
    return { source, candidates: [] };
  }
  return {
    source,
    candidates: [normaliseCandidate({ name: fallback.title, description: fallback.description, startDate: fallback.dateText, url: source.url }, source)],
  };
}

