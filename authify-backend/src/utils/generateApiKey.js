const crypto = require('crypto');
const { sha256 } = require('./hashChain');

const generateApiKey = () => {
  const apiKey = crypto.randomBytes(32).toString('hex');
  const apiKeyHash = sha256(apiKey);
  const apiKeyPrefix = apiKey.slice(0, 8);

  return { apiKey, apiKeyHash, apiKeyPrefix };
};

module.exports = { generateApiKey };
