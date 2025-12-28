// Load environment variables
require('dotenv').config();

/* AUGCVS Server - Main Entry Point */
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

// Initialize express app
const app = express();
const server = http.createServer(app);

// Normalize client URL (remove trailing slash if present)
const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
const normalizedClientUrl = clientUrl.replace(/\/$/, "");
const allowedOrigins = [clientUrl, normalizedClientUrl];

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/augcvs', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('join-registrar-room', () => {
    socket.join('registrar-room');
    console.log('Registrar joined verification room');
  });

  // Join chat room for a specific verification
  socket.on('join-chat-room', (verificationId) => {
    socket.join(`chat-${verificationId}`);
    console.log(`User joined chat room for verification: ${verificationId}`);
  });

  // Leave chat room
  socket.on('leave-chat-room', (verificationId) => {
    socket.leave(`chat-${verificationId}`);
    console.log(`User left chat room for verification: ${verificationId}`);
  });

  // Typing indicators
  socket.on('typing-start', (data) => {
    const { verificationId, userId, userName } = data;
    socket.to(`chat-${verificationId}`).emit('user-typing', {
      verificationId,
      userId,
      userName,
      isTyping: true
    });
  });

  socket.on('typing-stop', (data) => {
    const { verificationId, userId } = data;
    socket.to(`chat-${verificationId}`).emit('user-typing', {
      verificationId,
      userId,
      isTyping: false
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Health check route (before API routes)
app.use('/api', require('./routes/health.routes'));

// API Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/graduates', require('./routes/graduate.routes'));
app.use('/api/verifications', require('./routes/verification.routes'));
app.use('/api/chat', require('./routes/chat.routes'));
app.use('/api/ai', require('./routes/ai.routes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Something went wrong!'
      : err.message
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
