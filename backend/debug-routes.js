console.log('🔧 Debugging routes...');

try {
    const express = require('express');
    const router = express.Router();
    
    console.log('✅ Express router loaded');
    
    const { registerCA, loginCA } = require('./controllers/ca.auth.controller.js');
    console.log('✅ CA auth controller imported successfully');
    console.log('registerCA type:', typeof registerCA);
    console.log('loginCA type:', typeof loginCA);
    
    // Test the route assignment
    console.log('🔧 Testing route assignment...');
    router.post('/register', registerCA);
    router.post('/login', loginCA);
    
    console.log('✅ Routes assigned successfully');
    console.log('Router stack:', router.stack.length, 'routes');
    
} catch (error) {
    console.log('❌ Error in route setup:', error.message);
    console.log('Stack:', error.stack);
}

console.log('🔧 Route debug complete');