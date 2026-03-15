const AuditLog = require('../models/AuditLog');
const { verifyChain, exportToCsv } = require('../services/audit.service');
const { success } = require('../utils/responseHelper');

const listLogs = async (req, res) => {
  const { userId, eventType, from, to, page = 1, limit = 50 } = req.query;
  const query = { companyId: req.companyId };
  if (userId) query.userId = userId;
  if (eventType) query.eventType = eventType;
  if (from || to) query.timestamp = {};
  if (from) query.timestamp.$gte = new Date(from);
  if (to) query.timestamp.$lte = new Date(to);

  const logs = await AuditLog.find(query)
    .sort({ timestamp: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  return success(res, { items: logs, page: Number(page), limit: Number(limit) });
};

const verifyLogs = async (req, res) => {
  const { userId } = req.query;
  const result = await verifyChain(req.companyId, userId);
  if (!result.valid) {
    return res.status(400).json({ success: false, error: { code: 'CHAIN_TAMPERED', message: 'Hash chain invalid', brokenAt: result.brokenAt } });
  }
  return success(res, result);
};

const exportLogs = async (req, res) => {
  const { format = 'json', userId, from, to } = req.query;
  const query = { companyId: req.companyId };
  if (userId) query.userId = userId;
  if (from || to) query.timestamp = {};
  if (from) query.timestamp.$gte = new Date(from);
  if (to) query.timestamp.$lte = new Date(to);

  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    return exportToCsv(query, res);
  }

  const logs = await AuditLog.find(query).sort({ timestamp: -1 });
  return success(res, logs);
};

module.exports = { listLogs, verifyLogs, exportLogs };
