const mongoose = require('mongoose');
const User = require('../models/user.model');

describe('User Model', () => {
    // We don't connect to a real DB here because we want to test the Schema validation logic
    // which runs synchronously in Mongoose before hitting the DB for validation errors.

    it('should throw validation error if required fields are missing', async () => {
        const user = new User(); // empty user

        try {
            await user.validate();
        } catch (err) {
            expect(err.errors.firstName).toBeDefined();
            expect(err.errors.lastName).toBeDefined();
            expect(err.errors.email).toBeDefined();
            // Password might be required but role has a default 'external' so it might not error if missing? 
            // Actually role has default 'external' so it won't be undefined.
            // But if we specifically want to test required fields, role isn't required in the sense of throwing error if missing (it gets default).
            // So we remove role check or check strictly.
            // But let's check password.
            expect(err.errors.password).toBeDefined();
        }
    });

    it('should validate a correct user successfully', async () => {
        const userData = {
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            password: 'password123',
            role: 'external',
            organization: 'Test Org' // Required for external
        };
        const user = new User(userData);
        const err = user.validateSync(); // validateSync returns undefined if validation succeeds
        expect(err).toBeUndefined();
    });

    it('should throw error if email is invalid', async () => {
        const user = new User({
            name: 'Test User',
            email: 'invalid-email',
            password: 'password123',
            role: 'graduate'
        });

        try {
            await user.validate();
        } catch (err) {
            expect(err.errors.email).toBeDefined();
        }
    });
});
