const express = require('express');
const { z } = require('zod');
const { validateRequest } = require('../middleware/validateRequest');
const { asyncHandler } = require('../middleware/errorHandler');
const { apiKeyAuth } = require('../middleware/apiKeyAuth');
const { registrationLimiter } = require('../middleware/rateLimiter');
const { usageTracker } = require('../middleware/usageTracker');
const { registerOptions, registerVerify } = require('../controllers/registration.controller');

const router = express.Router();

/**
 * POST /api/v1/register/options
 */
router.post(
  '/options',
  apiKeyAuth,
  registrationLimiter,
  usageTracker('registration'),
  validateRequest(
    z.object({
      body: z.object({
        identifier: z.string().min(1),
        displayName: z.string().optional(),
        applicationId: z.string().min(1),
        password: z.string().min(8),
        purpose: z.enum(['face', 'fingerprint', 'other']).optional()
      }),
      headers: z.object({ 'x-client-id': z.string().min(1) }).passthrough()
    })
  ),
  asyncHandler(registerOptions)
);

/**
 * POST /api/v1/register/verify
 */
router.post(
  '/verify',
  apiKeyAuth,
  registrationLimiter,
  usageTracker('registration'),
  validateRequest(
    z.object({
      body: z.object({
        identifier: z.string().min(1),
        applicationId: z.string().min(1),
        registrationResponse: z.any(),
        purpose: z.enum(['face', 'fingerprint', 'other']).optional()
      }),
      headers: z.object({ 'x-client-id': z.string().min(1) }).passthrough()
    })
  ),
  asyncHandler(registerVerify)
);

module.exports = router;
