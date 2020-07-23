const { scheduleJob } = require('node-schedule');

const { config: configPath } = require('./lib/constants/paths');
const Spotify = require('./lib/helpers/Spotify');

const config = require(configPath);

// laziest way I can think of to refresh token
// every 30 min because token exires after 1 hour
const spotifyJob = async () => {
  const spotify = new Spotify();
  spotifyJob.spotify = await spotify.create();

  const refreshTimeInMinutes = config
    && config.refreshTimeInMinutes >= 0 && config.refreshTimeInMinutes <= 59
    ? config.refreshTimeInMinutes
    : 30;

  scheduleJob('minute', '0 * * * * *', async () => {
    const now = new Date();
    const minutes = now.getMinutes();

    if (minutes % refreshTimeInMinutes === 0) {
      spotify.refresh();
    }
  });
};

module.exports = {
  spotifyJob,
};
