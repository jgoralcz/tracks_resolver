const route = require('express-promise-router')();

const { validURL } = require('../lib/functions/httpValidator');
const {
  getHDTracksInvidio,
  getTracks,
  getPlayClipMegaURL,
  findRelevantVideos,
  closestYouTubeMatch,
} = require('../lib/helpers/YouTube');

route.get('/spotify', async (req, res) => {
  const {
    phrase,
    backupPhrase,
    album,
    artists,
  } = req.query;

  if (!phrase) {
    return res.status(400).send({ error: 'Expected string values for phrase in query string (also accepts: backupPhrase, album, artists)' });
  }

  if (typeof phrase !== 'string'
    || (backupPhrase && typeof backupPhrase !== 'string')
    || (album && typeof album !== 'string')
    || (artists && typeof artists !== 'string')) {
    return res.status(400).send({ error: 'required queries must be strings: phrase, backupPhrase, album, artists' });
  }

  const closest = await closestYouTubeMatch(phrase, backupPhrase, album, artists);
  if (!closest) return res.status(404).send();

  return res.status(200).send(closest);
});

route.get('/similarto', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send({ error: 'Expected url in query string' });
  }

  const results = await findRelevantVideos(decodeURIComponent(url));
  return res.status(200).send(results);
});

route.get('/search', async (req, res) => {
  const { type, url: urlEncoded, name } = req.query;

  if (!urlEncoded && !name) {
    return res.status(400).send({ error: 'Expected url or name in query string' });
  }

  const url = urlEncoded ? decodeURIComponent(urlEncoded) : undefined;

  if (url && !validURL(url)) {
    return res.status(400).send({ error: 'Invalid url provided' });
  }

  if (!name && url) {
    const resultsURL = (type && type.toLowerCase() === 'invidio') ? await getHDTracksInvidio(url) : await getPlayClipMegaURL(url);
    return res.status(200).send(resultsURL);
  }

  const results = await getTracks(name);
  return res.status(200).send(results);
});

module.exports = route;
