/**
 * Meetup is intentionally API-only. Do not add a HTML parser here. Its public
 * API access and GraphQL contract must be confirmed before enabling this source.
 */
export async function scrapeMeetupApi(source) {
  if (!process.env.MEETUP_API_TOKEN) {
    return { source, skipped: 'MEETUP_API_TOKEN is not configured', candidates: [] };
  }
  return {
    source,
    skipped: 'Meetup adapter is disabled pending confirmed API endpoint and developer-plan access',
    candidates: [],
  };
}

