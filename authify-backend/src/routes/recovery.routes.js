const express = require('express');
const { z } = require('zod');
const { validateRequest } = require('../middleware/validateRequest');
const { asyncHandler } = require('../middleware/errorHandler');
const { apiKeyAuth } = require('../middleware/apiKeyAuth');
const { jwtAuth } = require('../middleware/jwtAuth');
const { usageTracker } = require('../middleware/usageTracker');
const { recoveryRequest, recoveryAdminVerify, recoveryComplete } = require('../controllers/recovery.controller');

const router = express.Router();

/**
 * POST /api/v1/recovery/request
 */
router.post(
  '/request',
  apiKeyAuth,
  usageTracker('recovery'),
  validateRequest(
    z.object({
      body: z.object({
        identifier: z.string().min(1),
        applicationId: z.string().min(1)
      }),
      headers: z.object({ 'x-client-id': z.string().min(1) }).passthrough()
    })
  ),
  asyncHandler(recoveryRequest)
);

/**
 * POST /api/v1/recovery/admin/verify/:requestId
 */
router.post(
  '/admin/verify/:requestId',
  jwtAuth('company'),
  usageTracker('recovery'),
  validateRequest(z.object({ params: z.object({ requestId: z.string().min(1) }) })),
  asyncHandler(recoveryAdminVerify)
);

/**
 * POST /api/v1/recovery/complete
 */
router.post(
  '/complete',
  apiKeyAuth,
  usageTracker('recovery'),
  validateRequest(
    z.object({
      body: z.object({
        recoveryRequestId: z.string().min(1),
        registrationResponse: z.any()
      })
    })
  ),
  asyncHandler(recoveryComplete)
);

module.exports = router;
