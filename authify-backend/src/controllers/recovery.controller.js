const Application = require('../models/Application');
const User = require('../models/User');
const Credential = require('../models/Credential');
const RecoveryRequest = require('../models/RecoveryRequest');
const { registrationOptions, verifyRegistration } = require('../services/webauthn.service');
const { store, retrieve, consume } = require('../services/challenge.service');
const { appendLog } = require('../services/audit.service');
const { success } = require('../utils/responseHelper');

const getApplication = async (applicationId, clientId) => {
  const app = await Application.findOne({ _id: applicationId, clientId, active: true });
  return app;
};

const recoveryRequest = async (req, res) => {
  const { identifier, applicationId } = req.body;
  const clientId = req.header('x-client-id');

  const app = await getApplication(applicationId, clientId);
  if (!app) {
    return res.status(403).json({ success: false, error: { code: 'TENANT_VIOLATION', message: 'Invalid app context.' } });
  }

  const user = await User.findOne({ companyId: app.companyId, applicationId: app._id, identifier });
  if (!user) {
    return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found.' } });
  }

  user.status = 'pending_recovery';
  await user.save();

  const request = await RecoveryRequest.create({
    userId: user._id,
    companyId: app.companyId,
    verificationMethod: 'admin',
    status: 'pending'
  });

  const credentials = await Credential.find({ userId: user._id, revokedAt: null });
  const options = await registrationOptions({ user, application: app, credentials });
  await store('recovery', user._id, options.challenge, { applicationId: app._id, recoveryRequestId: request._id });

  await appendLog({
    companyId: app.companyId,
    userId: user._id,
    applicationId: app._id,
    eventType: 'recovery_requested',
    result: 'success',
    ipAddress: req.ip,
    userAgent: req.get('user-agent')
  });

  return success(res, { recoveryRequestId: request._id, options });
};

const recoveryAdminVerify = async (req, res) => {
  const { requestId } = req.params;
  const request = await RecoveryRequest.findOne({ _id: requestId, companyId: req.companyId });
  if (!request) {
    return res.status(404).json({ success: false, error: { code: 'RECOVERY_NOT_VERIFIED', message: 'Recovery request not found.' } });
  }

  request.status = 'verified';
  request.verifiedAt = new Date();
  request.verificationMethod = 'admin';
  await request.save();

  return success(res, { verified: true });
};

const recoveryComplete = async (req, res) => {
  const { recoveryRequestId, registrationResponse } = req.body;

  const request = await RecoveryRequest.findById(recoveryRequestId);
  if (!request || request.status !== 'verified') {
    return res.status(400).json({ success: false, error: { code: 'RECOVERY_NOT_VERIFIED', message: 'Recovery not verified.' } });
  }

  const user = await User.findById(request.userId);
  const app = await Application.findOne({ _id: user.applicationId, companyId: request.companyId });

  const challengeDoc = await retrieve(user._id, 'recovery');
  if (!challengeDoc) {
    return res.status(400).json({ success: false, error: { code: 'CHALLENGE_EXPIRED', message: 'Recovery challenge expired.' } });
  }

  const origin = app.allowedOrigins[0];
  const verification = await verifyRegistration({
    response: registrationResponse,
    expectedChallenge: challengeDoc.challenge,
    origin,
    user
  });

  if (!verification.verified) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_SIGNATURE', message: 'Recovery failed.' } });
  }

  await Credential.updateMany({ userId: user._id, revokedAt: null }, { revokedAt: new Date() });

  const { registrationInfo } = verification;
  const credentialId = Buffer.from(registrationInfo.credentialID).toString('base64url');
  const publicKey = Buffer.from(registrationInfo.credentialPublicKey).toString('base64url');
  const credential = await Credential.create({
    userId: user._id,
    companyId: request.companyId,
    credentialId,
    publicKey,
    counter: registrationInfo.counter,
    deviceType: registrationInfo.credentialDeviceType,
    aaguid: registrationInfo.aaguid,
    transports: registrationResponse.response.transports || []
  });

  request.status = 'completed';
  request.completedAt = new Date();
  request.newCredentialId = credential._id;
  await request.save();

  user.status = 'active';
  await user.save();

  await consume(challengeDoc._id);

  await appendLog({
    companyId: request.companyId,
    userId: user._id,
    applicationId: app._id,
    eventType: 'recovery_completed',
    result: 'success',
    details: { credentialId: credential._id.toString() },
    ipAddress: req.ip,
    userAgent: req.get('user-agent')
  });

  return success(res, { success: true });
};

module.exports = { recoveryRequest, recoveryAdminVerify, recoveryComplete };
