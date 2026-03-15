const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  apiKeyHash: { type: String },
  apiKeyPrefix: { type: String },
  plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
  quotaLimit: { type: Number, default: 10000 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Company', companySchema);
