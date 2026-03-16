const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const DeviceTrust = require('../models/DeviceTrust');
const { storeSession, retrieveSession, consume } = require('../services/challenge.service');
const { issueToken } = require('../services/jwt.service');
const { success } = require('../utils/responseHelper');
const { env } = require('../config/env');
const { encrypt, decrypt, hash } = require('../utils/crypto');
const { sendEmail } = require('../services/email.service');
const { appendLog } = require('../services/audit.service');

const createSession = async (user) => {
  const sessionId = crypto.randomUUID();
  await storeSession('mfa', sessionId, crypto.randomBytes(16).toString('base64url'), {
    userId: user._id.toString(),
    stage: 'password',
    optional: {},
    verifiedOptional: false
  });
  return sessionId;
};

const getUserFromSession = async (sessionId) => {
  const session = await retrieveSession(sessionId, 'mfa');
  if (!session) return null;
  const user = await User.findById(session.metadata.userId);
  return { session, user };
};

const generateBackupCodes = () => {
  const codes = [];
  for (let i = 0; i < 10; i += 1) {
    codes.push(Math.random().toString(36).slice(-10).toUpperCase());
  }
  return codes;
};

const sendBackupCodesEmail = async (user, codes) => {
  if (!codes || codes.length === 0) return;
  const recipient = user.email || user.identifier;
  const textCodes = codes.map((c) => `- ${c}`).join('\n');
  const htmlCodes = codes.map((c) => `<li><code>${c}</code></li>`).join('');

  await sendEmail({
    to: recipient,
    subject: 'Your Authify backup codes',
    text: `Here are your Authify backup codes:\n${textCodes}\n\nEach code can be used once. Store them securely.`,
    html: `<p>Here are your Authify backup codes:</p><ul>${htmlCodes}</ul><p>Each code can be used once. Store them securely.</p>`
  });
};

const compareFace = (storedDescriptor, incomingDescriptor) => {
  if (!Array.isArray(storedDescriptor) || !Array.isArray(incomingDescriptor)) return false;
  if (storedDescriptor.length !== incomingDescriptor.length) return false;
  let sum = 0;
  for (let i = 0; i < storedDescriptor.length; i += 1) {
    const diff = Number(storedDescriptor[i]) - Number(incomingDescriptor[i]);
    sum += diff * diff;
  }
  const distance = Math.sqrt(sum);
  return distance <= env.FACE_MATCH_THRESHOLD;
};

const registerUser = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  const identifier = email.toLowerCase().trim();
  if (!identifier || !password) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Email and password are required.' } });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    companyId: req.companyId,
    applicationId: req.applicationId,
    identifier,
    email: identifier,
    displayName: `${firstName || ''} ${lastName || ''}`.trim() || identifier,
    passwordHash
  });

  await appendLog({
    companyId: user.companyId,
    userId: user._id,
    applicationId: user.applicationId,
    eventType: 'registration',
    result: 'success',
    ipAddress: req.ip,
    userAgent: req.get('user-agent')
  });

  const { token } = issueToken({
    sub: user._id.toString(),
    iss: 'authify',
    aud: user.applicationId.toString(),
    cid: user.companyId.toString(),
    typ: 'user'
  }, 600);

  return success(res, {
    token,
    user: {
      id: user._id.toString(),
      email: user.email,
      displayName: user.displayName
    },
    requiresFace: true,
    requiresFaceEnrollment: true
  }, 201);
};

const registerFace = async (req, res) => {
  const { descriptor, preferences = {} } = req.body;
  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found.' } });
  }
  if (!Array.isArray(descriptor) || descriptor.length < 32) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_DESCRIPTOR', message: 'Face descriptor is invalid.' } });
  }

  user.faceDescriptorEnc = encrypt(JSON.stringify(descriptor));
  user.faceRegisteredAt = new Date();
  user.mfaPreferences = {
    deviceTrust: Boolean(preferences.deviceTrust),
    magicLink: Boolean(preferences.magicLink),
    emailOtp: Boolean(preferences.emailOtp),
    backupCodes: Boolean(preferences.backupCodes)
  };

  let plainBackupCodes = [];
  if (user.mfaPreferences.backupCodes) {
    plainBackupCodes = generateBackupCodes();
    user.backupCodes = plainBackupCodes.map((c) => ({ codeHash: hash(c) }));
  }

  await user.save();
  await sendBackupCodesEmail(user, plainBackupCodes);

  const { token } = issueToken({
    sub: user._id.toString(),
    iss: 'authify',
    aud: user.applicationId.toString(),
    cid: user.companyId.toString(),
    typ: 'user'
  }, env.DEFAULT_JWT_EXPIRY);

  return success(res, {
    faceRegistered: true,
    backupCodes: plainBackupCodes,
    token,
    user: {
      id: user._id.toString(),
      email: user.email || user.identifier,
      displayName: user.displayName || user.identifier
    }
  });
};

