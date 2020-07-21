const route = require('express-promise-router')();

const { spotify: spotifyRegex } = require('../lib/constants/regex');
const { spotifyJob } = require('../tasks');

const notFoundUri = 'Expected uri in body';

const testSpotify = async (url) => {
  if (url.match(spotifyRegex.album)) {
    const [, playlistID] = spotifyRegex.album.exec(url);
    return spotifyJob.spotify.getAlbum(playlistID);
  }

  if (url.match(spotifyRegex.artist)) {
    const [, playlistID] = spotifyRegex.artist.exec(url);
    return spotifyJob.spotify.getArtist(playlistID);
  }

  if (url.match(spotifyRegex.user)) {
    // eslint-disable-next-line no-param-reassign
    url = url.replace(/\/user\/(\w)+/, '');
  }

  if (spotifyRegex.track.test(url)) {
    const trackID = spotifyRegex.track.exec(url)[1];
    const track = await spotifyJob.spotify.getTrack(trackID);
    return track;
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
