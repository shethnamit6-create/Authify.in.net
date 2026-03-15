const express = require('express');
const { z } = require('zod');
const { validateRequest } = require('../middleware/validateRequest');
const { asyncHandler } = require('../middleware/errorHandler');
const { jwtAuth } = require('../middleware/jwtAuth');
const { createApplication, listApplications, updateApplication, deleteApplication } = require('../controllers/application.controller');

const router = express.Router();

/**
 * POST /api/v1/applications
 */
router.post(
  '/',
  jwtAuth('company'),
  validateRequest(
    z.object({
      body: z.object({
        name: z.string().min(1),
        redirectUris: z.array(z.string().url()).optional(),
        allowedOrigins: z.array(z.string()).optional()
      })
    })
  ),
  asyncHandler(createApplication)
);

/**
 * GET /api/v1/applications
 */
router.get('/', jwtAuth('company'), asyncHandler(listApplications));

/**
 * PATCH /api/v1/applications/:appId
 */
router.patch(
  '/:appId',
  jwtAuth('company'),
  validateRequest(
    z.object({
      params: z.object({ appId: z.string().min(1) }),
      body: z.object({
        redirectUris: z.array(z.string().url()).optional(),
        allowedOrigins: z.array(z.string()).optional()
      })
    })
  ),
  asyncHandler(updateApplication)
);

/**
 * DELETE /api/v1/applications/:appId
 */
router.delete(
  '/:appId',
  jwtAuth('company'),
  validateRequest(z.object({ params: z.object({ appId: z.string().min(1) }) })),
  asyncHandler(deleteApplication)
);

module.exports = router;
