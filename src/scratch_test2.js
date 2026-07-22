import * as cheerio from 'cheerio';

async function fetchPage(url) {
  const response = await fetch(url, { headers: { 'User-Agent': 'VeraEventDiscoveryBot/1.0 (+mailto:ops@example.com)' } });
  return await response.text();
}

async function run() {
  const html1 = await fetchPage('https://allevents.ng/');
  const $1 = cheerio.load(html1);
  console.log('--- allevents.ng ---');
  $1('.event-item').each((i, el) => {
    const title = $1(el).find('h3, .title, [class*="title"]').text().replace(/\s+/g, ' ').trim();
    if (title) console.log('Found:', title);
  });

  const html2 = await fetchPage('https://www.ariiyatickets.com/');
  const $2 = cheerio.load(html2);
  console.log('--- ariiyatickets.com ---');
  $2('.event-item').each((i, el) => {
    const title = $2(el).find('.event-item-title').text().replace(/\s+/g, ' ').trim();
    if (title) console.log('Found:', title);
  });
}

run();