const loginPassword = async (req, res) => {
  const { email, password } = req.body;
  const identifier = email.toLowerCase().trim();
  const user = await User.findOne({ identifier, applicationId: req.applicationId, companyId: req.companyId });
  if (!user || !user.passwordHash) {
    return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials.' } });
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    await appendLog({
      companyId: user.companyId,
      userId: user._id,
      applicationId: user.applicationId,
      eventType: 'login_failed',
      result: 'failure',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials.' } });
  }
  if (!user.faceDescriptorEnc) {
    const { token: enrollmentToken } = issueToken({
      sub: user._id.toString(),
      iss: 'authify',
      aud: user.applicationId.toString(),
      cid: user.companyId.toString(),
      typ: 'user'
    }, 600);

    return success(res, {
      requiresFaceEnrollment: true,
      enrollmentToken,
      user: {
        id: user._id.toString(),
        email: user.email || user.identifier,
        displayName: user.displayName || user.identifier
      }
    });
  }

  const sessionId = await createSession(user);
  return success(res, {
    sessionId,
    requiresFace: true,
    preferences: user.mfaPreferences || {}
  });
};

const verifyFace = async (req, res) => {
  const { sessionId, descriptor, deviceToken } = req.body;
  const payload = await getUserFromSession(sessionId);
  if (!payload) {
    return res.status(400).json({ success: false, error: { code: 'SESSION_EXPIRED', message: 'Session expired.' } });
  }
  const { session, user } = payload;
  const storedDescriptor = JSON.parse(decrypt(user.faceDescriptorEnc) || '[]');
  const match = compareFace(storedDescriptor, descriptor);
  if (!match) {
    await appendLog({
      companyId: user.companyId,
      userId: user._id,
      applicationId: user.applicationId,
      eventType: 'login_failed',
      result: 'failure',
      details: { reason: 'face_mismatch' },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    return res.status(401).json({ success: false, error: { code: 'FACE_MISMATCH', message: 'Face verification failed.' } });
  }

  session.metadata.stage = 'face';

  let trusted = false;
  if (deviceToken && user.mfaPreferences?.deviceTrust) {
    const tokenHash = hash(deviceToken);
    const device = await DeviceTrust.findOne({ userId: user._id, tokenHash, expiresAt: { $gt: new Date() } });
    if (device) {
      trusted = true;
      device.lastUsedAt = new Date();
      await device.save();
    }
  }

  if (!user.mfaPreferences || (!user.mfaPreferences.magicLink && !user.mfaPreferences.emailOtp && !user.mfaPreferences.backupCodes) || trusted) {
    await consume(session._id);
    const { token } = issueToken({
      sub: user._id.toString(),
      iss: 'authify',
      aud: user.applicationId.toString(),
      cid: user.companyId.toString(),
      typ: 'user'
    }, env.DEFAULT_JWT_EXPIRY);

    return success(res, {
      token,
      user: {
        id: user._id.toString(),
        email: user.email || user.identifier,
        displayName: user.displayName || user.identifier
      }
    });
  }

  await session.save();
  return success(res, { requiresOptional: true, sessionId, preferences: user.mfaPreferences });
};

const sendEmailOtp = async (req, res) => {
  const { sessionId } = req.body;
  const payload = await getUserFromSession(sessionId);
  if (!payload) return res.status(400).json({ success: false, error: { code: 'SESSION_EXPIRED', message: 'Session expired.' } });
  const { session, user } = payload;
  if (!user.mfaPreferences?.emailOtp) {
    return res.status(400).json({ success: false, error: { code: 'OTP_DISABLED', message: 'Email OTP not enabled.' } });
  }
  const code = String(Math.floor(100000 + Math.random() * 900000));
  session.metadata.emailOtpHash = hash(code);
  session.metadata.emailOtpExpiresAt = new Date(Date.now() + env.EMAIL_OTP_TTL_SECONDS * 1000);
  await session.save();

  await sendEmail({
    to: user.email || user.identifier,
    subject: 'Your Authify verification code',
    text: `Your Authify verification code is ${code}. It expires in ${env.EMAIL_OTP_TTL_SECONDS / 60} minutes.`,
    html: `<p>Your Authify verification code is <strong>${code}</strong>.</p><p>It expires in ${env.EMAIL_OTP_TTL_SECONDS / 60} minutes.</p>`
  });

  return success(res, { sent: true });
};

const verifyEmailOtp = async (req, res) => {
  const { sessionId, code } = req.body;
  const payload = await getUserFromSession(sessionId);
  if (!payload) return res.status(400).json({ success: false, error: { code: 'SESSION_EXPIRED', message: 'Session expired.' } });
  const { session } = payload;
  if (!session.metadata.emailOtpHash || !session.metadata.emailOtpExpiresAt) {
    return res.status(400).json({ success: false, error: { code: 'OTP_NOT_SENT', message: 'OTP not requested.' } });
  }
  if (new Date(session.metadata.emailOtpExpiresAt) < new Date()) {
    return res.status(400).json({ success: false, error: { code: 'OTP_EXPIRED', message: 'OTP expired.' } });
  }
  if (hash(code) !== session.metadata.emailOtpHash) {
    await appendLog({
      companyId: payload.user.companyId,
      userId: payload.user._id,
      applicationId: payload.user.applicationId,
      eventType: 'login_failed',
      result: 'failure',
      details: { reason: 'email_otp_invalid' },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    return res.status(401).json({ success: false, error: { code: 'OTP_INVALID', message: 'Invalid code.' } });
  }
  session.metadata.optionalVerified = true;
  await session.save();
  await appendLog({
    companyId: payload.user.companyId,
    userId: payload.user._id,
    applicationId: payload.user.applicationId,
    eventType: 'login',
    result: 'success',
    details: { factor: 'email_otp' },
    ipAddress: req.ip,
    userAgent: req.get('user-agent')
  });
  return success(res, { verified: true });
};

const requestMagicLink = async (req, res) => {
  const { sessionId } = req.body;
  const payload = await getUserFromSession(sessionId);
  if (!payload) return res.status(400).json({ success: false, error: { code: 'SESSION_EXPIRED', message: 'Session expired.' } });
  const { session, user } = payload;
  if (!user.mfaPreferences?.magicLink) {
    return res.status(400).json({ success: false, error: { code: 'MAGIC_DISABLED', message: 'Magic link not enabled.' } });
  }
  const token = crypto.randomBytes(32).toString('base64url');
  await storeSession('magic_link', token, token, { sessionId, userId: user._id.toString() }, env.MAGIC_LINK_TTL_SECONDS);

  const link = `${env.FRONTEND_BASE_URL}/login?magic=${token}`;
  await sendEmail({
    to: user.email || user.identifier,
    subject: 'Your Authify magic link',
    text: `Use this link to finish signing in: ${link}`,
    html: `<p>Use this link to finish signing in:</p><p><a href="${link}">${link}</a></p>`
  });

  return success(res, { sent: true });
};

const verifyMagicLink = async (req, res) => {
  const { token } = req.query;
  const doc = await retrieveSession(token, 'magic_link');
  if (!doc) {
    return res.status(400).json({ success: false, error: { code: 'MAGIC_INVALID', message: 'Magic link expired.' } });
  }
  const sessionId = doc.metadata.sessionId;
  const session = await retrieveSession(sessionId, 'mfa');
  if (!session) {
    return res.status(400).json({ success: false, error: { code: 'SESSION_EXPIRED', message: 'Session expired.' } });
  }
  session.metadata.optionalVerified = true;
  await session.save();
  await consume(doc._id);

  return success(res, { verified: true, sessionId });
};

const verifyBackupCode = async (req, res) => {
  const { sessionId, code } = req.body;
  const payload = await getUserFromSession(sessionId);
  if (!payload) return res.status(400).json({ success: false, error: { code: 'SESSION_EXPIRED', message: 'Session expired.' } });
  const { session, user } = payload;
  if (!user.mfaPreferences?.backupCodes) {
    return res.status(400).json({ success: false, error: { code: 'BACKUP_DISABLED', message: 'Backup codes not enabled.' } });
  }
  const codeHash = hash(String(code).trim().toUpperCase());
  const entry = user.backupCodes.find((c) => c.codeHash === codeHash && !c.usedAt);
  if (!entry) {
    await appendLog({
      companyId: payload.user.companyId,
      userId: payload.user._id,
      applicationId: payload.user.applicationId,
      eventType: 'login_failed',
      result: 'failure',
      details: { reason: 'backup_code_invalid' },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    return res.status(401).json({ success: false, error: { code: 'INVALID_CODE', message: 'Invalid backup code.' } });
  }
  entry.usedAt = new Date();
  await user.save();
  session.metadata.optionalVerified = true;
  await session.save();
  await appendLog({
    companyId: user.companyId,
    userId: user._id,
    applicationId: user.applicationId,
    eventType: 'login',
    result: 'success',
    details: { factor: 'backup_code' },
    ipAddress: req.ip,
    userAgent: req.get('user-agent')
  });
  return success(res, { verified: true });
};

const completeLogin = async (req, res) => {
  const { sessionId, trustDevice } = req.body;
  const payload = await getUserFromSession(sessionId);
  if (!payload) return res.status(400).json({ success: false, error: { code: 'SESSION_EXPIRED', message: 'Session expired.' } });
  const { session, user } = payload;
  if (session.metadata.stage !== 'face') {
    return res.status(400).json({ success: false, error: { code: 'FACE_REQUIRED', message: 'Face verification required.' } });
  }
  const needsOptional = user.mfaPreferences?.magicLink || user.mfaPreferences?.emailOtp || user.mfaPreferences?.backupCodes;
  if (needsOptional && !session.metadata.optionalVerified) {
    return res.status(400).json({ success: false, error: { code: 'OPTIONAL_REQUIRED', message: 'Optional factor required.' } });
  }

  let deviceToken = null;
  if (trustDevice && user.mfaPreferences?.deviceTrust) {
    deviceToken = crypto.randomBytes(32).toString('base64url');
    await DeviceTrust.create({
      userId: user._id,
      companyId: user.companyId,
      tokenHash: hash(deviceToken),
      label: req.body.deviceLabel || 'Trusted device',
      userAgent: req.get('user-agent'),
      ipAddress: req.ip,
      expiresAt: new Date(Date.now() + env.DEVICE_TRUST_TTL_DAYS * 24 * 60 * 60 * 1000)
    });
  }

  await consume(session._id);

  const { token } = issueToken({
    sub: user._id.toString(),
    iss: 'authify',
    aud: user.applicationId.toString(),
    cid: user.companyId.toString(),
    typ: 'user'
  }, env.DEFAULT_JWT_EXPIRY);

  return success(res, {
    token,
    deviceToken,
    user: {
      id: user._id.toString(),
      email: user.email || user.identifier,
      displayName: user.displayName || user.identifier
    }
  });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const identifier = email.toLowerCase().trim();
  const user = await User.findOne({ identifier, companyId: req.companyId, applicationId: req.applicationId });
  if (!user) return success(res, { sent: true });

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const token = crypto.randomBytes(24).toString('base64url');
  await storeSession('password_reset', token, token, {
    userId: user._id.toString(),
    codeHash: hash(code)
  }, env.EMAIL_OTP_TTL_SECONDS);

  await sendEmail({
    to: user.email || user.identifier,
    subject: 'Authify password reset',
    text: `Your reset code is ${code}. It expires in ${env.EMAIL_OTP_TTL_SECONDS / 60} minutes.`,
    html: `<p>Your reset code is <strong>${code}</strong>.</p>`
  });

  return success(res, { sent: true, resetToken: token });
};

const resetPassword = async (req, res) => {
  const { resetToken, code, newPassword } = req.body;
  const doc = await retrieveSession(resetToken, 'password_reset');
  if (!doc) {
    return res.status(400).json({ success: false, error: { code: 'RESET_EXPIRED', message: 'Reset token expired.' } });
  }
  if (hash(code) !== doc.metadata.codeHash) {
    return res.status(401).json({ success: false, error: { code: 'INVALID_CODE', message: 'Invalid reset code.' } });
  }
  const user = await User.findById(doc.metadata.userId);
  if (!user) return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found.' } });

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();
  await consume(doc._id);
  return success(res, { reset: true });
};

const getPreferences = async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found.' } });
  return success(res, { preferences: user.mfaPreferences || {} });
};

const updatePreferences = async (req, res) => {
  const { deviceTrust, magicLink, emailOtp, backupCodes } = req.body;
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found.' } });
  const wasBackupEnabled = Boolean(user.mfaPreferences?.backupCodes);
  user.mfaPreferences = {
    deviceTrust: Boolean(deviceTrust),
    magicLink: Boolean(magicLink),
    emailOtp: Boolean(emailOtp),
    backupCodes: Boolean(backupCodes)
  };
  let issuedCodes = [];
  if (user.mfaPreferences.backupCodes && (!user.backupCodes || user.backupCodes.length === 0 || !wasBackupEnabled)) {
    issuedCodes = generateBackupCodes();
    user.backupCodes = issuedCodes.map((c) => ({ codeHash: hash(c) }));
  }
  await user.save();
  await sendBackupCodesEmail(user, issuedCodes);
  return success(res, { preferences: user.mfaPreferences });
};

const getBackupCodes = async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found.' } });
  if (!user.mfaPreferences?.backupCodes) {
    return res.status(400).json({ success: false, error: { code: 'BACKUP_DISABLED', message: 'Backup codes not enabled.' } });
  }
  const codes = generateBackupCodes();
  user.backupCodes = codes.map((c) => ({ codeHash: hash(c) }));
  await user.save();
  return success(res, { backupCodes: codes });
};

module.exports = {
  registerUser,
  registerFace,
  loginPassword,
  verifyFace,
  sendEmailOtp,
  verifyEmailOtp,
  requestMagicLink,
  verifyMagicLink,
  verifyBackupCode,
  completeLogin,
  forgotPassword,
  resetPassword,
  getPreferences,
  updatePreferences,
  getBackupCodes
};
