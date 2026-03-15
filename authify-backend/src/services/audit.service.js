const AuditLog = require('../models/AuditLog');
const { computeAuditHash } = require('../utils/hashChain');
const { format } = require('fast-csv');

const appendLog = async (eventData) => {
  const { userId } = eventData;
  const lastLog = await AuditLog.findOne({ userId }).sort({ timestamp: -1 });
  const prevHash = lastLog ? lastLog.hash : 'GENESIS';
  const timestamp = eventData.timestamp || new Date();
  const hash = computeAuditHash({
    prevHash,
    eventType: eventData.eventType,
    userId: userId ? userId.toString() : '',
    timestamp: timestamp.toISOString(),
    details: eventData.details || {}
  });

  const log = await AuditLog.create({
    ...eventData,
    timestamp,
    prevHash,
    hash
  });

  return log;
};

const verifyChain = async (companyId, userId) => {
  const query = { companyId };
  if (userId) query.userId = userId;

  const logs = await AuditLog.find(query).sort({ timestamp: 1 });
  const prevHashByUser = new Map();

  for (const log of logs) {
    const userKey = log.userId?.toString() || 'SYSTEM';
    const prevHash = prevHashByUser.get(userKey) || 'GENESIS';

    const expected = computeAuditHash({
      prevHash,
      eventType: log.eventType,
      userId: log.userId?.toString() || '',
      timestamp: log.timestamp.toISOString(),
      details: log.details || {}
    });

    if (expected !== log.hash) {
      return { valid: false, brokenAt: log._id };
    }

    prevHashByUser.set(userKey, log.hash);
  }

  return { valid: true };
};

const exportToCsv = async (query, res) => {
  const cursor = AuditLog.find(query).cursor();
  const csvStream = format({ headers: true });
  csvStream.pipe(res);

  for await (const log of cursor) {
    csvStream.write({
      id: log._id.toString(),
      companyId: log.companyId?.toString(),
      userId: log.userId?.toString(),
      applicationId: log.applicationId?.toString(),
      eventType: log.eventType,
      timestamp: log.timestamp.toISOString(),
      result: log.result,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      prevHash: log.prevHash,
      hash: log.hash,
      details: JSON.stringify(log.details || {})
    });
  }

  csvStream.end();
};

module.exports = { appendLog, verifyChain, exportToCsv };
