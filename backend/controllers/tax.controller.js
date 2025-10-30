const TaxFiling = require('../models/taxFiling.model.js');
const User = require('../models/user.model.js');
const CA = require('../models/ca.model.js');

// @desc    Start or update a tax filing
// @route   POST /api/tax/start-filing
// @access  Private
const startFiling = async (req, res) => {
    try {
        const { status } = req.body;
        
        // 1. Create and save the new tax filing
        const taxFiling = new TaxFiling({
            ...req.body,
            user: req.userId, // req.userId comes from your 'auth' middleware
        });

        // 2. Check if this is a "Save & Invite CA" submission
        if (status === 'pending_review') {
            // --- This is the new logic to connect user to CA ---
            
            // Find the user who is filing
            const user = await User.findById(req.userId);

            // Find an available CA.
            const availableCAs = await CA.find().sort({ clients: 1 }).limit(1);

            if (availableCAs && availableCAs.length > 0) {
                const assignedCA = availableCAs[0];
                taxFiling.caReview.ca = assignedCA._id;
                user.assignedCA = assignedCA._id;

                if (!assignedCA.clients.includes(user._id)) {
                    assignedCA.clients.push(user._id);
                    await assignedCA.save();
                }
                
                await user.save();
            }
            // --------------------------------------------------
        }
        
        // 3. Save the final tax filing
        const savedFiling = await taxFiling.save();

        // 4. Add this filing to the user's taxFilings array
        const user = await User.findById(req.userId);
        if (!user.taxFilings.includes(savedFiling._id)) {
            user.taxFilings.push(savedFiling._id);
            await user.save();
        }

        res.status(201).json(savedFiling);

    } catch (error) {
        console.error('Error starting filing:', error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Get all tax filings for the logged-in user
// @route   GET /api/tax/my-filings
// @access  Private
const getMyFilings = async (req, res) => {
    try {
        const filings = await TaxFiling.find({ user: req.userId })
            .populate('caReview.ca', 'name email') // Also get the assigned CA's info
            .sort({ createdAt: -1 });
            
        res.json(filings);
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Update an existing tax filing
// @route   PUT /api/tax/update-filing/:id
// @access  Private
const updateFiling = async (req, res) => {
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
};


// --- NEW FUNCTION ---
// @desc    Simulate the final e-filing submission
// @route   POST /api/tax/file/:filingId
// @access  Private
const fileReturn = async (req, res) => {
    try {
        const { filingId } = req.params;

        const filing = await TaxFiling.findOne({
            _id: filingId,
            user: req.userId
        });

        if (!filing) {
            return res.status(404).json({ message: 'Filing not found' });
        }

        // Only "approved" or "submitted" (by user) filings can be filed
        if (filing.status !== 'approved' && filing.status !== 'submitted') {
            return res.status(400).json({ message: `Filing must be in 'approved' or 'submitted' state to file. Current state: ${filing.status}` });
        }

        // 1. Generate a fake Acknowledgement Number
        const ackNumber = `ITD${new Date().getFullYear()}${(Math.random() * 10e12).toString().slice(0, 12)}`;

        // 2. Update the filing document
        filing.status = 'filed';
        filing.filedAt = new Date();
        filing.acknowledgementNumber = ackNumber;
        
        await filing.save();

        // 3. Send back the updated filing
        res.json({
            message: 'ITR Filed Successfully!',
            filing: filing
        });

    } catch (error) {
        console.error('Filing Error:', error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

module.exports = {
    startFiling,
    getMyFilings,
    updateFiling,
    fileReturn // 1. Add new function here
};