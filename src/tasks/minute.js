const { scheduleJob } = require('node-schedule');

const Spotify = require('../lib/helpers/Spotify');

// laziest way I can think of to refresh token
// every 30 min because token exires after 1 hour
const spotifyJob = () => {
  new scheduleJob('minute', '0 * * * * *', async () => {
    const spotify = new Spotify();
    spotifyJob.spotify = await spotify.create();

    if (minutes % 30 === 0) {
      spotify.refresh();
    }
  });
}

module.exports = {
  spotifyJob
}
