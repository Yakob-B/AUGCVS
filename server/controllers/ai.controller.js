const axios = require('axios');
const logAudit = require('../utils/auditLog');

// List of free models to try in order of preference
// Using high-availability free models from OpenRouter
const FREE_MODELS = [
    'google/gemini-2.0-flash-exp:free',
    'google/gemma-2-9b-it:free',
    'mistralai/mistral-7b-instruct:free',
    'microsoft/phi-3-mini-128k-instruct:free',
    'meta-llama/llama-3.1-8b-instruct:free',
    'openchat/openchat-7b:free'
];

// @desc    Chat with AI
// @route   POST /api/ai/chat
// @access  Public
exports.chatWithAI = async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const systemPrompt = `You are the specific AI Assistant for the **Ambo University Graduate Credential Verification System (AUGCVS)**. 
Your goal is to guide users (Graduates, Registrars, and External Verifiers) through the specific workflows of this web application.

### SYSTEM KNOWLEDGE BASE (USE THIS TO ANSWER):

**1. USER ROLES:**
*   **External (Verifier)**: Organizations/Companies who want to verify a graduate's degree.
*   **Registrar/Admin**: University staff who process verifications and upload graduate data.
*   **SuperAdmin**: Manages system users.

**2. REGISTRATION PROCESS:**
*   Users must click "Register" or "Create Account".
*   **Required Fields**: First Name, Last Name, Email, Password (min 6 chars), Adjust Role (defaults to External), Organization Name (required for External).
*   **Email Verification**: After signing up, a link is sent to the email. The account must be verified before logging in.

**3. VERIFICATION REQUEST FLOW (For External Users):**
1.  **Login** to the dashboard.
2.  Click **"New Verification Request"**.
3.  **Search**: Start by searching for the graduate using their **Student ID** or **Name**.
4.  **Upload**: You MUST upload a scanned copy of the **Degree Certificate** (Image/PDF).
5.  **Submit**: The request enters "Pending" status.

**4. STATUS MEANINGS:**
*   **Pending**: Request submitted, waiting for Registrar review.
*   **In Progress**: Registrar is currently checking the records.
*   **Approved (Valid)**: The degree is confirmed as AUTHENTIC.
*   **Rejected (Invalid/Forged)**: The degree is confirmed as FAKE or INVALID.
*   **Clarification Needed**: The Registrar needs more info (e.g., clearer image).

**5. NAVIGATION:**
*   **Dashboard**: Main hub for stats and recent activity.
*   **Verifications**: View history of all submitted requests.
*   **Support**: Contact page for technical issues.

### RULES:
1.  **BE SPECIFIC**: Do not give generic advice. Use the terms above (e.g., "Status: Pending", "Role: External").
2.  **NO VERIFICATION**: If asked "Is this ID real?", refer them to the "New Verification Request" form. NEVER verify in chat.
3.  **NO PRIVATE DATA**: Do not look up or ask for real student records in this chat.
4.  **TONE**: Professional, precise, and helpful academic tone.

If you don't know the answer based on this info, suggest contacting the Registrar office via the Support page.`;

    let lastError = null;

    // Try models in sequence until one works
    for (const model of FREE_MODELS) {
        try {
            console.log(`Attempting AI chat with model: ${model}`);

            const response = await axios.post(
                'https://openrouter.ai/api/v1/chat/completions',
                {
                    model: model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: message }
                    ],
                    temperature: 0.3, // Lower temperature for more factual responses
                    max_tokens: 600
                },
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                        'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:3000',
                        'X-Title': 'AUGCVS',
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data && response.data.choices && response.data.choices.length > 0) {
                const aiResponse = response.data.choices[0].message.content;
                return res.status(200).json({
                    success: true,
                    response: aiResponse,
                    model_used: model
                });
            }

        } catch (error) {
            console.warn(`Model ${model} failed:`, error.response?.data?.error?.message || error.message);
            lastError = error;
            // Continue to next model
        }
    }

    // If all models fail
    console.error('All AI models failed');
    res.status(500).json({
        success: false,
        message: 'I am having trouble connecting to my service right now. Please try again later.',
        details: lastError?.response?.data || lastError?.message
    });
};
