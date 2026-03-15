const express = require('express');
const { z } = require('zod');
const { validateRequest } = require('../middleware/validateRequest');
const { asyncHandler } = require('../middleware/errorHandler');
const { jwtAuth } = require('../middleware/jwtAuth');
const { listLogs, verifyLogs, exportLogs } = require('../controllers/audit.controller');

const router = express.Router();

/**
 * GET /api/v1/audit/logs
 */
router.get(
  '/logs',
  jwtAuth('company'),
  validateRequest(
    z.object({
      query: z.object({
        userId: z.string().optional(),
        eventType: z.string().optional(),
        from: z.string().optional(),
        to: z.string().optional(),
        page: z.string().optional(),
        limit: z.string().optional()
      })
    })
  ),
  asyncHandler(listLogs)
);

/**
 * GET /api/v1/audit/logs/verify
 */
router.get(
  '/logs/verify',
  jwtAuth('company'),
  asyncHandler(verifyLogs)
);

/**
 * GET /api/v1/audit/export
 */
router.get(
  '/export',
  jwtAuth('company'),
  asyncHandler(exportLogs)
);

module.exports = router;
