const authController = require('../controllers/auth.controller');
const User = require('../models/user.model');
const { validationResult } = require('express-validator');
const logAudit = require('../utils/auditLog');

// Mock dependencies
jest.mock('../models/user.model');
jest.mock('express-validator');
jest.mock('../utils/auditLog');

describe('Auth Controller - Login', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                email: 'test@example.com',
                password: 'password123'
            },
            ip: '127.0.0.1'
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            cookie: jest.fn().mockReturnThis()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 if email or password is missing', async () => {
        req.body.email = '';
        await authController.login(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: 'Please provide an email and password'
        }));
    });

    it('should return 401 if user is not found', async () => {
        User.findOne.mockReturnValue({
            select: jest.fn().mockResolvedValue(null)
        });

        await authController.login(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Invalid credentials'
        });
    });

    it('should return 401 if password does not match', async () => {
        const mockUser = {
            _id: 'user123',
            matchPassword: jest.fn().mockResolvedValue(false),
            status: 'active'
        };
        User.findOne.mockReturnValue({
            select: jest.fn().mockResolvedValue(mockUser)
        });

        await authController.login(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Invalid credentials'
        });
    });

    it('should return 200 and token if login is successful', async () => {
        const mockUser = {
            _id: 'user123',
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            role: 'graduate',
            status: 'active',
            matchPassword: jest.fn().mockResolvedValue(true),
            getSignedJwtToken: jest.fn().mockReturnValue('fake_token')
        };

        User.findOne.mockReturnValue({
            select: jest.fn().mockResolvedValue(mockUser)
        });

        // Mock process.env
        process.env.JWT_COOKIE_EXPIRE = '30';

        await authController.login(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.cookie).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            token: 'fake_token'
        }));
    });
});
