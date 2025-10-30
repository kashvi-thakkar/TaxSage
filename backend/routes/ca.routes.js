const express = require('express');
const router = express.Router();
const { authCA } = require('../middleware/auth.js');

// Import the new controller functions
const { 
    getDashboard, 
    getClients,
    getFilingForReview,
    addComment,
    resolveComment, // Import new
    approveFiling   // Import new
} = require('../controllers/ca.controller.js');

// @route   GET /api/ca/dashboard
// @desc    Get CA dashboard stats
// @access  Private (CA)
router.get('/dashboard', authCA, getDashboard);

// @route   GET /api/ca/clients
// @desc    Get all clients for the logged-in CA
// @access  Private (CA)
router.get('/clients', authCA, getClients);

// @route   GET /api/ca/review/:filingId
// @desc    Get a specific filing for the logged-in CA to review
// @access  Private (CA)
router.get('/review/:filingId', authCA, getFilingForReview);

// @route   POST /api/ca/comment/:filingId
// @desc    Add a comment to a tax filing
// @access  Private (CA)
router.post('/comment/:filingId', authCA, addComment);

// @route   PUT /api/ca/comment/resolve/:filingId/:commentId
// @desc    Resolve a comment on a tax filing
// @access  Private (CA)
router.put('/comment/resolve/:filingId/:commentId', authCA, resolveComment);

// @route   PUT /api/ca/approve/:filingId
// @desc    Approve a tax filing
// @access  Private (CA)
router.put('/approve/:filingId', authCA, approveFiling);

module.exports = router;