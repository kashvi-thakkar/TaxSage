const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

// Load environment variables from .env file first
dotenv.config();

console.log('🔧 Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI ? 'Set' : 'Missing',
  JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Missing'
});

// Check required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  console.error('Please check your .env file');
  process.exit(1);
}

const app = express();

// --- Enhanced CORS Configuration ---
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// --- Security Middleware ---
app.use((req, res, next) => {
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    next();
});

// --- Import Route Files ---
console.log('🔧 Loading routes...');

// Import routes
const authRoutes = require('./routes/auth.routes.js');
const caAuthRoutes = require('./routes/ca.auth.routes.js');

// Import optional routes with try-catch
let taxRoutes, caRoutes, aiRoutes, documentRoutes, analyticsRoutes; // Added analyticsRoutes

try {
    taxRoutes = require('./routes/tax.routes.js');
    console.log('✅ Tax routes loaded');
} catch (e) {
    console.log('⚠️ Tax routes not found, skipping...');
}

try {
    caRoutes = require('./routes/ca.routes.js');
    console.log('✅ CA routes loaded');
} catch (e) {
    console.log('⚠️ CA routes not found, skipping...');
}

try {
    aiRoutes = require('./routes/ai.routes.js');
    console.log('✅ AI routes loaded');
} catch (e) {
    console.log('⚠️ AI routes not found, skipping...');
}

try {
    documentRoutes = require('./routes/document.routes.js');
    console.log('✅ Document routes loaded');
} catch (e) {
    console.log('⚠️ Document routes not found, skipping...');
}

try {
    analyticsRoutes = require('./routes/analytics.routes.js'); // Added this block
    console.log('✅ Analytics routes loaded');
} catch (e) {
    console.log('⚠️ Analytics routes not found, skipping...');
}

// --- Database Connection with Enhanced Error Handling ---
const connectDB = async () => {
    try {
        console.log('🔗 Connecting to MongoDB...');
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        
        // Handle MongoDB connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected');
        });
        
        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('✅ MongoDB connection closed through app termination');
            process.exit(0);
        });
        
    } catch (error) {
        console.error(`❌ Error connecting to MongoDB: ${error.message}`);
        console.error('Please check your MONGO_URI in .env file');
        process.exit(1);
    }
};

// --- Request Logging Middleware ---
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// --- API Routes ---
console.log('🔧 Setting up API routes...');

app.use('/api/auth', authRoutes); 
app.use('/api/ca/auth', caAuthRoutes);

// Conditionally use other routes if they exist
if (taxRoutes) app.use('/api/tax', taxRoutes);
if (caRoutes) app.use('/api/ca', caRoutes);
if (aiRoutes) app.use('/api/ai', aiRoutes);
if (documentRoutes) app.use('/api/documents', documentRoutes);
if (analyticsRoutes) app.use('/api/analytics', analyticsRoutes); // Added this line

console.log('✅ All routes configured');

// --- Basic Route ---
app.get('/', (req, res) => {
    res.json({ 
        message: 'TaxSage API is running...',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        endpoints: [
            '/api/auth',
            '/api/ca/auth',
            '/api/tax',
            '/api/ca',
            '/api/ai', 
            '/api/documents',
            '/api/analytics', // Added this
            '/health'
        ]
    });
});

// --- Health Check Route ---
app.get('/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.status(200).json({
        status: 'OK',
        database: dbStatus,
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// --- 404 Handler for undefined routes ---
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// --- Global Error Handling Middleware ---
app.use((err, req, res, next) => {
    console.error('❌ Unhandled Error:', err);
    
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: Object.values(err.errors).map(e => e.message)
        });
    }
    
    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
            success: false,
            message: `${field} already exists`
        });
    }
    
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
    
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired'
        });
    }
    
    // Default error
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// --- Handle Unhandled Promise Rejections ---
process.on('unhandledRejection', (err, promise) => {
    console.log('❌ Unhandled Promise Rejection:', err);
    // Close server & exit process
    process.exit(1);
});

// --- Handle Uncaught Exceptions ---
process.on('uncaughtException', (err) => {
    console.log('❌ Uncaught Exception:', err);
    process.exit(1);
});

// --- Server Listener ---
const PORT = process.env.PORT || 5001;

const startServer = async () => {
    await connectDB();
    
    const server = app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
        console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`📊 Health check: http://localhost:${PORT}/health`);
        console.log(`🔗 API Base: http://localhost:${PORT}/api`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('SIGTERM received, shutting down gracefully');
        server.close(() => {
            console.log('Process terminated');
        });
    });
};

// Start the server
startServer();

module.exports = app;