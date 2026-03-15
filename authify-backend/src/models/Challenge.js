const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  type: { type: String, enum: ['registration', 'authentication', 'crossdevice', 'recovery'], required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sessionId: { type: String },
  challenge: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  metadata: { type: Object, default: {} }
});

challengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Challenge', challengeSchema);
