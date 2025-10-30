const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth.js');
// Import your real controllers
const { 
    compareRegimes, 
    getDeductionRecommendations, 
    chatWithAssistant 
} = require('../controllers/ai.controller.js');

// Use the real controller functions
router.post('/compare-regimes', auth, compareRegimes);
router.post('/deduction-recommendations', auth, getDeductionRecommendations);
router.post('/chat', auth, chatWithAssistant);

module.exports = router;