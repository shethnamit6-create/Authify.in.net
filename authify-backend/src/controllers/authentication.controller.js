const bcrypt = require('bcryptjs');
const Application = require('../models/Application');
const User = require('../models/User');
const Credential = require('../models/Credential');
const { authenticationOptions, verifyAuthentication } = require('../services/webauthn.service');
const { store, retrieve, consume, retrieveSession } = require('../services/challenge.service');
const { appendLog } = require('../services/audit.service');
const { issueToken } = require('../services/jwt.service');
const { env } = require('../config/env');
const { success } = require('../utils/responseHelper');
const { initCrossDevice } = require('../services/qr.service');
const Challenge = require('../models/Challenge');
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

const authOptions = async (req, res) => {
  const { identifier, applicationId, password, purpose = 'face' } = req.body;
  const clientId = req.header('x-client-id');
  const app = await getApplication(applicationId, clientId);
  if (!app) {
    return res.status(403).json({ success: false, error: { code: 'TENANT_VIOLATION', message: 'Invalid app context.' } });
  }

  const user = await User.findOne({ companyId: app.companyId, applicationId: app._id, identifier });
  if (!user) {
    return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found.' } });
  }
  if (!user.passwordHash) {
    return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Password not set.' } });
  }

  const passwordOk = await bcrypt.compare(password, user.passwordHash);
  if (!passwordOk) {
    return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials.' } });
  }

  const credentials = await Credential.find({ userId: user._id, revokedAt: null, purpose });
  credentials.forEach((cred) => {
    if (cred && cred.credentialId && typeof cred.credentialId !== 'string') {
      cred.credentialId = Buffer.from(cred.credentialId).toString('base64url');
    }
  });
  if (credentials.length === 0) {
    return res.status(404).json({ success: false, error: { code: 'CREDENTIAL_NOT_FOUND', message: 'No credentials found.' } });
  }

  const origin = req.get('origin');
  const rpID = safeRpIdFromOrigin(origin, req.hostname);
  const options = await authenticationOptions({ credentials, rpID });
  await store('authentication', user._id, options.challenge, { applicationId: app._id });

  return success(res, options);
};

