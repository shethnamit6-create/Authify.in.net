const rateLimit = require('express-rate-limit');

const keyGenerator = (req) => req.apiKeyPrefix || req.ip;

const registrationLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  keyGenerator
});

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  keyGenerator
});

module.exports = { registrationLimiter, authLimiter };
