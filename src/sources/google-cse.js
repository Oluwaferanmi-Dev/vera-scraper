import { DISCOVERY_TERMS } from '../config/sources.js';
import { normaliseCandidate } from '../lib/extract.js';

export async function scrapeGoogleCSE(source, context) {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_CX;

  if (!apiKey || !cx) {
    return { source, skipped: 'Missing GOOGLE_SEARCH_API_KEY or GOOGLE_SEARCH_CX', candidates: [] };
  }

  const candidates = [];
  const query = source.query || 'anime OR gaming OR cosplay OR comic con nigeria';
  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}`;

  const response = await context.fetchImpl(url, { headers: { 'User-Agent': context.userAgent } });

  if (!response.ok) {
    throw new Error(`Google CSE API returned HTTP ${response.status}`);
  }

  const data = await response.json();
  const rawEvents = data.items || [];

  for (const item of rawEvents) {
    const textContext = `${item.title} ${item.snippet || ''}`;
    
    // Check if the snippet/title contains our discovery terms
    if (DISCOVERY_TERMS.test(textContext)) {
      candidates.push(
        normaliseCandidate({
          name: item.title,
          url: item.link,
          description: item.snippet,
          // We don't have exact dates or locations from search snippets usually,
          // so we leave them empty for Vera to manually determine.
          startDate: '',
          location: { name: 'Unknown (Check Link)' }
        }, source)
      );
    }
  }

  return { source, candidates };
}
