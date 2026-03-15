const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
  identifier: { type: String, required: true },
  displayName: { type: String },
  passwordHash: { type: String },
  status: { type: String, enum: ['active', 'suspended', 'pending_recovery'], default: 'active' },
  registeredAt: { type: Date, default: Date.now },
  lastLoginAt: { type: Date }
});

userSchema.index({ companyId: 1, applicationId: 1, identifier: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
