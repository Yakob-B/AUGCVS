const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
    requestNumber: {
        type: String,
        required: true,
        unique: true
    },
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    graduate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Graduate',
        required: true
    },
    certificateNumber: {
        type: String,
        required: [true, 'Certificate number is required']
    },
    certificateFile: {
        type: String, // URL or path to stored file
        required: [true, 'Certificate file is required']
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    processedAt: Date,
    verificationResult: {
        type: String,
        enum: ['pending', 'authentic', 'forged', 'invalid'],
        default: 'pending'
    },
    comments: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Generate request number before saving
verificationSchema.pre('validate', async function(next) {
    if (this.isNew && !this.requestNumber) {
        const count = await this.constructor.countDocuments();
        this.requestNumber = `REQ${Date.now().toString().slice(-6)}${count + 1}`;
    }
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Verification', verificationSchema); 