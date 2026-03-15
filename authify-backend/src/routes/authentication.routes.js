const express = require('express');
const { z } = require('zod');
const { validateRequest } = require('../middleware/validateRequest');
const { asyncHandler } = require('../middleware/errorHandler');
const { apiKeyAuth } = require('../middleware/apiKeyAuth');
const { authLimiter } = require('../middleware/rateLimiter');
const { usageTracker } = require('../middleware/usageTracker');
const {
  authOptions,
  authVerify,
  crossDeviceInit,
  crossDeviceStatus,
  crossDeviceVerify
} = require('../controllers/authentication.controller');

const router = express.Router();

/**
 * POST /api/v1/auth/options
 */
router.post(
  '/options',
  apiKeyAuth,
  authLimiter,
  usageTracker('authentication'),
  validateRequest(
    z.object({
      body: z.object({
        identifier: z.string().min(1),
        applicationId: z.string().min(1),
        password: z.string().min(8),
        purpose: z.enum(['face', 'fingerprint', 'other']).optional()
      }),
      headers: z.object({ 'x-client-id': z.string().min(1) }).passthrough()
    })
  ),
  asyncHandler(authOptions)
);

/**
 * POST /api/v1/auth/verify
 */
router.post(
  '/verify',
  apiKeyAuth,
  authLimiter,
  usageTracker('authentication'),
  validateRequest(
    z.object({
      body: z.object({
        identifier: z.string().min(1),
        applicationId: z.string().min(1),
        authenticationResponse: z.any(),
        purpose: z.enum(['face', 'fingerprint', 'other']).optional()
      }),
      headers: z.object({ 'x-client-id': z.string().min(1) }).passthrough()
    })
  ),
  asyncHandler(authVerify)
);

/**
 * POST /api/v1/auth/crossdevice/init
 */
router.post(
  '/crossdevice/init',
  apiKeyAuth,
  authLimiter,
  usageTracker('authentication'),
  validateRequest(
    z.object({
      body: z.object({
        applicationId: z.string().optional(),
        identifier: z.string().optional()
      }).passthrough(),
      headers: z.object({ 'x-client-id': z.string().optional() }).passthrough()
    })
  ),
  asyncHandler(crossDeviceInit)
);

/**
 * GET /api/v1/auth/crossdevice/status/:sessionId
 */
router.get(
  '/crossdevice/status/:sessionId',
  apiKeyAuth,
  authLimiter,
  usageTracker('authentication'),
  validateRequest(z.object({ params: z.object({ sessionId: z.string().min(1) }) })),
  asyncHandler(crossDeviceStatus)
);

/**
 * POST /api/v1/auth/crossdevice/verify
 */
router.post(
  '/crossdevice/verify',
  apiKeyAuth,
  authLimiter,
  usageTracker('authentication'),
  validateRequest(
    z.object({
      body: z.object({
        sessionId: z.string().min(1),
        authenticationResponse: z.any()
      })
    })
  ),
  asyncHandler(crossDeviceVerify)
);

module.exports = router;
