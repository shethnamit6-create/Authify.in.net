const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  name: { type: String, required: true },
  clientId: { type: String, required: true, unique: true },
  redirectUris: [{ type: String }],
  allowedOrigins: [{ type: String }],
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Application', applicationSchema);
