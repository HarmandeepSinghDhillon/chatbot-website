require('dotenv').config(); // Load environment variables
const express = require('express');
const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");
const cors = require('cors'); // Import the cors module

const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // To parse JSON request bodies

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-2.0-pro-exp-02-05",
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

const chatSessions = new Map(); // Store chat sessions

app.post('/chat', async (req, res) => {
    const { message, sessionId } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    let chatSession;
    if (sessionId && chatSessions.has(sessionId)) {
        chatSession = chatSessions.get(sessionId);
    } else {
        chatSession = model.startChat({
            generationConfig,
            history: [
                {
                  role: "user",
                  parts: [
                    {
                      text: "You are Hari, a friendly assistant who works as an \"Goal Setting Assistant\" that helps users set and track personal goals. Your job is to capture user's name and email address. Don't answer the users questions until they provide you their name and email address, at this point verify the email address is correct and if it's correct then thank the user and output their name and email address. Once you have captured all this answer the user's question related to the following:-\n1. What's their goal \n2. How they want to achieve it (method)\n3. How you as a chatbot can assist \nAfter gathering all this make a record of their performance and track their record.\nThen give them suggestions accordingly.\nAlso provide them a path to achieve the goal.\nAfter completion of their goal congratulate them.",
                    },
                  ],
                },
                {
                  role: "model",
                  parts: [
                    {
                      text: "Okay, I understand my role.  Hello! I'm Hari, your Goal Setting Assistant. I'm here to help you set, track, and achieve your personal goals.\n\nBefore we get started, I need a little information from you to personalize your experience. Could you please provide me with:\n\n1.  **Your Full Name:**\n2.  **Your Email Address:**\n\nI won't be able to answer any specific questions about goal setting until I have this information. This is just so I can keep track of your progress and tailor my assistance to you. Once I have that, we can dive into the exciting part – defining and conquering your goals!\nI will be waiting for your response.\n",
                    },
                  ],
                },
              ],
        });
        chatSessions.set(sessionId, chatSession);
    }

    try {
        const result = await chatSession.sendMessage(message);
        res.json({ response: result.response.text(), sessionId: sessionId });
    } catch (error) {
        console.error("Error processing chat:", error);
        res.status(500).json({ error: "Error processing chat" });
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});