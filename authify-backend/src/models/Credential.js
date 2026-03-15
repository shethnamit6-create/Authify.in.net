const mongoose = require('mongoose');

const credentialSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  credentialId: { type: String, required: true, unique: true },
  publicKey: { type: String, required: true },
  counter: { type: Number, default: 0 },
  deviceType: { type: String },
  aaguid: { type: String },
  transports: [{ type: String }],
  purpose: { type: String, enum: ['face', 'fingerprint', 'other'], default: 'face' },
  createdAt: { type: Date, default: Date.now },
  revokedAt: { type: Date }
});

module.exports = mongoose.model('Credential', credentialSchema);
