const mongoose = require('mongoose');
const ApiUsage = require('../models/ApiUsage');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { monthKey } = require('../services/usage.service');
const { success } = require('../utils/responseHelper');

const usage = async (req, res) => {
  const month = monthKey();
  const usageDoc = await ApiUsage.findOne({ companyId: req.companyId, month });
  return success(res, usageDoc || { month, callCount: 0, breakdown: {} });
};

const stats = async (req, res) => {
  const successCount = await AuditLog.countDocuments({ companyId: req.companyId, result: 'success' });
  const failureCount = await AuditLog.countDocuments({ companyId: req.companyId, result: 'failure' });
  const companyObjectId = new mongoose.Types.ObjectId(req.companyId);
  const byEvent = await AuditLog.aggregate([
    { $match: { companyId: companyObjectId } },
    { $group: { _id: '$eventType', count: { $sum: 1 } } }
  ]);

  return success(res, { successCount, failureCount, byEvent });
};

const users = async (req, res) => {
  const { page = 1, limit = 50, applicationId } = req.query;
  const query = { companyId: req.companyId };
  if (applicationId) query.applicationId = applicationId;

  const items = await User.find(query)
    .sort({ registeredAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  return success(res, { items, page: Number(page), limit: Number(limit) });
};

module.exports = { usage, stats, users };
