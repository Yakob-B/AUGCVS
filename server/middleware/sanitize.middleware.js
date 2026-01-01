/**
 * Input Sanitization Middleware
 * Prevents NoSQL injection attacks by sanitizing request data
 */

// Characters that could be used for NoSQL injection
const sanitizeValue = (value) => {
    // If it's a string, we don't need to strip characters from the content
    // MongoDB injection is about creating objects with operator keys (e.g. $gt)
    // where a string is expected.
    if (typeof value === 'string') {
        return value;
    }

    if (typeof value === 'object' && value !== null) {
        // Check for MongoDB operators in object keys
        for (const key of Object.keys(value)) {
            if (key.startsWith('$') || key.includes('.')) {
                delete value[key];
            } else {
                value[key] = sanitizeValue(value[key]);
            }
        }
    }
    return value;
};

const sanitize = (req, res, next) => {
    // Sanitize body
    if (req.body) {
        for (const key of Object.keys(req.body)) {
            if (key.startsWith('$')) {
                delete req.body[key];
            } else {
                req.body[key] = sanitizeValue(req.body[key]);
            }
        }
    }

    // Sanitize query parameters
    if (req.query) {
        for (const key of Object.keys(req.query)) {
            if (key.startsWith('$')) {
                delete req.query[key];
            } else {
                req.query[key] = sanitizeValue(req.query[key]);
            }
        }
    }

    // Sanitize params
    if (req.params) {
        for (const key of Object.keys(req.params)) {
            if (typeof req.params[key] === 'string') {
                req.params[key] = sanitizeValue(req.params[key]);
            }
        }
    }

    next();
};

module.exports = sanitize;
