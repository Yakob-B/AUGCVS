const Chat = require('../models/chat.model');
const Verification = require('../models/verification.model');
const User = require('../models/user.model');

// Get or create chat for a verification
exports.getOrCreateChat = async (req, res) => {
  try {
    const { verificationId } = req.params;
    const userId = req.user.id;

    // Verify the verification exists and user has access
    const verification = await Verification.findById(verificationId)
      .populate('requester', 'firstName lastName email organization')
      .populate('graduate', 'firstName lastName studentId');

    if (!verification) {
      return res.status(404).json({ success: false, message: 'Verification not found' });
    }

    // Check access: External users can only chat about their own verifications
    // Admin/Registrar can chat about any verification
    if (req.user.role === 'external' && verification.requester._id.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Find or create chat
    let chat = await Chat.findOne({ verification: verificationId })
      .populate('participants', 'firstName lastName email role')
      .populate('messages.sender', 'firstName lastName email role');

    if (!chat) {
      // Create new chat
      const participants = [verification.requester];

      // Add registrar/admin if verification is pending
      if (verification.status === 'pending') {
        // Find registrar users
        const registrars = await User.find({ role: { $in: ['registrar', 'admin'] } }).select('_id');
        participants.push(...registrars.map(r => r._id));
      }

      chat = new Chat({
        verification: verificationId,
        participants: participants,
        messages: []
      });
      await chat.save();

      chat = await Chat.findById(chat._id)
        .populate('participants', 'firstName lastName email role')
        .populate('messages.sender', 'firstName lastName email role');
    }

    // Mark messages as read for current user
    chat.messages.forEach(msg => {
      if (msg.sender.toString() !== userId && !msg.read) {
        msg.read = true;
        msg.readAt = new Date();
      }
    });

    // Reset unread count for current user
    const unreadField = req.user.role === 'external' ? 'external' : 'registrar';
    chat.unreadCount[unreadField] = 0;

    await chat.save();

    // Get updated chat
    chat = await Chat.findById(chat._id)
      .populate('participants', 'firstName lastName email role')
      .populate('messages.sender', 'firstName lastName email role')
      .populate('verification', 'requestNumber status');

    res.json({ success: true, data: chat });
  } catch (error) {
    console.error('Error getting chat:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { verificationId } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Verify chat exists and user has access
    const chat = await Chat.findOne({ verification: verificationId })
      .populate('verification', 'requester status');

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    // Check if user is a participant
    const isParticipant = chat.participants.some(p => p.toString() === userId);
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Add message
    const newMessage = {
      sender: userId,
      message: message.trim(),
      read: false
    };

    chat.messages.push(newMessage);
    chat.lastMessage = new Date();

    // Update unread count for other participants
    const otherRole = req.user.role === 'external' ? 'registrar' : 'external';
    chat.unreadCount[otherRole] = (chat.unreadCount[otherRole] || 0) + 1;

    await chat.save();

    // Populate sender info
    const populatedChat = await Chat.findById(chat._id)
      .populate('participants', 'firstName lastName email role')
      .populate('messages.sender', 'firstName lastName email role')
      .populate('verification', 'requestNumber status');

    const sentMessage = populatedChat.messages[populatedChat.messages.length - 1];

    // Emit to Socket.IO
    const io = req.app.get('io');

    // Emit to chat room
    io.to(`chat-${verificationId}`).emit('new-message', {
      chatId: chat._id,
      verificationId: verificationId,
      message: sentMessage,
      unreadCount: chat.unreadCount
    });

    // Emit to participant rooms for notifications
    chat.participants.forEach(participantId => {
      if (participantId.toString() !== userId) {
        io.to(`user-${participantId}`).emit('chat-message-notification', {
          verificationId: verificationId,
          verificationNumber: populatedChat.verification.requestNumber,
          sender: {
            firstName: req.user.firstName,
            lastName: req.user.lastName
          },
          message: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
          unreadCount: chat.unreadCount
        });
      }
    });

    res.json({ success: true, data: sentMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all chats for current user
exports.getMyChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { role } = req.user;

    let query = {};

    if (role === 'external') {
      // External users only see chats for their own verifications
      const verifications = await Verification.find({ requester: userId }).select('_id');
      const verificationIds = verifications.map(v => v._id);
      query = { verification: { $in: verificationIds } };
    } else {
      // Admin/Registrar see all chats
      query = { participants: userId };
    }

    const chats = await Chat.find(query)
      .populate('verification', 'requestNumber status graduate')
      .populate('participants', 'firstName lastName email role')
      .sort({ lastMessage: -1 })
      .limit(50);

    res.json({ success: true, data: chats });
  } catch (error) {
    console.error('Error getting chats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { verificationId } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findOne({ verification: verificationId });

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    // Mark all unread messages as read
    chat.messages.forEach(msg => {
      if (msg.sender.toString() !== userId && !msg.read) {
        msg.read = true;
        msg.readAt = new Date();
      }
    });

    // Reset unread count
    const unreadField = req.user.role === 'external' ? 'external' : 'registrar';
    chat.unreadCount[unreadField] = 0;

    await chat.save();

    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

