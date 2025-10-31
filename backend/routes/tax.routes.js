const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth.js'); 

// Import the new controller functions
const {
    startFiling,
    getMyFilings,
    updateFiling,
    fileReturn
} = require('../controllers/tax.controller.js');

// @route   POST /api/tax/start-filing
// @desc    Start or update a new tax filing (and assign CA if needed)
// @access  Private
router.post('/start-filing', auth, startFiling);

// @route   GET /api/tax/my-filings
// @desc    Get user's tax filings
// @access  Private
router.get('/my-filings', auth, getMyFilings);

// @route   PUT /api/tax/update-filing/:id
// @desc    Update tax filing data
// @access  Private
router.put('/update-filing/:id', auth, updateFiling);

// @route   POST /api/tax/file/:filingId
// @desc    Simulate e-filing the ITR
// @access  Private
router.post('/file/:filingId', auth, fileReturn);

module.exports = router;