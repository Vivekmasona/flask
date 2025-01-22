const express = require('express');
const ytdl = require('ytdl-core');
const app = express();

app.get('/api', async (req, res) => {
  const youtubeUrl = req.query.url;
  if (!youtubeUrl) {
    return res.status(400).json({ status: 'error', message: 'URL is required' });
  }
  try {
    const info = await ytdl.getInfo(youtubeUrl);
    const playbackUrl = info.formats.find(format => format.mimeType.includes('audio')).url;
    res.json({
      status: 'success',
      title: info.videoDetails.title,
      playback_url: playbackUrl
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
