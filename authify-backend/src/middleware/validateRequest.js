const { ZodError } = require('zod');
const Application = require('../models/Application');

const validateRequest = (schema) => (req, _res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
      headers: req.headers
    });
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      err.status = 400;
      err.code = 'VALIDATION_ERROR';
      err.message = err.errors.map((e) => e.message).join('; ');
    }
    next(err);
  }
};

const containsRestrictedKey = (obj) => {
  if (!obj || typeof obj !== 'object') return false;
  const restricted = new Set(['biometric', 'fingerprint', 'face']);
  for (const key of Object.keys(obj)) {
    if (restricted.has(key.toLowerCase())) return true;
    if (containsRestrictedKey(obj[key])) return true;
  }
  return false;
};

const blockBiometricData = (req, res, next) => {
  if (containsRestrictedKey(req.body)) {
    return res.status(400).json({
      success: false,
      error: { code: 'BIOMETRIC_NOT_ALLOWED', message: 'Biometric data is not accepted.' }
    });
  }
  return next();
};

const resolveCorsForRequest = async (req, cb) => {
  const origin = req.header('Origin');
  if (!origin) return cb(null, { origin: true, credentials: true });

  if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
    return cb(null, { origin: true, credentials: true });
  }

  const openCorsPrefixes = [
    '/api/v1/company',
    '/api/v1/dashboard',
    '/api/v1/audit',
    '/api/v1/applications',
    '/api/v1/recovery/admin'
  ];

  if (openCorsPrefixes.some((prefix) => req.originalUrl.startsWith(prefix))) {
    return cb(null, { origin: true, credentials: true });
  }

  try {
    const clientId = req.header('x-client-id');
    const applicationId = req.body?.applicationId || req.query?.applicationId;
    let app = null;

    if (clientId) {
      app = await Application.findOne({ clientId, active: true });
    } else if (applicationId) {
      app = await Application.findById(applicationId);
    }

    if (app && app.allowedOrigins.includes(origin)) {
      return cb(null, { origin: true, credentials: true });
    }

    return cb(null, { origin: false });
  } catch (err) {
    return cb(err, { origin: false });
  }
};

module.exports = { validateRequest, blockBiometricData, resolveCorsForRequest };
