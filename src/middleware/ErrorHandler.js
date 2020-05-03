const logger = require('log4js').getLogger();

const errorHandler = (err, _, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  logger.error(err);
  const error = {
    error: {
      name: err.name,
      message: err.message,
      code: err.code,
    },
  };

  const status = err.status || 500;

  return res.status(status).json(error);
};

module.exports = {
  errorHandler,
};
