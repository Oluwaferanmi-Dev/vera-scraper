import { DISCOVERY_TERMS } from '../config/sources.js';
import { normaliseCandidate } from '../lib/extract.js';
import * as cheerio from 'cheerio';

const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function scrapeInstagram(page, source) {
  await page.goto(source.url, { waitUntil: 'networkidle2' });
  
  if (page.url().includes('login')) {
     const user = process.env.IG_USERNAME;
     const pass = process.env.IG_PASSWORD;
     if (user && pass) {
        await page.waitForSelector('input[name="username"]', { timeout: 10000 });
        await page.type('input[name="username"]', user, { delay: 50 });
        await page.type('input[name="password"]', pass, { delay: 50 });
        await page.click('button[type="submit"]');
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        await page.goto(source.url, { waitUntil: 'networkidle2' });
     } else {
        throw new Error("Redirected to login but no credentials provided");
     }
  }

  await page.evaluate(() => window.scrollBy(0, window.innerHeight));
  await delay(2000);

  const html = await page.content();
  const $ = cheerio.load(html);
  
  const rawEvents = [];
  $('article').each((i, el) => {
    const text = $(el).text();
    const link = $(el).find('a').attr('href');
    if (text && link) {
      rawEvents.push({
         name: text.substring(0, 100),
         description: text,
         url: new URL(link, 'https://www.instagram.com').href,
      });
    }
  });
  return rawEvents;
}

async function scrapeX(page, source) {
  await page.goto(source.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  
  if (page.url().includes('login')) {
     const user = process.env.X_USERNAME;
     const pass = process.env.X_PASSWORD;
     if (user && pass) {
        await page.waitForSelector('input[autocomplete="username"]', { timeout: 10000 });
        await page.type('input[autocomplete="username"]', user, { delay: 50 });
        const nextButton = await page.$$('::-p-xpath(//span[text()="Next"])');
        if (nextButton.length > 0) await nextButton[0].click();
        await delay(2000);
        await page.waitForSelector('input[name="password"]', { timeout: 10000 });
        await page.type('input[name="password"]', pass, { delay: 50 });
        const logInButton = await page.$$('::-p-xpath(//span[text()="Log in"])');
        if (logInButton.length > 0) await logInButton[0].click();
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        
        await page.goto(source.url, { waitUntil: 'networkidle2' });
     } else {
        throw new Error("Redirected to login but no credentials provided");
     }
  }

  await page.evaluate(() => window.scrollBy(0, window.innerHeight));
  await delay(2000);

  const html = await page.content();
  const $ = cheerio.load(html);
  
  const rawEvents = [];
  $('article[data-testid="tweet"]').each((i, el) => {
    const text = $(el).text();
    const link = $(el).find('a').attr('href');
    if (text && link) {
      rawEvents.push({
         name: text.substring(0, 100),
         description: text,
         url: new URL(link, 'https://x.com').href,
      });
    }
  });
  return rawEvents;
}

export async function scrapePuppeteerSocial(source, context) {
  if (!context.browser) {
    return { source, skipped: 'Puppeteer browser not initialized', candidates: [] };
  }

  const page = await context.browser.newPage();
  const candidates = [];
  
  try {
    let rawEvents = [];
    if (source.platform === 'instagram') {
       rawEvents = await scrapeInstagram(page, source);
    } else if (source.platform === 'x') {
       rawEvents = await scrapeX(page, source);
    }

    for (const event of rawEvents) {
      const textContext = `${event.name} ${event.description || ''}`;
      if (DISCOVERY_TERMS.test(textContext)) {
        candidates.push(
          normaliseCandidate({
            name: event.name.trim(),
            url: event.url,
            description: event.description.trim(),
            startDate: '',
            location: { name: 'Check Post' }
          }, source)
        );
      }
    }
  } finally {
    await page.close();
  }

  return { source, candidates };
}
