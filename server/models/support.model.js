const mongoose = require('mongoose');

const supportRequestSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: [true, 'User email is required'],
        lowercase: true,
        trim: true
    },
    message: {
        type: String,
        required: [true, 'Message is required']
    },
    status: {
        type: String,
        enum: ['pending', 'resolved'],
        default: 'pending'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    resolvedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create indexes for efficient querying
supportRequestSchema.index({ status: 1 });
supportRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SupportRequest', supportRequestSchema);
