const route = require('express-promise-router')();

const { spotifyAlbum, spotifyArtist } = require('../lib/helpers/Spotify');

const notFoundUri = 'Expected uri in body';

const testSpotify = async (url) => {
  if (url.match(/album/i)) {
    const [, playlistID] = spotifyAlbum.exec(url);
    return minuteJob.spotify.getAlbum(playlistID);
  }

  if (url.match(/artist/i)) {
    const [, playlistID] = spotifyArtist.exec(url);
    return minuteJob.spotify.getArtist(playlistID);
  }

  if (url.match(/user/i)) {
    // eslint-disable-next-line no-param-reassign
    url = url.replace(/\/user\/(\w)+/, '');
  }

  const matches = spotifyList.exec(url);
  if (matches && matches.length > 0) {
    const [, playlistID] = matches;
    return minuteJob.spotify.getLinks(playlistID);
  }
  return [];
}

route.post('/', async (req, res) => {
  const { uri } = req.body;

  if (!uri) return res.status(400).send({ 'error': notFoundUri });

  const results = await testSpotify(uri);

  return res.status(200).send(results);
});

module.exports = route;
