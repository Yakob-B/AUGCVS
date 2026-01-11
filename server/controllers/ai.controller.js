const axios = require('axios');
const fs = require('fs');
const path = require('path');
const logAudit = require('../utils/auditLog');
const Verification = require('../models/verification.model');
const Graduate = require('../models/graduate.model');

// List of free models to try in order of preference
const FREE_MODELS = [
    'google/gemini-2.0-flash-exp:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'deepseek/deepseek-r1:free',
    'mistralai/mistral-7b-instruct:free',
    'microsoft/phi-3-mini-128k-instruct:free',
    'google/gemma-2-9b-it:free'
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
                // Wait 1 second before trying the next model to avoid rate limits
                await sleep(1000);
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

// @desc    Analyze certificate using AI
// @route   POST /api/ai/analyze/:id
// @access  Private (Registrar)
exports.analyzeVerification = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`[AI Analysis] Starting analysis for verification ID: ${id}`);

        // 1. Fetch verification and associated graduate data
        const verification = await Verification.findById(id).populate('graduate');
        if (!verification) {
            console.error(`[AI Analysis] Verification ${id} not found`);
            return res.status(404).json({ success: false, message: 'Verification request not found' });
        }

        const graduate = verification.graduate;
        if (!graduate) {
            console.error(`[AI Analysis] Graduate record missing for verification ${id}`);
            return res.status(404).json({ success: false, message: 'Associated graduate record not found' });
        }

        let certificateUrl = verification.certificateFile;
        console.log(`[AI Analysis] Original document URL: ${certificateUrl}`);

        // 3. Handle PDF to Image conversion (Cloudinary specialized)
        if (certificateUrl.toLowerCase().endsWith('.pdf')) {
            console.log(`[AI Analysis] PDF detected. Converting to image via Cloudinary transformation...`);
            certificateUrl = certificateUrl.replace(/\.pdf$/i, '.jpg');

            if (certificateUrl.includes('/upload/')) {
                certificateUrl = certificateUrl.replace('/upload/', '/upload/pg_1,f_auto,q_auto/');
            }
            console.log(`[AI Analysis] Transformed image URL: ${certificateUrl}`);
        }

        // 4. Prepare the prompt with database information
        const dbData = {
            studentId: graduate.studentId,
            fullName: `${graduate.firstName} ${graduate.middleName || ''} ${graduate.lastName}`.trim(),
            graduationYear: graduate.graduationYear,
            degreeType: graduate.degreeType,
            certificateNumber: graduate.certificateNumber,
            gpa: graduate.gpa,
            program: graduate.program
        };

        const systemPrompt = `You are an expert academic document auditor for Ambo University. 
        Compare the text in the provided certificate image against the official database records.
        
        DATABASE RECORDS:
        ${JSON.stringify(dbData, null, 2)}

        INSTRUCTIONS:
        1. Extract the name, student ID, certificate number, and graduation details from the image.
        2. Compare each field with the DATABASE RECORDS above.
        3. Identify any discrepancies or suspicious elements.
        4. Return your analysis in the following JSON format ONLY:
        {
          "matchPercentage": 0-100,
          "extractedData": { "fullName": "", "studentId": "", "certificateNumber": "", "graduationYear": "" },
          "discrepancies": ["list of specific differences"],
          "suspiciousElements": ["list of anything looking forged"],
          "recommendation": "authentic" | "forged" | "invalid",
          "explanation": "concise reasoning"
        }`;

        const messages = [
            { role: 'system', content: 'You are a helpful assistant that responds only in strictly valid JSON.' },
            {
                role: 'user',
                content: [
                    { type: 'text', text: systemPrompt },
                    {
                        type: 'image_url',
                        image_url: {
                            url: certificateUrl
                        }
                    }
                ]
            }
        ];

        // Use vision-capable free models (Verified OpenRouter IDs)
        const VISION_MODELS = [
            'google/gemini-2.0-flash-exp:free',
            'qwen/qwen-2-vl-7b-instruct:free',
            'meta-llama/llama-3.2-11b-vision-instruct:free'
        ];

        let lastError = null;

        for (const model of VISION_MODELS) {
            try {
                console.log(`[AI Analysis] Attempting model: ${model}`);
                const response = await axios.post(
                    'https://openrouter.ai/api/v1/chat/completions',
                    {
                        model: model,
                        messages: messages,
                        temperature: 0.1,
                        max_tokens: 1000
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                            'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:3000',
                            'X-Title': 'AUGCVS',
                            'Content-Type': 'application/json'
                        },
                        timeout: 60000
                    }
                );

                const content = response.data?.choices?.[0]?.message?.content;
                if (content) {
                    console.log(`[AI Analysis] Received response from ${model}`);
                    let analysisContent;

                    try {
                        const cleaned = content.trim()
                            .replace(/^[^\{]*/, '')
                            .replace(/[^\}]*$/, '')
                            .replace(/```json\s?|\s?```/g, '');
                        analysisContent = JSON.parse(cleaned);
                    } catch (e) {
                        const match = content.match(/\{[\s\S]*\}/);
                        if (match) {
                            analysisContent = JSON.parse(match[0]);
                        } else {
                            throw new Error('No valid JSON in AI response');
                        }
                    }

                    await logAudit({
                        user: req.user.id,
                        action: 'ai_analysis_performed',
                        details: { verificationId: id, model_used: model },
                        ip: req.ip
                    });

                    return res.status(200).json({
                        success: true,
                        analysis: analysisContent,
                        model_used: model
                    });
                }
            } catch (error) {
                const apiError = error.response?.data?.error?.message || error.message;
                console.warn(`[AI Analysis] ${model} failed:`, apiError);
                lastError = error;
                logErrorToFile(new Error(`Vision Model Error (${model}): ${apiError}`));
            }
        }

        throw new Error(`AI analysis failed: ${lastError?.response?.data?.error?.message || lastError?.message}`);

    } catch (error) {
        console.error('[AI Analysis Critical Error]:', error.message);
        logErrorToFile(error);
        res.status(500).json({
            success: false,
            message: 'AI Analysis Failed',
            error: error.message
        });
    }
};
