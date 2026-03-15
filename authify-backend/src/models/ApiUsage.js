const mongoose = require('mongoose');

const apiUsageSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  month: { type: String, required: true },
  callCount: { type: Number, default: 0 },
  breakdown: {
    registration: { type: Number, default: 0 },
    authentication: { type: Number, default: 0 },
    recovery: { type: Number, default: 0 },
    audit: { type: Number, default: 0 }
  }
});

apiUsageSchema.index({ companyId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('ApiUsage', apiUsageSchema);
