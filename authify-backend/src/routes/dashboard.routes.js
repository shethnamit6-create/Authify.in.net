const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const { jwtAuth } = require('../middleware/jwtAuth');
const { usage, stats, users } = require('../controllers/dashboard.controller');

const router = express.Router();

/**
 * GET /api/v1/dashboard/usage
 */
router.get('/usage', jwtAuth('company'), asyncHandler(usage));

/**
 * GET /api/v1/dashboard/stats
 */
router.get('/stats', jwtAuth('company'), asyncHandler(stats));

/**
 * GET /api/v1/dashboard/users
 */
router.get('/users', jwtAuth('company'), asyncHandler(users));

module.exports = router;
