const route = require('express-promise-router')();

const { validURL } = require('../lib/functions/httpValidator');
const {
  getHDTracksInvidio,
  getTracks,
  getPlayClipMegaURL,
  findRelevantVideos,
  closestYouTubeMatch,
} = require('../lib/helpers/YouTube');

const notFoundUriOrSearch = 'Expected uri, search, or phrase in body';

route.post('/', async (req, res) => {
  const {
    uri,
    search,
    type,
    phrase,
  } = req.body;

  if (!uri && !search && !phrase) {
    return res.status(400).send({ error: notFoundUriOrSearch });
  }

  const searchThis = uri || search;
  const lowerType = type && type.toLowerCase ? type.toLowerCase() : '';

  if (lowerType === 'spotify') {
    const {
      backupPhrase,
      album,
      artists,
    } = req.body;

    if (!phrase || typeof phrase !== 'string'
      || typeof backupPhrase !== 'string'
      || typeof album !== 'string'
      || typeof artists !== 'string') {
      return res.status(400).send({ error: 'required params must be strings: phrase, backupPhrase, album, artists' });
    }

    const closest = await closestYouTubeMatch(phrase, backupPhrase, album, artists);
    return res.status(200).send(closest);
  }

  if (validURL(searchThis)) {
    if (lowerType === 'similarto') {
      const results = await findRelevantVideos(searchThis);
      return res.status(200).send(results);
    }

    const results = (lowerType === 'clipmega') ? await getPlayClipMegaURL(searchThis) : await getHDTracksInvidio(searchThis);
    return res.status(200).send(results);
  }

  if (!search) {
    return res.status(400).send({ error: notFoundUriOrSearch });
  }

  const results = await getTracks(search);
  return res.status(200).send(results);
});

module.exports = route;
