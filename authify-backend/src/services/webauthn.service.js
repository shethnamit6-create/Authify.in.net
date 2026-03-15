const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse
} = require('@simplewebauthn/server');
const { isoBase64URL } = require('@simplewebauthn/server/helpers');
const { env } = require('../config/env');

const normalizeToBuffer = (value) => {
  if (!value) return Buffer.alloc(0);
  if (Buffer.isBuffer(value)) return value;
  if (value instanceof ArrayBuffer) return Buffer.from(new Uint8Array(value));
  if (ArrayBuffer.isView(value)) return Buffer.from(new Uint8Array(value.buffer));
  if (typeof value === 'string') return isoBase64URL.toBuffer(value);
  if (value.type === 'Buffer' && Array.isArray(value.data)) return Buffer.from(value.data);
  if (Array.isArray(value)) return Buffer.from(value);
  return Buffer.alloc(0);
};

const registrationOptions = async ({ user, application, credentials, rpID }) => {
  const opts = generateRegistrationOptions({
    rpName: env.RP_NAME,
    rpID: rpID || env.RP_ID,
    userID: new Uint8Array(Buffer.from(user._id.toString())),
    userName: user.identifier,
    userDisplayName: user.displayName || user.identifier,
    attestationType: 'none',
    authenticatorSelection: {
      userVerification: 'required'
    },
    excludeCredentials: credentials.map((cred) => ({
      id: String(cred.credentialId),
      type: 'public-key'
    }))
  });

  return opts;
};

const verifyRegistration = async ({ response, expectedChallenge, origin, rpID }) => {
  return verifyRegistrationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID || env.RP_ID,
    requireUserVerification: true
  });
};

const authenticationOptions = async ({ credentials, rpID }) => {
  return generateAuthenticationOptions({
    rpID: rpID || env.RP_ID,
    userVerification: 'required',
    allowCredentials: credentials.map((cred) => ({
      id: String(cred.credentialId),
      type: 'public-key',
      transports: cred.transports || []
    }))
  });
};

const verifyAuthentication = async ({ response, expectedChallenge, origin, credential, rpID }) => {
  return verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID || env.RP_ID,
    authenticator: {
      credentialID: normalizeToBuffer(credential.credentialId),
      credentialPublicKey: normalizeToBuffer(credential.publicKey),
      counter: credential.counter,
      transports: credential.transports || []
    },
    requireUserVerification: true
  });
};

module.exports = {
  registrationOptions,
  verifyRegistration,
  authenticationOptions,
  verifyAuthentication
};
