const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/instagram', async (req, res) => {
  const { url } = req.query;

  if (!url || !url.includes('instagram.com')) {
    return res.status(400).json({ error: 'Invalid Instagram URL' });
  }

  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const videoUrl = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'));
      for (const script of scripts) {
        if (script.innerText.includes('window._sharedData')) {
          const data = JSON.parse(script.innerText.replace('window._sharedData = ', '').slice(0, -1));
          const media = data.entry_data.PostPage[0].graphql.shortcode_media;
          return media.video_url || media.display_url;
        }
      }
      return null;
    });

    await browser.close();

    if (videoUrl) {
      return res.json({ videoUrl });
    } else {
      return res.status(404).json({ error: 'Video URL not found' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
