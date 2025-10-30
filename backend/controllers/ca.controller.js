const CA = require('../models/ca.model.js');
const User = require('../models/user.model.js');
const TaxFiling = require('../models/taxFiling.model.js');

// @desc    Get a CA's dashboard overview
// @route   GET /api/ca/dashboard
// @access  Private (CA)
const getDashboard = async (req, res) => {
    try {
        // req.caId is from 'authCA' middleware
        const ca = await CA.findById(req.caId).populate('clients', 'name email');

        if (!ca) {
            return res.status(404).json({ message: 'CA not found' });
        }

        // Get all filings assigned to this CA
        const filings = await TaxFiling.find({ 'caReview.ca': req.caId });

        const pendingReviews = filings.filter(f => f.status === 'pending_review').length;
        const completedFilings = filings.filter(f => f.status === 'filed' || f.status === 'approved').length;
        
        // Get the actual filing documents for pending reviews
        const pendingReviewFilings = await TaxFiling.find({ 'caReview.ca': req.caId, status: 'pending_review' })
                                  .populate('user', 'firstName lastName email pan') // Populate user details
                                  .sort({ createdAt: -1 })
                                  .limit(5);

        res.json({
            ca: {
                name: ca.name,
                email: ca.email,
            },
            stats: {
                totalClients: ca.clients.length,
                pendingReviews: pendingReviews,
                completedFilings: completedFilings,
                revenue: completedFilings * 1000, 
            },
            pendingReviews: pendingReviewFilings // Send the populated filings
        });

    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Get all clients assigned to a CA
// @route   GET /api/ca/clients
// @access  Private (CA)
const getClients = async (req, res) => {
    try {
        // Find the CA and populate their client list with user details
        const ca = await CA.findById(req.caId)
            .populate('clients', 'firstName lastName email pan phone'); // Added phone

        if (!ca) {
            return res.status(404).json({ message: 'CA not found' });
        }

        // The 'ca.clients' array now contains full user objects
        const clientsWithDetails = await Promise.all(ca.clients.map(async (client) => {
            const latestFiling = await TaxFiling.findOne({ user: client._id })
                .sort({ createdAt: -1 })
                .select('status createdAt');
            
            return {
                id: client._id,
                name: `${client.firstName} ${client.lastName}`,
                email: client.email,
                pan: client.pan,
                phone: client.phone || 'N/A', // Add phone
                status: latestFiling ? latestFiling.status : 'no_filings',
                lastFiling: latestFiling ? latestFiling.createdAt : null,
            };
        }));
        
        res.json(clientsWithDetails);

    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Get a specific tax filing for review
// @route   GET /api/ca/review/:filingId
// @access  Private (CA)
const getFilingForReview = async (req, res) => {
    try {
        const { filingId } = req.params;

        // Find the filing and populate the user details
        // Crucially, we also check that this filing is assigned to the logged-in CA
        const filing = await TaxFiling.findOne({
            _id: filingId,
            'caReview.ca': req.caId // Security check!
        }).populate('user', 'firstName lastName email pan phone'); // Get user details

        if (!filing) {
            return res.status(404).json({ message: 'Filing not found or not assigned to you' });
        }
        
        res.json(filing);

    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Add a comment to a tax filing
// @route   POST /api/ca/comment/:filingId
// @access  Private (CA)
const addComment = async (req, res) => {
    const { filingId } = req.params;
    const { section, comment } = req.body;

    if (!section || !comment) {
        return res.status(400).json({ message: 'Section and comment are required' });
    }

    try {
        const filing = await TaxFiling.findOne({
            _id: filingId,
            'caReview.ca': req.caId // Security check
        });

        if (!filing) {
            return res.status(404).json({ message: 'Filing not found or not assigned to you' });
        }

        const newComment = {
            section,
            comment,
            createdAt: new Date(),
            resolved: false
        };

        // Add the new comment
        filing.caReview.comments.push(newComment);
        
        // Update the filing status to notify the user
        filing.status = 'action_required';

        await filing.save();

        // Send back just the new comment (it will have an _id from MongoDB)
        res.status(201).json(filing.caReview.comments[filing.caReview.comments.length - 1]);

    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Resolve a comment
// @route   PUT /api/ca/comment/resolve/:filingId/:commentId
// @access  Private (CA)
const resolveComment = async (req, res) => {
    const { filingId, commentId } = req.params;

    try {
        const filing = await TaxFiling.findOne({
            _id: filingId,
            'caReview.ca': req.caId // Security
        });

        if (!filing) {
            return res.status(404).json({ message: 'Filing not found' });
        }

        // Find the comment in the array
        const comment = filing.caReview.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        comment.resolved = true;
        await filing.save();
        
        res.json({ message: 'Comment resolved', comment });

    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Approve a filing
// @route   PUT /api/ca/approve/:filingId
// @access  Private (CA)
const approveFiling = async (req, res) => {
    const { filingId } = req.params;

    try {
        const filing = await TaxFiling.findOne({
            _id: filingId,
            'caReview.ca': req.caId // Security
        });

        if (!filing) {
            return res.status(404).json({ message: 'Filing not found' });
        }

        // Check if all comments are resolved
        const unresolvedComments = filing.caReview.comments.filter(c => !c.resolved).length;
        if (unresolvedComments > 0) {
            return res.status(400).json({ message: 'Cannot approve filing with unresolved comments' });
        }

        // Update status to 'approved' (user can now submit)
        filing.status = 'approved';
        filing.caReview.reviewedAt = new Date();
        
        await filing.save();
        
        res.json({ message: 'Filing approved successfully', filing });

    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

module.exports = {
    getDashboard,
    getClients,
    getFilingForReview,
    addComment,
    resolveComment, // Add new function
    approveFiling   // Add new function
};