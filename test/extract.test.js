import test from 'node:test';
import assert from 'node:assert/strict';
import { extractJsonLdEvents, normaliseCandidate } from '../src/lib/extract.js';

test('extracts Event JSON-LD from an @graph', () => {
  const html = `<script type="application/ld+json">{"@graph":[{"@type":"Event","name":"Lagos Anime Con","startDate":"2026-09-12T10:00:00+01:00","location":{"name":"The Arena","address":{"addressLocality":"Lagos","addressCountry":"NG"}}},{"@type":"Organization","name":"Ignore"}]}</script>`;
  const events = extractJsonLdEvents(html);
  assert.equal(events.length, 1);
  assert.equal(events[0].name, 'Lagos Anime Con');
});

test('normalises a candidate and produces a stable source fingerprint', () => {
  const source = { key: 'example', name: 'Example Events', url: 'https://example.test/events' };
  const event = { '@type': 'Event', name: 'Lagos Anime Con', startDate: '2026-09-12T10:00:00+01:00', location: { name: 'Arena', address: { addressLocality: 'Lagos', addressCountry: 'NG' } } };
  const candidate = normaliseCandidate(event, source, '2026-07-22T00:00:00.000Z');
  assert.equal(candidate.title, 'Lagos Anime Con');
  assert.equal(candidate.location_text, 'Arena — Lagos, NG');
  assert.match(candidate.source_fingerprint, /^[a-f0-9]{64}$/);
});
