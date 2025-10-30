const TaxFiling = require('../models/taxFiling.model.js');
const { parseISO, getYear } = require('date-fns');

// @desc    Get analytics for the logged-in user
// @route   GET /api/analytics
// @access  Private
const getAnalytics = async (req, res) => {
    try {
        // 1. Get all of the user's "filed" or "approved" tax filings
        const filings = await TaxFiling.find({
            user: req.userId,
            status: { $in: ['filed', 'approved'] }
        }).sort({ assessmentYear: 'asc' });

        if (!filings || filings.length === 0) {
            return res.status(200).json({ message: 'No filing data found to generate analytics.' });
        }

        // --- 2. Process the data ---

        // A. Income vs. Tax Paid Over Time
        const incomeTrend = filings.map(filing => ({
            year: filing.assessmentYear,
            totalIncome: filing.taxCalculation.grossTotalIncome,
            taxPaid: filing.taxPaid.tds, // Assuming TDS is the primary tax paid
            refund: filing.taxCalculation.refund,
        }));

        // B. Total Deduction Breakdown (for the latest filing)
        const latestFiling = filings[filings.length - 1];
        const deductionBreakdown = [
            { name: '80C', value: latestFiling.deductions.section80C || 0 },
            { name: '80D', value: latestFiling.deductions.section80D || 0 },
            { name: '80G', value: latestFiling.deductions.section80G || 0 },
            { name: 'Sec 24 (Home Loan)', value: latestFiling.deductions.section24 || 0 },
        ].filter(d => d.value > 0); // Only show deductions they've used

        // C. Key Stats
        const totalTaxPaid = filings.reduce((acc, f) => acc + (f.taxPaid.tds || 0), 0);
        const totalRefunds = filings.reduce((acc, f) => acc + (f.taxCalculation.refund || 0), 0);
        const avgTaxRate = (totalTaxPaid / filings.reduce((acc, f) => acc + f.taxCalculation.grossTotalIncome, 0)) * 100;

        // 3. Send the structured analytics data
        res.json({
            keyStats: {
                totalFilings: filings.length,
                totalTaxPaid: totalTaxPaid,
                totalRefunds: totalRefunds,
                averageTaxRate: isNaN(avgTaxRate) ? 0 : avgTaxRate.toFixed(2),
            },
            incomeTrend,
            deductionBreakdown: {
                year: latestFiling.assessmentYear,
                data: deductionBreakdown,
            }
        });

    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

module.exports = {
    getAnalytics
};