const { verifyToken } = require('../services/jwt.service');

const jwtAuth = (requiredType) => (req, res, next) => {
  const auth = req.header('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: { code: 'INVALID_SIGNATURE', message: 'Missing bearer token' } });
  }

  const token = auth.slice(7);
  try {
    const payload = verifyToken(token);
    if (requiredType && payload.typ !== requiredType) {
      return res.status(403).json({ success: false, error: { code: 'TENANT_VIOLATION', message: 'Invalid token type' } });
    }

    if (payload.typ === 'company') {
      req.companyId = payload.cid;
    }

    if (payload.typ === 'user') {
      req.userId = payload.sub;
      req.companyId = payload.cid;
      req.applicationId = payload.aud;
    }

    req.jwt = payload;
    next();
  } catch (err) {
    err.status = 401;
    err.code = 'INVALID_SIGNATURE';
    next(err);
  }
};

module.exports = { jwtAuth };
