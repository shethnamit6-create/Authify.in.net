const bcrypt = require('bcryptjs');
const Application = require('../models/Application');
const User = require('../models/User');
const Credential = require('../models/Credential');
const { registrationOptions, verifyRegistration } = require('../services/webauthn.service');
const { store, retrieve, consume } = require('../services/challenge.service');
const { appendLog } = require('../services/audit.service');
const { success } = require('../utils/responseHelper');
const mongoose = require('mongoose');

const safeRpIdFromOrigin = (origin, fallback) => {
  if (!origin) return fallback;
  try {
    return new URL(origin).hostname;
  } catch (error) {
    return fallback;
  }
};

const getApplication = async (applicationId, clientId) => {
  if (!mongoose.Types.ObjectId.isValid(applicationId)) return null;
  const app = await Application.findOne({ _id: applicationId, clientId, active: true });
  return app;
};

const registerOptions = async (req, res) => {
  const { identifier, displayName, applicationId, password } = req.body;
  const clientId = req.header('x-client-id');

  const app = await getApplication(applicationId, clientId);
  if (!app) {
    return res.status(403).json({ success: false, error: { code: 'TENANT_VIOLATION', message: 'Invalid app context.' } });
  }

  let user = await User.findOne({ companyId: app.companyId, applicationId: app._id, identifier });
  const passwordHash = await bcrypt.hash(password, 12);

  if (!user) {
    user = await User.create({
      companyId: app.companyId,
      applicationId: app._id,
      identifier,
      displayName,
      passwordHash
    });
  } else {
    if (user.passwordHash) {
      const passwordOk = await bcrypt.compare(password, user.passwordHash);
      if (!passwordOk) {
        return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials.' } });
      }
    } else {
      user.passwordHash = passwordHash;
    }
    if (displayName) user.displayName = displayName;
    await user.save();
  }

  const credentials = await Credential.find({ userId: user._id, revokedAt: null });
  credentials.forEach((cred) => {
    if (cred && cred.credentialId && typeof cred.credentialId !== 'string') {
      cred.credentialId = Buffer.from(cred.credentialId).toString('base64url');
    }
  });
  const origin = req.get('origin');
  const rpID = safeRpIdFromOrigin(origin, req.hostname);
  const options = await registrationOptions({ user, application: app, credentials, rpID });

  await store('registration', user._id, options.challenge, { applicationId: app._id });

  return success(res, options);
};

const registerVerify = async (req, res) => {
  const { identifier, applicationId, registrationResponse, purpose = 'face' } = req.body;
  const clientId = req.header('x-client-id');

  const app = await getApplication(applicationId, clientId);
  if (!app) {
    return res.status(403).json({ success: false, error: { code: 'TENANT_VIOLATION', message: 'Invalid app context.' } });
  }

  const user = await User.findOne({ companyId: app.companyId, applicationId: app._id, identifier });
  if (!user) {
    return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found.' } });
  }

  const challengeDoc = await retrieve(user._id, 'registration');
  if (!challengeDoc) {
    return res.status(400).json({ success: false, error: { code: 'CHALLENGE_EXPIRED', message: 'Registration challenge expired.' } });
  }

  const requestOrigin = req.get('origin');
  const isLocalOrigin = requestOrigin && (requestOrigin.startsWith('http://localhost') || requestOrigin.startsWith('http://127.0.0.1'));
  const origin = (requestOrigin && (app.allowedOrigins.includes(requestOrigin) || isLocalOrigin))
    ? requestOrigin
    : app.allowedOrigins[0];
  const rpID = safeRpIdFromOrigin(origin, req.hostname);
  const verification = await verifyRegistration({
    response: registrationResponse,
    expectedChallenge: challengeDoc.challenge,
    origin,
    rpID
  });

  if (!verification.verified) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_SIGNATURE', message: 'Registration failed.' } });
  }

  const { registrationInfo } = verification;
  const credentialId = Buffer.from(registrationInfo.credentialID).toString('base64url');
  const publicKey = Buffer.from(registrationInfo.credentialPublicKey).toString('base64url');
  const credential = await Credential.create({
    userId: user._id,
    companyId: app.companyId,
    credentialId,
    publicKey,
    counter: registrationInfo.counter,
    deviceType: registrationInfo.credentialDeviceType,
    aaguid: registrationInfo.aaguid,
    transports: registrationResponse.response.transports || [],
    purpose
  });

  await consume(challengeDoc._id);

  await appendLog({
    companyId: app.companyId,
    userId: user._id,
    applicationId: app._id,
    eventType: 'registration',
    result: 'success',
    details: { credentialId: credential._id.toString() },
    ipAddress: req.ip,
    userAgent: req.get('user-agent')
  });

  return success(res, { success: true, userId: user._id });
};

module.exports = { registerOptions, registerVerify };
