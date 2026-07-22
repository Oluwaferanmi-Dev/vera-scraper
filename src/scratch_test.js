import * as cheerio from 'cheerio';

async function fetchPage(url) {
  const response = await fetch(url, { headers: { 'User-Agent': 'VeraEventDiscoveryBot/1.0 (+mailto:ops@example.com)' } });
  return await response.text();
}

async function run() {
  const html1 = await fetchPage('https://allevents.ng/');
  const $1 = cheerio.load(html1);
  console.log('--- allevents.ng ---');
  $1('article.event-item').slice(0, 1).each((i, el) => {
    console.log($1.html(el));
  });

  const html2 = await fetchPage('https://www.ariiyatickets.com/');
  const $2 = cheerio.load(html2);
  console.log('--- ariiyatickets.com ---');
  $2('.event-item, .event-item-feature, .ticketbox-event-item, .ticketbox_featured-events-content').slice(0, 1).each((i, el) => {
    console.log($2.html(el));
  });
}

run();
