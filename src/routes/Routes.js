const router = require('express-promise-router')();

const youtube = require('./YouTube');
const spotify = require('./Spotify');

router.use('/youtube', youtube);
router.use('/spotify', spotify);

module.exports = router;
