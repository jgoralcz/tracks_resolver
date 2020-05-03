const bodyparser = require('body-parser');
const express = require('express');
const logger = require('log4js').getLogger();
const hsts = require('hsts');

const { errorHandler } = require('./middleware/ErrorHandler');
const { httpLogger } = require('./middleware/Logger');

logger.level = 'info';
const port = 9443;

const env = process.env.NODE_ENV || 'LOCAL';

const router = require('./routes/Routes');

const server = express();

server.use(hsts({ maxAge: 31536000 }));
server.use(bodyparser.urlencoded({ extended: true }));
server.use(bodyparser.json());
server.use(httpLogger());

server.use('/track_resolver/', router, errorHandler);

server.listen(port, () => logger.info(`${env.toUpperCase()} server started on ${port}`));
