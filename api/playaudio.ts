import { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const youtubeUrl = req.query.url as string;

  if (!youtubeUrl) {
    return res.status(400).json({
      status: 'error',
      message: "No URL provided. Use '?url=YOUTUBE_URL' in the query."
    });
  }

  try {
    // Execute yt-dlp command to extract audio URL
    const command = `yt-dlp -f bestaudio --get-url --no-playlist "${youtubeUrl}"`;
    const titleCommand = `yt-dlp --get-title "${youtubeUrl}"`;

    const [playbackUrl, title] = await Promise.all([
      execPromise(command).then(result => result.stdout.trim()),
      execPromise(titleCommand).then(result => result.stdout.trim() || 'Unknown Title')
    ]);

    if (playbackUrl) {
      res.status(200).json({
        status: 'success',
        title: title,
        playback_url: playbackUrl
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Could not retrieve playback URL'
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: (error as Error).message
    });
  }
};

export default handler;
