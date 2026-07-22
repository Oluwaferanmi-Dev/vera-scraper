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
    allowHtmlFallback: false,
  },
  {
    key: 'rovingheights',
    name: 'Rovingheights Events',
    url: 'https://www.rovingheights.com/events/',
    adapter: 'web-page',
    allowHtmlFallback: false,
  },
  {
    key: 'meetup_nigeria',
    name: 'Meetup Nigeria',
    adapter: 'meetup-api',
    enabled: false,
    keywords: ['anime', 'gaming', 'cosplay'],
  },
];

export const DISCOVERY_TERMS = /\b(anime|manga|gaming|gamer|video games?|esports?|cosplay|fandom|comic(?:s| con)?|otaku|tabletop)\b/i;

