const bcrypt = require('bcryptjs');
const Company = require('../models/Company');
const { generateApiKey } = require('../utils/generateApiKey');
const { issueToken } = require('../services/jwt.service');
const { appendLog } = require('../services/audit.service');
const { success } = require('../utils/responseHelper');
const { env } = require('../config/env');

const registerCompany = async (req, res) => {
  const { name, email, password, plan } = req.body;

  const existing = await Company.findOne({ email });
  if (existing) {
    return res.status(400).json({ success: false, error: { code: 'EMAIL_IN_USE', message: 'Email already registered.' } });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const { apiKey, apiKeyHash, apiKeyPrefix } = generateApiKey();
  const company = await Company.create({ name, email, passwordHash, apiKeyHash, apiKeyPrefix, plan });

  await appendLog({
    companyId: company._id,
    eventType: 'api_key_generated',
    result: 'success',
    details: { reason: 'company_registration' }
  });

  const { token } = issueToken({
    sub: company._id.toString(),
    iss: 'authify',
    aud: 'authify-company',
    cid: company._id.toString(),
    typ: 'company'
  }, env.DEFAULT_JWT_EXPIRY);

  return success(res, { token, apiKey, companyId: company._id }, 201);
};

const loginCompany = async (req, res) => {
  const { email, password } = req.body;
  const company = await Company.findOne({ email });
  if (!company) {
    return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid login.' } });
  }

  const valid = await bcrypt.compare(password, company.passwordHash);
  if (!valid) {
    return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid login.' } });
  }

  const { token } = issueToken({
    sub: company._id.toString(),
    iss: 'authify',
    aud: 'authify-company',
    cid: company._id.toString(),
    typ: 'company'
  }, env.DEFAULT_JWT_EXPIRY);

  return success(res, { token, companyId: company._id });
};

const rotateApiKey = async (req, res) => {
  const companyId = req.companyId;
  const { apiKey, apiKeyHash, apiKeyPrefix } = generateApiKey();
  const company = await Company.findByIdAndUpdate(
    companyId,
    { apiKeyHash, apiKeyPrefix },
    { new: true }
  );

  await appendLog({
    companyId: company._id,
    eventType: 'api_key_generated',
    result: 'success',
    details: { reason: 'rotation' }
  });

  return success(res, { apiKey, apiKeyPrefix });
};

module.exports = { registerCompany, loginCompany, rotateApiKey };
