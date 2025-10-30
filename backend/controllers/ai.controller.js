const TaxCalculator = require('../utils/taxCalculator.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Get tax regime comparison
// @route   POST /api/ai/compare-regimes
const compareRegimes = async (req, res) => {
    try {
        const { income, deductions } = req.body;
        
        const comparison = TaxCalculator.compareRegimes(income, deductions);
        
        res.json(comparison);
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Get deduction recommendations
// @route   POST /api/ai/deduction-recommendations
const getDeductionRecommendations = async (req, res) => {
    try {
        const { income, currentDeductions, age, financialGoals } = req.body;
        
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        const prompt = `
        As a tax expert, suggest optimal tax saving deductions for an Indian taxpayer with:
        - Annual Income: ₹${income}
        - Current Deductions: ₹${currentDeductions}
        - Age: ${age}
        - Financial Goals: ${financialGoals || 'Not specified'}
        
        Provide specific, actionable recommendations under sections like 80C, 80D, 80G, etc.
        Focus on legitimate deductions that match their profile.
        Format the response as a JSON array with section, recommendation, and potentialSavings.
        `;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Parse the AI response (you might want more robust parsing)
        try {
            const recommendations = JSON.parse(text);
            res.json(recommendations);
        } catch (parseError) {
            // If JSON parsing fails, return the raw text
            res.json([{ 
                section: 'General', 
                recommendation: text, 
                potentialSavings: 0 
            }]);
        }
        
    } catch (error) {
        console.error('AI Service Error:', error);
        res.status(500).json({ message: `AI Service Error: ${error.message}` });
    }
};

// @desc    Chat with tax assistant
// @route   POST /api/ai/chat
const chatWithAssistant = async (req, res) => {
    try {
        const { message, chatHistory = [] } = req.body;
        
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        const context = `
        You are TaxSage AI, a friendly and expert Indian tax assistant. 
        Your role is to help users understand Indian income tax laws, filing procedures, deductions, and compliance.
        Always provide accurate, up-to-date information for Assessment Year ${new Date().getFullYear()}-${new Date().getFullYear() + 1}.
        Be concise but helpful. If unsure, recommend consulting a Chartered Accountant.
        `;
        
        const fullPrompt = `${context}\n\nChat History: ${JSON.stringify(chatHistory)}\n\nUser: ${message}\n\nTaxSage AI:`;
        
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();
        
        res.json({ response: text });
        
    } catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ message: `AI Service Error: ${error.message}` });
    }
};

module.exports = {
    compareRegimes,
    getDeductionRecommendations,
    chatWithAssistant
};