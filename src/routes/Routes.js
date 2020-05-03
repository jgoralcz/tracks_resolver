const router = require('express-promise-router')();
const youtube = require('./YouTube');

router.use('/youtube', youtube);

module.exports = router;
