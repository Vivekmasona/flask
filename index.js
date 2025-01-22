const puppeteer = require('puppeteer-core');
const chrome = require('chrome-aws-lambda');

app.get('/extract', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: await chrome.executablePath,
      args: chrome.args,
      defaultViewport: chrome.defaultViewport
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Extract page content as before
    const pageData = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a')).map(anchor => anchor.href);
      const images = Array.from(document.querySelectorAll('img')).map(img => img.src);
      return { links, images };
    });

    await browser.close();

    return res.json(pageData);

  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
});
