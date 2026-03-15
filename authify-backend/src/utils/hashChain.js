const crypto = require('crypto');

const sha256 = (input) =>
  crypto.createHash('sha256').update(input).digest('hex');

const computeAuditHash = ({ prevHash, eventType, userId, timestamp, details }) => {
  const detailsString = JSON.stringify(details || {});
  return sha256(`${prevHash}${eventType}${userId}${timestamp}${detailsString}`);
};

module.exports = { sha256, computeAuditHash };
