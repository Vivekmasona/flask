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
    // Launch Puppeteer browser
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Open the Instagram post URL
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Extract video and image URLs
    const mediaData = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'));
      for (const script of scripts) {
        if (script.innerText.includes('window._sharedData')) {
          const data = JSON.parse(script.innerText.replace('window._sharedData = ', '').slice(0, -1));
          const media = data.entry_data.PostPage[0].graphql.shortcode_media;

          // Extracting video URL if available
          const videoUrl = media.video_url ? media.video_url : null;
          // Extracting image URL if available
          const imageUrl = media.display_url ? media.display_url : null;
          // Extracting post metadata (like caption, profile info, etc.)
          const caption = media.edge_media_to_caption.edges[0] ? media.edge_media_to_caption.edges[0].node.text : '';
          const userProfile = {
            username: media.owner.username,
            profile_picture: media.owner.profile_pic_url
          };

          return {
            videoUrl,
            imageUrl,
            caption,
            userProfile
          };
        }
      }
      return null;
    });

    // Close the browser
    await browser.close();

    if (mediaData) {
      return res.json(mediaData); // Return media data as JSON
    } else {
      return res.status(404).json({ error: 'Media data not found' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
