const express = require('express');
const router = express.Router();
const { chatWithAI, analyzeVerification } = require('../controllers/ai.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public route for chat assistance
router.post('/chat', chatWithAI);

// Private route for certificate analysis - Registrar only
router.post('/analyze/:id', protect, authorize('registrar'), analyzeVerification);

module.exports = router;
