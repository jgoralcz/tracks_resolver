const route = require('express-promise-router')();

const { validURL } = require('../lib/functions/httpValidator');
const { getHDTracksInvidio, getTracks, getPlayClipMegaURL } = require('../lib/helpers/YouTube');

const notFoundUriOrSearch = 'Expected uri or search in body';

route.post('/', async (req, res) => {
  const { uri, search, type } = req.body;

  if (!uri || !search || !type) {
    return res.status(400).send({ 'error': notFoundUriOrSearch });
  }

  const searchThis = uri || search;

  if (validURL(searchThis)) {
    if (type === 'similarTo') {
      const results = await getSimilarTracksToURL(searchThis);
      return res.status(200).send(results);
    }
    const results = (type === 'clipmega') ? await getPlayClipMegaURL(searchThis) : await getHDTracksInvidio(searchThis);
    return res.status(200).send(results);
  }

  if (!search) {
    return res.status(400).send({ 'error': notFoundUriOrSearch });
  }

  const results = await getTracks(search);
  return res.status(200).send(results);
});

module.exports = route;
