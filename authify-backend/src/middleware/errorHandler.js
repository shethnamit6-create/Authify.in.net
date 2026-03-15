const { logger } = require('../utils/responseHelper');

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const notFoundHandler = (_req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
};

const errorHandler = (err, _req, res, _next) => {
  logger.error({
    message: err?.message || 'Unknown error',
    code: err?.code,
    stack: err?.stack
  });
  const status = err.status || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'Unexpected error';

  res.status(status).json({ success: false, error: { code, message } });
};

module.exports = { asyncHandler, errorHandler, notFoundHandler };
