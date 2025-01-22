const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/extract', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    // Launch Puppeteer browser
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Go to the provided URL
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Extract all links, images, and any other relevant data from the page
    const pageData = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a')).map(anchor => anchor.href);
      const images = Array.from(document.querySelectorAll('img')).map(img => img.src);
      const titles = document.title;
      const description = document.querySelector('meta[name="description"]')?.content || 'No description available';

      return {
        title: titles,
        description: description,
        links: links,
        images: images,
      };
    });

    // Close the browser
    await browser.close();

    if (pageData) {
      return res.json(pageData); // Return extracted data as JSON
    } else {
      return res.status(404).json({ error: 'No extractable data found' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
