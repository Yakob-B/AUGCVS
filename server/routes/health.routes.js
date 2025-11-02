const express = require('express');
const router = express.Router();

// Health check endpoint for monitoring
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

module.exports = router;
