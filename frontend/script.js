const chatLog = document.getElementById('chat-log');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

let sessionId = localStorage.getItem('sessionId') || generateSessionId();

function generateSessionId() {
    const id = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('sessionId', id);
    return id;
}

function addMessage(message, className) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', className);
    messageElement.textContent = message;
    chatLog.appendChild(messageElement);
    chatLog.scrollTop = chatLog.scrollHeight;
}

async function sendMessage() {
    const message = userInput.value;
    if (message.trim() === '') return;

    addMessage(message, 'user-message');
    userInput.value = ''; // Clear the input field

    try {
        const response = await fetch('http://localhost:3000/chat', { // Replace with your backend URL if different
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message, sessionId: sessionId }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const botResponse = data.response; // Assuming your backend sends { response: "..." }
        addMessage(botResponse, 'bot-message');
        sessionId = data.sessionId; //update sessionId, in case backend sent a new one.
        localStorage.setItem('sessionId', sessionId); //save the sessionId.
    } catch (error) {
        console.error('Error:', error);
        addMessage('An error occurred.', 'bot-message');
    }
}

sendButton.addEventListener('click', sendMessage);

userInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});
