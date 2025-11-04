const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authMiddleware);

// Get or create chat for a verification
router.get('/verification/:verificationId', chatController.getOrCreateChat);

// Send a message
router.post('/verification/:verificationId/message', chatController.sendMessage);

// Get all chats for current user
router.get('/my-chats', chatController.getMyChats);

// Mark messages as read
router.put('/verification/:verificationId/read', chatController.markAsRead);

module.exports = router;

