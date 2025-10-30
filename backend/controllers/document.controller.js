const TaxFiling = require('../models/taxFiling.model.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Upload document to tax filing
// @route   POST /api/documents/upload/:filingId
const uploadDocument = async (req, res) => {
    try {
        const { name, type, url } = req.body;
        
        const filing = await TaxFiling.findOne({
            _id: req.params.filingId,
            user: req.userId
        });
        
        if (!filing) {
            return res.status(404).json({ message: 'Filing not found' });
        }
        
        filing.documents.push({
            name,
            type,
            url,
            uploadedAt: new Date()
        });
        
        await filing.save();
        
        res.json({ message: 'Document uploaded successfully', filing });
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Extract data from Form16 using AI
// @route   POST /api/documents/extract-form16
const extractForm16Data = async (req, res) => {
    try {
        const { documentUrl } = req.body;
        
        // In a real implementation, you would:
        // 1. Use Google Vision API for OCR
        // 2. Parse the extracted text
        // 3. Use AI to structure the data
        
        const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
        
        // This is a simplified implementation
        // For production, you'd need to handle the image processing properly
        
        const prompt = `
        Analyze this Form16 document and extract the following information in JSON format:
        - employeeName
        - pan
        - employerName
        - assessmentYear
        - salaryBreakdown (basic, allowances, etc.)
        - deductions
        - taxDeducted
        Return only valid JSON.
        `;
        
        // Note: Actual implementation would require proper image handling
        // This is a placeholder for the AI extraction logic
        
        // For now, return mock data
        const mockData = {
            employeeName: "John Doe",
            pan: "ABCDE1234F",
            employerName: "Sample Corporation",
            assessmentYear: "2024-2025",
            salaryBreakdown: {
                basic: 800000,
                allowances: 200000,
                total: 1000000
            },
            deductions: {
                section80C: 150000,
                section80D: 25000
            },
            taxDeducted: 120000
        };
        
        res.json({ extractedData: mockData, confidence: 0.85 });
        
    } catch (error) {
        console.error('Form16 Extraction Error:', error);
        res.status(500).json({ message: `Extraction Error: ${error.message}` });
    }
};

module.exports = {
    uploadDocument,
    extractForm16Data
};