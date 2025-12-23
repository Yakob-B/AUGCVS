const express = require('express');
const router = express.Router();
const { chatWithAI } = require('../controllers/ai.controller');

// Public route for chat assistance
router.post('/chat', chatWithAI);

module.exports = router;
