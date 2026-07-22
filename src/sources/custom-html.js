import * as cheerio from 'cheerio';
import { DISCOVERY_TERMS } from '../config/sources.js';
import { normaliseCandidate } from '../lib/extract.js';
import { isAllowedByRobots } from '../lib/robots.js';

export async function scrapeCustomHtml(source, context) {
  const permission = await isAllowedByRobots(source.url, context);
  if (!permission.allowed) return { source, skipped: permission.reason, candidates: [] };

  const response = await context.fetchImpl(source.url, {
    headers: { 'User-Agent': context.userAgent, Accept: 'text/html,application/xhtml+xml' },
  });
  
  if (!response.ok) throw new Error(`${source.url} returned HTTP ${response.status}`);
  const html = await response.text();
  const $ = cheerio.load(html);
  
  const rawEvents = [];

  if (source.key === 'allevents_ng') {
    $('.event-item').each((i, el) => {
      const title = $(el).find('h3, .title, [class*="title"]').text().replace(/\s+/g, ' ').trim();
      const link = $(el).find('a').first().attr('href');
      const dateText = $(el).find('.meta-right, .date, [class*="time"]').text().replace(/\s+/g, ' ').trim();
      const location = $(el).find('.meta-left, .venue, [class*="location"]').text().replace(/\s+/g, ' ').trim();
      if (title) {
        rawEvents.push({ 
          name: title, 
          url: link ? new URL(link, source.url).href : source.url, 
          startDate: dateText, 
          location: { name: location } 
        });
      }
    });
  } else if (source.key === 'ariiyatickets') {
    $('.event-item').each((i, el) => {
      const title = $(el).find('.event-item-title').text().replace(/\s+/g, ' ').trim();
      const link = $(el).find('.event-item-title a').attr('href');
      const location = $(el).find('.event-item-location').text().replace(/\s+/g, ' ').trim();
      const dateText = $(el).find('[class*="date"], [class*="time"]').text().replace(/\s+/g, ' ').trim();
      if (title) {
        rawEvents.push({ 
          name: title, 
          url: link ? new URL(link, source.url).href : source.url, 
          startDate: dateText,
          location: { name: location } 
        });
      }
    });
  }

  const candidates = [];
  for (const event of rawEvents) {
    if (DISCOVERY_TERMS.test(`${event.name} ${event.description || ''}`)) {
      candidates.push(normaliseCandidate(event, source));
    }
  }

  return { source, candidates };
}
