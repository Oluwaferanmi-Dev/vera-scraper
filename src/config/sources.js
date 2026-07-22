/**
 * Each source is deliberately independent. Add university club/blog URLs here
 * once supplied, after confirming their robots rules and public event pages.
 */
export const SOURCES = [
  {
    key: 'quickteller',
    name: 'Quickteller Events',
    url: 'https://events.quickteller.com/',
    adapter: 'web-page',
    // Enable only after inspecting the page and confirming it lacks Event JSON-LD.
    allowHtmlFallback: false,
  },
  {
    key: 'ticketwaka',
    name: 'TicketWaka',
    url: 'https://ticketwaka.com/events/',
    adapter: 'web-page',
    allowHtmlFallback: false,
  },
  {
    key: 'eventbrite_nigeria',
    name: 'Eventbrite Nigeria',
    url: 'https://www.eventbrite.com/d/nigeria--lagos/anime-and-comics/',
    adapter: 'web-page',
    allowHtmlFallback: true,
  },
  {
    key: 'rovingheights',
    name: 'Rovingheights Events',
    url: 'https://www.rovingheights.com/events/',
    adapter: 'web-page',
    allowHtmlFallback: true,
  },
  {
    key: 'meetup_nigeria',
    name: 'Meetup Nigeria',
    adapter: 'meetup-api',
    enabled: false,
    keywords: ['anime', 'gaming', 'cosplay'],
  },
  {
    key: 'tix_africa',
    name: 'Tix Africa',
    url: 'https://tix.africa/discover',
    adapter: 'web-page',
    allowHtmlFallback: false,
  },
  {
    key: 'ariiyatickets',
    name: 'Ariiya Tickets',
    url: 'https://www.ariiyatickets.com/',
    adapter: 'custom-html',
    allowHtmlFallback: false,
  },
  {
    key: 'allevents_ng',
    name: 'Allevents Nigeria',
    url: 'https://allevents.ng/',
    adapter: 'custom-html',
    allowHtmlFallback: false,
  },
  {
    key: 'nairagame',
    name: 'NairaGame',
    url: 'https://nairagame.com/',
    adapter: 'web-page',
    allowHtmlFallback: true, // Since it's a gaming site, the root page might be worth flagging
  },
  {
    key: 'google-cse-social',
    name: 'Google Custom Search (X/IG)',
    adapter: 'google-cse',
    query: 'site:instagram.com OR site:x.com "nigeria" AND ("anime" OR "gaming" OR "cosplay" OR "comic con" OR "fandom")',
  },
  {
    key: 'instagram-search',
    name: 'Instagram Puppeteer',
    url: 'https://www.instagram.com/explore/tags/animeinnigeria/',
    adapter: 'puppeteer-social',
    platform: 'instagram'
  },
  {
    key: 'x-search',
    name: 'X Puppeteer',
    url: 'https://x.com/search?q=(%23anime%20OR%20%23cosplay%20OR%20%23gaming)%20nigeria&src=typed_query&f=live',
    adapter: 'puppeteer-social',
    platform: 'x'
  },
];

export const DISCOVERY_TERMS = /\b(anime|manga|gaming|gamer|video games?|esports?|cosplay|fandom|comic(?:s| con)?|otaku|tabletop)\b/i;

