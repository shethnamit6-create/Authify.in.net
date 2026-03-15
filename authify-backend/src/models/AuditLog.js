const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
  eventType: {
    type: String,
    enum: [
      'registration',
      'login',
      'login_failed',
      'recovery_requested',
      'recovery_completed',
      'key_revoked',
      'crossdevice_login',
      'api_key_generated'
    ],
    required: true
  },
  deviceInfo: { type: Object, default: {} },
  ipAddress: { type: String },
  userAgent: { type: String },
  timestamp: { type: Date, default: Date.now },
  result: { type: String, enum: ['success', 'failure'], required: true },
  details: { type: Object, default: {} },
  hash: { type: String, required: true },
  prevHash: { type: String, required: true }
});

auditLogSchema.index({ userId: 1, eventType: 1 });

auditLogSchema.index({ companyId: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
