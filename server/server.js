require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

// Initialize express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'uploads')));

// Database connection
mongoose.connect(process.env.MONGODB_URI|| 'mongodb://127.0.0.1:27017/augcvs', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user to their personal room based on user ID
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  // Join registrar to verification room
  socket.on('join-registrar-room', () => {
    socket.join('registrar-room');
    console.log('Registrar joined verification room');
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
    console.log(`Server is running on port ${PORT}`);
});
