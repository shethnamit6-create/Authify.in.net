const mongoose = require('mongoose');

const recoveryRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  requestedAt: { type: Date, default: Date.now },
  verifiedAt: { type: Date },
  completedAt: { type: Date },
  verificationMethod: { type: String, enum: ['admin', 'secondary_device'] },
  status: { type: String, enum: ['pending', 'verified', 'completed', 'rejected'], default: 'pending' },
  newCredentialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Credential' }
});

module.exports = mongoose.model('RecoveryRequest', recoveryRequestSchema);
