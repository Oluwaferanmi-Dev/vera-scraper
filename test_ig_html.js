import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

async function run() {
  const browser = await puppeteer.launch({ headless: true });
  
  try {
    const pageIG = await browser.newPage();
    console.log("Navigating to Instagram...");
    await pageIG.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 5000));
    
    const inputs = await pageIG.evaluate(() => {
       const nodes = Array.from(document.querySelectorAll('input'));
       return nodes.map(n => ({ name: n.name, type: n.type, ariaLabel: n.getAttribute('aria-label') }));
    });
    console.log("Inputs found:", inputs);
  } catch (err) {
    console.error("IG Error:", err.message);
  }
  
  await browser.close();
}

run();
