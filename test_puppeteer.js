import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

async function run() {
  const browser = await puppeteer.launch({ headless: true });
  
  try {
    const pageIG = await browser.newPage();
    console.log("Navigating to Instagram...");
    await pageIG.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'networkidle2' });
    await pageIG.screenshot({ path: 'ig_login.png' });
    console.log("Saved IG screenshot to ig_login.png");
  } catch (err) {
    console.error("IG Error:", err.message);
  }

  try {
    const pageX = await browser.newPage();
    console.log("Navigating to X...");
    await pageX.goto('https://x.com/i/flow/login', { waitUntil: 'networkidle2', timeout: 30000 });
    await pageX.screenshot({ path: 'x_login.png' });
    console.log("Saved X screenshot to x_login.png");
  } catch (err) {
    console.error("X Error:", err.message);
  }
  
  await browser.close();
}

run();
