const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth.js');
const { getAnalytics } = require('../controllers/analytics.controller.js');

// @route   GET /api/analytics
// @desc    Get all analytics data for the logged-in user
// @access  Private
router.get('/', auth, getAnalytics);

module.exports = router;