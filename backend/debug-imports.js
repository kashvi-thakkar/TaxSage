console.log('🔧 Debugging imports...');

try {
    const authController = require('./controllers/auth.controller.js');
    console.log('✅ auth.controller.js loaded successfully');
    console.log('Exports:', Object.keys(authController));
} catch (error) {
    console.log('❌ Error loading auth.controller.js:', error.message);
}

try {
    const caAuthController = require('./controllers/ca.auth.controller.js');
    console.log('✅ ca.auth.controller.js loaded successfully');
    console.log('Exports:', Object.keys(caAuthController));
} catch (error) {
    console.log('❌ Error loading ca.auth.controller.js:', error.message);
}

console.log('🔧 Debug complete');