import { createHash } from 'node:crypto';

function stripHtml(value = '') {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function decodeEntities(value = '') {
  return value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

function asText(value) {
  if (Array.isArray(value)) return value.map(asText).filter(Boolean).join(', ');
  if (typeof value === 'object' && value) return value.name || value.address || '';
  return typeof value === 'string' ? value : '';
}

function locationText(location) {
  if (typeof location === 'string') return location;
  if (!location) return '';
  const address = location.address;
  const formattedAddress = typeof address === 'object'
    ? [address.streetAddress, address.addressLocality, address.addressRegion, address.addressCountry]
        .filter(Boolean).join(', ')
    : asText(address);
  return [location.name, formattedAddress].filter(Boolean).join(' — ');
}

function flattenJsonLd(value, entries = []) {
  if (Array.isArray(value)) value.forEach((item) => flattenJsonLd(item, entries));
  else if (value && typeof value === 'object') {
    entries.push(value);
    if (value['@graph']) flattenJsonLd(value['@graph'], entries);
  }
  return entries;
}

function isEvent(value) {
  const type = value?.['@type'];
  return Array.isArray(type) ? type.includes('Event') : type === 'Event';
}

export function extractJsonLdEvents(html) {
  const scripts = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  const events = [];
  for (const match of scripts) {
    try {
      for (const item of flattenJsonLd(JSON.parse(match[1].trim())).filter(isEvent)) events.push(item);
    } catch {
      // Invalid JSON-LD must not abort the source; the isolated caller records it.
    }
  }
  return events;
}

function metaContent(html, selector) {
  const pattern = new RegExp(`<meta[^>]+(?:property|name)=["']${selector}["'][^>]+content=["']([^"']+)["']`, 'i');
  return decodeEntities(pattern.exec(html)?.[1] || '');
}

export function extractHtmlFallback(html) {
  const title = metaContent(html, 'og:title')
    || decodeEntities(stripHtml(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || ''))
    || decodeEntities(stripHtml(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || ''));
  const description = metaContent(html, 'description') || metaContent(html, 'og:description');
  const dateText = decodeEntities(html.match(/<time[^>]*datetime=["']([^"']+)["']/i)?.[1] || '');
  return { title, description, dateText };
}

export function normaliseCandidate(event, source, extractedAt = new Date().toISOString()) {
  const title = asText(event.name).trim();
  const startsAt = asText(event.startDate).trim() || null;
  const sourceUrl = asText(event.url).trim() || source.url;
  const fingerprintInput = [source.key, sourceUrl, title.toLowerCase(), startsAt].join('|');

  return {
    source_key: source.key,
    source_name: source.name,
    source_url: sourceUrl,
    source_fingerprint: createHash('sha256').update(fingerprintInput).digest('hex'),
    title,
    starts_at: startsAt || null,
    ends_at: asText(event.endDate).trim() || null,
    date_text: startsAt || null,
    venue_name: typeof event.location === 'object' ? asText(event.location?.name).trim() || null : null,
    location_text: locationText(event.location) || null,
    description: asText(event.description).trim() || null,
    image_url: asText(event.image).trim() || null,
    organiser_name: asText(event.organizer).trim() || null,
    categories: [],
    raw_event: event,
    extracted_at: extractedAt,
    last_seen_at: extractedAt,
  };
}

