const Company = require('../models/Company');
const { sha256 } = require('../utils/hashChain');

const apiKeyAuth = async (req, res, next) => {
  const apiKey = req.header('X-API-Key');
  if (!apiKey) {
    return res.status(401).json({ success: false, error: { code: 'INVALID_API_KEY', message: 'Missing API key' } });
  }

  const apiKeyHash = sha256(apiKey);
  const company = await Company.findOne({ apiKeyHash });
  if (!company) {
    return res.status(401).json({ success: false, error: { code: 'INVALID_API_KEY', message: 'Invalid API key' } });
  }

  req.company = company;
  req.apiKeyPrefix = company.apiKeyPrefix;
  next();
};

module.exports = { apiKeyAuth };
