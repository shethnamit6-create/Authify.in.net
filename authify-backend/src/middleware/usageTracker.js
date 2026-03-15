const { incrementUsage, enforceQuota } = require('../services/usage.service');

const usageTracker = (category) => async (req, res, next) => {
  try {
    if (req.company) {
      await enforceQuota(req.company);
    }

    res.on('finish', async () => {
      if (res.statusCode < 400 && req.company) {
        await incrementUsage(req.company._id, category);
      }
    });

    next();
  } catch (err) {
    err.status = 429;
    err.code = 'QUOTA_EXCEEDED';
    next(err);
  }
};

module.exports = { usageTracker };
