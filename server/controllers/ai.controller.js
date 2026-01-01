const axios = require('axios');
const fs = require('fs');
const path = require('path');
const logAudit = require('../utils/auditLog');

// List of free models to try in order of preference
const FREE_MODELS = [
    'google/gemini-2.0-flash-exp:free',
    'google/gemma-2-9b-it:free',
    'mistralai/mistral-7b-instruct:free',
    'microsoft/phi-3-mini-128k-instruct:free',
    'meta-llama/llama-3.1-8b-instruct:free',
    'openchat/openchat-7b:free'
];

// Helper to log errors to file
const logErrorToFile = (error) => {
    try {
        const logDir = path.join(__dirname, '../logs');
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        const logFile = path.join(logDir, 'ai-errors.log');
        const timestamp = new Date().toISOString();
        const errorMessage = `[${timestamp}] ${error.message}\nStack: ${error.stack}\n\n`;
        fs.appendFileSync(logFile, errorMessage);
    } catch (err) {
        console.error('Failed to write to log file:', err);
    }
};

// @desc    Chat with AI
// @route   POST /api/ai/chat
// @access  Public
exports.chatWithAI = async (req, res) => {
    try {
        // Safe destructuring with null checks
        const body = req.body || {};
        const message = body.message;
        const history = Array.isArray(body.history) ? body.history : [];
        const userContext = body.userContext || {};

        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        // Check API Key
        if (!process.env.OPENROUTER_API_KEY) {
            const err = new Error('OPENROUTER_API_KEY is missing in server environment');
            logErrorToFile(err);
            return res.status(500).json({
                success: false,
                message: 'AI Service Configuration Error: API Key missing'
            });
        }

        // Dynamic system prompt based on user role
        const role = userContext.role || 'guest';
        const name = userContext.name || 'User';

        let roleSpecificInstructions = "";

        if (role === 'registrar' || role === 'admin') {
            roleSpecificInstructions = `
            YOU ARE SPEAKING TO A REGISTRAR/ADMIN named ${name}.
            - Focus on: Verifying pending requests, uploading graduate data, and managing users.
            - If they ask about "Pending" requests, explain how to review and approve them.
            `;
        } else if (role === 'external') {
            roleSpecificInstructions = `
            YOU ARE SPEAKING TO AN EXTERNAL VERIFIER named ${name}.
            - Focus on: How to submit new requests, tracking status, and payment/fees.
            `;
        } else {
            roleSpecificInstructions = `
            YOU ARE SPEAKING TO A GUEST.
            - Encourage them to "Register" or "Login" to start verification.
            `;
        }

        const systemPrompt = `You are the specific AI Assistant for the **Ambo University Graduate Credential Verification System (AUGCVS)**. 
        Your goal is to guide users through the specific workflows of this web application.

        ${roleSpecificInstructions}

        ### RULES:
        1.  **CONTEXT AWARE**: Remember previous messages if provided.
        2.  **SHORT & HELPFUL**: Keep answers under 3-4 sentences.
        `;

        let lastError = null;

        // Prepare context-aware messages
        const recentHistory = history.slice(-6).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text || msg.message || ''
        }));

        const messages = [
            { role: 'system', content: systemPrompt },
            ...recentHistory,
            { role: 'user', content: message }
        ];

        // Try models in sequence
        for (const model of FREE_MODELS) {
            try {
                console.log(`Attempting AI chat with model: ${model}`);

                const response = await axios.post(
                    'https://openrouter.ai/api/v1/chat/completions',
                    {
                        model: model,
                        messages: messages,
                        temperature: 0.3,
                        max_tokens: 500
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                            'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:3000',
                            'X-Title': 'AUGCVS',
                            'Content-Type': 'application/json'
                        },
                        timeout: 30000 // 30s timeout
                    }
                );

                if (response.data?.choices?.[0]?.message?.content) {
                    const aiResponse = response.data.choices[0].message.content;
                    return res.status(200).json({
                        success: true,
                        response: aiResponse,
                        model_used: model
                    });
                }

            } catch (error) {
                console.warn(`Model ${model} failed:`, error.message);
                lastError = error;
                // Log detailed OpenRouter error if available
                if (error.response?.data) {
                    logErrorToFile(new Error(`OpenRouter Error (${model}): ${JSON.stringify(error.response.data)}`));
                }
            }
        }

        // If all models fail
        logErrorToFile(new Error(`All models failed. Last error: ${lastError?.message}`));
        res.status(500).json({
            success: false,
            message: 'All AI models are currently unavailable. Please try again later.',
            details: lastError?.response?.data || lastError?.message
        });

    } catch (criticalError) {
        logErrorToFile(criticalError);
        console.error('Critical AI Controller Error:', criticalError);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error in AI Controller'
        });
    }
};
