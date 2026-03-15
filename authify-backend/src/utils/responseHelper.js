const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()]
});

const success = (res, data, status = 200) => {
  res.status(status).json({ success: true, data });
};

const failure = (res, code, message, status = 400) => {
  res.status(status).json({ success: false, error: { code, message } });
};

module.exports = { logger, success, failure };
