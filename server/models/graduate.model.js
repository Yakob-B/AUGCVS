const mongoose = require('mongoose');

const graduateSchema = new mongoose.Schema({
    studentId: {
        type: String,
        required: [true, 'Student ID is required'],
        unique: true,
        trim: true
    },
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true
    },
    middleName: {
        type: String,
        trim: true
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Date of birth is required']
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: [true, 'Gender is required']
    },
    program: {
        type: String,
        required: [true, 'Program is required']
    },
    department: {
        type: String,
        required: [true, 'Department is required']
    },
    college: {
        type: String,
        required: [true, 'College is required']
    },
    graduationYear: {
        type: Number,
        required: [true, 'Graduation year is required']
    },
    graduationDate: {
        type: Date,
        required: [true, 'Graduation date is required']
    },
    degreeType: {
        type: String,
        required: [true, 'Degree type is required']
    },
    gpa: {
        type: Number,
        required: [true, 'GPA is required']
    },
    certificateNumber: {
        type: String,
        required: [true, 'Certificate number is required'],
        unique: true
    },
    status: {
        type: String,
        enum: ['active', 'revoked'],
        default: 'active'
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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

// Update the updatedAt timestamp before saving
graduateSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Graduate', graduateSchema); 