const route = require('express-promise-router')();

const { spotify: spotifyRegex } = require('../lib/constants/regex');
const { spotifyAlbum, spotifyArtist, spotifyList } = require('../lib/helpers/Spotify');
const { spotifyJob } = require('../tasks/minute');

const notFoundUri = 'Expected uri in body';

const testSpotify = async (url) => {
  if (url.match(spotifyRegex.album)) {
    const [, playlistID] = spotifyAlbum.exec(url);
    return spotifyJob.spotify.getAlbum(playlistID);
  }

  if (url.match(spotifyRegex.artist)) {
    const [, playlistID] = spotifyArtist.exec(url);
    return spotifyJob.spotify.getArtist(playlistID);
  }

  if (url.match(spotifyRegex.user)) {
    // eslint-disable-next-line no-param-reassign
    url = url.replace(/\/user\/(\w)+/, '');
  }

  const matches = spotifyRegex.list.exec(url);
  if (matches && matches.length > 0) {
    const [, playlistID] = matches;
    return spotifyJob.spotify.getLinks(playlistID);
  }
  return [];
};

route.post('/', async (req, res) => {
  const { uri } = req.body;

  if (!uri) return res.status(400).send({ error: notFoundUri });

  const results = await testSpotify(uri);

  return res.status(200).send(results);
});

module.exports = route;
