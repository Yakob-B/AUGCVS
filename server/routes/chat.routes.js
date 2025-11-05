const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');

// Get all chats for the authenticated user (must come before /:verificationId)
router.get('/my-chats', protect, chatController.getMyChats);

// Get or create a chat for a specific verification
router.get('/verification/:verificationId', protect, chatController.getOrCreateChat);

// Send a message in a chat
router.post('/verification/:verificationId/message', protect, chatController.sendMessage);

// Mark messages in a chat as read
router.put('/verification/:verificationId/read', protect, chatController.markAsRead);

module.exports = router;

