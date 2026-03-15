const ApiUsage = require('../models/ApiUsage');

const monthKey = () => {
  const now = new Date();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${now.getUTCFullYear()}-${month}`;
};

const enforceQuota = async (company) => {
  const month = monthKey();
  const usage = await ApiUsage.findOne({ companyId: company._id, month });
  const callCount = usage?.callCount || 0;
  if (callCount >= company.quotaLimit) {
    const err = new Error('Quota exceeded');
    err.code = 'QUOTA_EXCEEDED';
    throw err;
  }
};

const incrementUsage = async (companyId, category) => {
  const month = monthKey();
  const inc = { callCount: 1 };
  if (category) {
    inc[`breakdown.${category}`] = 1;
  }

  await ApiUsage.updateOne(
    { companyId, month },
    { $inc: inc, $setOnInsert: { month, companyId } },
    { upsert: true }
  );
};

module.exports = { monthKey, enforceQuota, incrementUsage };
