const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { env } = require('../config/env');
const Company = require('../models/Company');
const Application = require('../models/Application');
const User = require('../models/User');
const Credential = require('../models/Credential');
const { generateApiKey } = require('../utils/generateApiKey');

const run = async () => {
  await mongoose.connect(env.MONGO_URI);

  await Company.deleteMany({});
  await Application.deleteMany({});
  await User.deleteMany({});
  await Credential.deleteMany({});

  const passwordHash = await bcrypt.hash('Password123!', 12);
  const { apiKey, apiKeyHash, apiKeyPrefix } = generateApiKey();

  const company = await Company.create({
    name: 'Acme Corp',
    email: 'admin@acme.test',
    passwordHash,
    apiKeyHash,
    apiKeyPrefix,
    plan: 'pro',
    quotaLimit: 50000
  });

  const app = await Application.create({
    companyId: company._id,
    name: 'Acme HR',
    clientId: uuidv4(),
    redirectUris: ['https://acme.test/callback'],
    allowedOrigins: ['https://acme.test'],
    active: true
  });

  const user = await User.create({
    companyId: company._id,
    applicationId: app._id,
    identifier: 'jane.doe@acme.test',
    displayName: 'Jane Doe'
  });

  await Credential.create({
    userId: user._id,
    companyId: company._id,
    credentialId: 'seed-credential-id',
    publicKey: 'seed-public-key',
    counter: 1,
    deviceType: 'singleDevice',
    aaguid: '00000000-0000-0000-0000-000000000000',
    transports: ['internal']
  });

  // eslint-disable-next-line no-console
  console.log('Seeded data');
  // eslint-disable-next-line no-console
  console.log('Company API Key (store securely):', apiKey);
  // eslint-disable-next-line no-console
  console.log('App clientId:', app.clientId);

  await mongoose.disconnect();
};

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
