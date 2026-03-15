const express = require('express');
const { z } = require('zod');
const { validateRequest } = require('../middleware/validateRequest');
const { asyncHandler } = require('../middleware/errorHandler');
const { jwtAuth } = require('../middleware/jwtAuth');
const { registerCompany, loginCompany, rotateApiKey } = require('../controllers/company.controller');

const router = express.Router();

/**
 * POST /api/v1/company/register
 */
router.post(
  '/register',
  validateRequest(
    z.object({
      body: z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(8),
        plan: z.enum(['free', 'pro', 'enterprise']).optional()
      })
    })
  ),
  asyncHandler(registerCompany)
);

/**
 * POST /api/v1/company/login
 */
router.post(
  '/login',
  validateRequest(
    z.object({
      body: z.object({
        email: z.string().email(),
        password: z.string().min(8)
      })
    })
  ),
  asyncHandler(loginCompany)
);

/**
 * POST /api/v1/company/apikey/rotate
 */
router.post(
  '/apikey/rotate',
  jwtAuth('company'),
  asyncHandler(rotateApiKey)
);

module.exports = router;
