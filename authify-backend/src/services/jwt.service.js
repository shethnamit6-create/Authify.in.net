const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { env } = require('../config/env');
const { logger } = require('../utils/responseHelper');

const revokedJtis = new Set();

const loadKeys = () => {
  const isPlaceholder = env.JWT_PRIVATE_KEY.includes('<RSA PEM>') || env.JWT_PUBLIC_KEY.includes('<RSA PEM>');
  if (isPlaceholder) {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
    logger.warn('JWT keys were placeholders; generated ephemeral keys for this session.');
    return {
      kid: env.JWT_KID || 'ephemeral',
      privateKey: privateKey.export({ type: 'pkcs1', format: 'pem' }),
      publicKey: publicKey.export({ type: 'pkcs1', format: 'pem' })
    };
  }

  return {
    kid: env.JWT_KID || 'default-kid',
    privateKey: env.JWT_PRIVATE_KEY,
    publicKey: env.JWT_PUBLIC_KEY
  };
};

const keyBundle = loadKeys();

const issueToken = (payload, expiresInSeconds) => {
  const jti = crypto.randomUUID();
  const token = jwt.sign(
    { ...payload, jti },
    keyBundle.privateKey,
    {
      algorithm: 'RS256',
      expiresIn: expiresInSeconds,
      keyid: keyBundle.kid
    }
  );

  return { token, jti };
};

const verifyToken = (token) => {
  const decoded = jwt.verify(token, keyBundle.publicKey, { algorithms: ['RS256'] });
  if (decoded.jti && revokedJtis.has(decoded.jti)) {
    const err = new Error('Token revoked');
    err.code = 'INVALID_SIGNATURE';
    throw err;
  }
  return decoded;
};

const revokeToken = (jti) => {
  revokedJtis.add(jti);
};

module.exports = { issueToken, verifyToken, revokeToken };
