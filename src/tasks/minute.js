const { scheduleJob } = require('node-schedule');

const Spotify = require('../lib/helpers/Spotify');

// laziest way I can think of to refresh token
// every 30 min because token exires after 1 hour
const spotifyJob = async () => {
  const spotify = new Spotify();
  spotifyJob.spotify = await spotify.create();

  scheduleJob('minute', '0 * * * * *', async () => {
    const now = new Date();
    const minutes = now.getMinutes();

    if (minutes % 30 === 0) {
      spotify.refresh();
    }
  });
};

module.exports = {
  spotifyJob,
};
