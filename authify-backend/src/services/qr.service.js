const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const { storeSession } = require('./challenge.service');

const initCrossDevice = async (metadata = {}) => {
  const sessionId = uuidv4();
  const challenge = crypto.randomBytes(32).toString('base64url');
  const doc = await storeSession('crossdevice', sessionId, challenge, metadata);
  const challengePayload = Buffer.from(JSON.stringify({ sessionId, challenge })).toString('base64');

  return {
    sessionId,
    challengePayload,
    qrCodeData: challengePayload,
    challengeId: doc._id
  };
};

module.exports = { initCrossDevice };