const authVerify = async (req, res) => {
  const { identifier, applicationId, authenticationResponse, purpose = 'face' } = req.body;
  const clientId = req.header('x-client-id');

  const app = await getApplication(applicationId, clientId);
  if (!app) {
    return res.status(403).json({ success: false, error: { code: 'TENANT_VIOLATION', message: 'Invalid app context.' } });
  }

  const user = await User.findOne({ companyId: app.companyId, applicationId: app._id, identifier });
  if (!user) {
    return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found.' } });
  }

  const challengeDoc = await retrieve(user._id, 'authentication');
  if (!challengeDoc) {
    return res.status(400).json({ success: false, error: { code: 'CHALLENGE_EXPIRED', message: 'Authentication challenge expired.' } });
  }

  const credentialId = authenticationResponse.id;
  const credential = await Credential.findOne({ userId: user._id, credentialId, revokedAt: null, purpose });
  if (!credential) {
    return res.status(404).json({ success: false, error: { code: 'CREDENTIAL_NOT_FOUND', message: 'Credential not found.' } });
  }

  const requestOrigin = req.get('origin');
  const isLocalOrigin = requestOrigin && (requestOrigin.startsWith('http://localhost') || requestOrigin.startsWith('http://127.0.0.1'));
  const origin = (requestOrigin && (app.allowedOrigins.includes(requestOrigin) || isLocalOrigin))
    ? requestOrigin
    : app.allowedOrigins[0];
  const rpID = safeRpIdFromOrigin(origin, req.hostname);
  const verification = await verifyAuthentication({
    response: authenticationResponse,
    expectedChallenge: challengeDoc.challenge,
    origin,
    credential,
    rpID
  });

  if (!verification.verified) {
    await appendLog({
      companyId: app.companyId,
      userId: user._id,
      applicationId: app._id,
      eventType: 'login_failed',
      result: 'failure',
      details: { reason: 'verification_failed' },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    return res.status(401).json({ success: false, error: { code: 'INVALID_SIGNATURE', message: 'Authentication failed.' } });
  }

  const newCounter = verification.authenticationInfo.newCounter ?? credential.counter;
  if (newCounter <= credential.counter) {
    return res.status(400).json({ success: false, error: { code: 'REPLAY_ATTACK_DETECTED', message: 'Replay detected.' } });
  }

  credential.counter = newCounter;
  await credential.save();
  user.lastLoginAt = new Date();
  await user.save();

  await consume(challengeDoc._id);

  await appendLog({
    companyId: app.companyId,
    userId: user._id,
    applicationId: app._id,
    eventType: 'login',
    result: 'success',
    ipAddress: req.ip,
    userAgent: req.get('user-agent')
  });

  const { token } = issueToken({
    sub: user._id.toString(),
    iss: 'authify',
    aud: app._id.toString(),
    cid: app.companyId.toString(),
    typ: 'user'
  }, env.DEFAULT_JWT_EXPIRY);

  return success(res, { token, redirectUri: app.redirectUris[0] || null });
};

const crossDeviceInit = async (req, res) => {
  const { applicationId, identifier } = req.body || {};
  let metadata = { ipAddress: req.ip, verified: false };

  if (applicationId && identifier) {
    const clientId = req.header('x-client-id');
    const app = await getApplication(applicationId, clientId);
    if (!app) {
      return res.status(403).json({ success: false, error: { code: 'TENANT_VIOLATION', message: 'Invalid app context.' } });
    }

    const user = await User.findOne({ companyId: app.companyId, applicationId: app._id, identifier });
    const credential = user ? await Credential.findOne({ userId: user._id, revokedAt: null }) : null;
    if (user && credential) {
      metadata = {
        ...metadata,
        applicationId: app._id,
        companyId: app.companyId,
        userId: user._id,
        credentialId: credential._id,
        origin: app.allowedOrigins[0]
      };
    }
  }

  const payload = await initCrossDevice(metadata);
  await Challenge.findByIdAndUpdate(payload.challengeId, { $set: { metadata } });
  return success(res, {
    sessionId: payload.sessionId,
    challengePayload: payload.challengePayload,
    qrCodeData: payload.qrCodeData
  });
};

const crossDeviceStatus = async (req, res) => {
  const { sessionId } = req.params;
  const doc = await retrieveSession(sessionId, 'crossdevice');
  if (!doc) {
    return res.status(404).json({ success: false, error: { code: 'CHALLENGE_EXPIRED', message: 'Session expired.' } });
  }

  return success(res, { verified: doc.metadata?.verified || false, token: doc.metadata?.token || null });
};

const crossDeviceVerify = async (req, res) => {
  const { sessionId, authenticationResponse } = req.body;
  const doc = await retrieveSession(sessionId, 'crossdevice');
  if (!doc) {
    return res.status(404).json({ success: false, error: { code: 'CHALLENGE_EXPIRED', message: 'Session expired.' } });
  }

  const { applicationId, userId, credentialId, origin } = doc.metadata || {};
  if (!applicationId || !userId || !credentialId || !origin) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_SIGNATURE', message: 'Session metadata incomplete.' } });
  }

  const credential = await Credential.findOne({ _id: credentialId, userId, revokedAt: null });
  if (!credential) {
    return res.status(404).json({ success: false, error: { code: 'CREDENTIAL_NOT_FOUND', message: 'Credential not found.' } });
  }

  const verification = await verifyAuthentication({
    response: authenticationResponse,
    expectedChallenge: doc.challenge,
    origin,
    credential
  });

  if (!verification.verified) {
    return res.status(401).json({ success: false, error: { code: 'INVALID_SIGNATURE', message: 'Cross-device verification failed.' } });
  }

  const { token } = issueToken({
    sub: userId.toString(),
    iss: 'authify',
    aud: applicationId.toString(),
    cid: doc.metadata.companyId,
    typ: 'user'
  }, env.DEFAULT_JWT_EXPIRY);

  await Challenge.findByIdAndUpdate(doc._id, { $set: { 'metadata.verified': true, 'metadata.token': token } });

  await appendLog({
    companyId: doc.metadata.companyId,
    userId,
    applicationId,
    eventType: 'crossdevice_login',
    result: 'success',
    ipAddress: req.ip,
    userAgent: req.get('user-agent')
  });

  return success(res, { verified: true });
};

module.exports = { authOptions, authVerify, crossDeviceInit, crossDeviceStatus, crossDeviceVerify };
