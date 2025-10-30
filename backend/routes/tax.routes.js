const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const { auth } = require('../middleware/auth.js'); 

// Import the new controller functions
const {
    startFiling,
    getMyFilings,
    updateFiling,
    fileReturn // 1. Import new function
} = require('../controllers/tax.controller.js');

// @route   POST /api/tax/start-filing
// @desc    Start or update a new tax filing (and assign CA if needed)
// @access  Private
router.post('/start-filing', auth, startFiling);
=======
const TaxFiling = require('../models/taxFiling.model.js');
const auth = require('../middleware/auth.js');

// @route   POST /api/tax/start-filing
// @desc    Start a new tax filing
// @access  Private
router.post('/start-filing', auth, async (req, res) => {
    try {
        const { itrFormType } = req.body;
        
        const existingFiling = await TaxFiling.findOne({
            user: req.userId,
            assessmentYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
        });

        if (existingFiling) {
            return res.status(400).json({ message: 'Filing for this year already exists' });
        }

        const taxFiling = new TaxFiling({
            user: req.userId,
            itrFormType: itrFormType || 'ITR-1'
        });

        await taxFiling.save();
        res.status(201).json(taxFiling);
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});
>>>>>>> 5260d96fe97afffbc6bbfe8f645c3fd745f1d893

// @route   GET /api/tax/my-filings
// @desc    Get user's tax filings
// @access  Private
<<<<<<< HEAD
router.get('/my-filings', auth, getMyFilings);
=======
router.get('/my-filings', auth, async (req, res) => {
    try {
        const filings = await TaxFiling.find({ user: req.userId })
            .sort({ createdAt: -1 });
        res.json(filings);
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});
>>>>>>> 5260d96fe97afffbc6bbfe8f645c3fd745f1d893

// @route   PUT /api/tax/update-filing/:id
// @desc    Update tax filing data
// @access  Private
<<<<<<< HEAD
router.put('/update-filing/:id', auth, updateFiling);

// 2. Add new route
// @route   POST /api/tax/file/:filingId
// @desc    Simulate e-filing the ITR
// @access  Private
router.post('/file/:filingId', auth, fileReturn);

=======
router.put('/update-filing/:id', auth, async (req, res) => {
    try {
        const filing = await TaxFiling.findOne({
            _id: req.params.id,
            user: req.userId
        });

        if (!filing) {
            return res.status(404).json({ message: 'Filing not found' });
        }

        // Update filing data
        const updatedFiling = await TaxFiling.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        res.json(updatedFiling);
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});
>>>>>>> 5260d96fe97afffbc6bbfe8f645c3fd745f1d893

module.exports = router;