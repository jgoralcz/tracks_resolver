const route = require('express-promise-router')();

const { validURL } = require('../lib/functions/httpValidator');
const { getHDTracksInvidio, getTracks, getPlayClipMegaURL } = require('../lib/helpers/YouTube');

const notFoundError = 'Need uri or search to resolve metadata.';

route.post('/', async (req, res) => {
  const { body } = req;

  if (!body || (!body.uri && !body.search)) {
    throw new Error(notFoundError);
  }

  const { uri, search, type } = body;

  if (validURL(uri || search)) {
    const results = (type && type === 'clipmega') ? await getPlayClipMegaURL(uri || search) : await getHDTracksInvidio(uri || search);
    return res.status(200).send(results);
  }

  if (!search) {
    throw new Error(notFoundError);
  }

  const results = await getTracks(search);
  return res.status(200).send(results);
});

module.exports = route;
