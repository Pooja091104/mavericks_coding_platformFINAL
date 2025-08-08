import { useState, useEffect } from "react";

export default function ChatBox({ user, trackUserInteraction = false }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Load previous messages if user is provided
  useEffect(() => {
    if (user?.uid) {
      // In a real app, this would fetch from Firestore
      // For demo, we'll use localStorage
      const savedMessages = localStorage.getItem(`chat_history_${user.uid}`);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    }
  }, [user]);

  const saveMessageToHistory = (message, response) => {
    if (!trackUserInteraction || !user?.uid) return;
    
    // In a real app, this would save to Firestore
    // For demo, we'll use localStorage
    const timestamp = new Date().toISOString();
    const chatRecord = {
      userId: user.uid,
      userName: user.displayName || user.email,
      userMessage: message,
      aiResponse: response,
      timestamp: timestamp
    };
    
    // Save to local chat history for admin dashboard
    const history = JSON.parse(localStorage.getItem('admin_chat_history') || '[]');
    history.push(chatRecord);
    localStorage.setItem('admin_chat_history', JSON.stringify(history));
    
    // Also save to user's personal chat history
    localStorage.setItem(`chat_history_${user.uid}`, JSON.stringify(messages));
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Call your backend API
      const res = await fetch("https://mavericks-api-g8px.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, userId: user?.uid }),
      });

      const data = await res.json();
      const aiText = data?.response || "No response from AI.";
      const aiMessage = { sender: "ai", text: aiText };
      
      setMessages((prev) => [...prev, aiMessage]);
      
      // Save interaction for admin tracking
      saveMessageToHistory(input, aiText);
      
    } catch (error) {
      console.error(error);
      const errorMessage = { sender: "ai", text: "Error contacting AI server." };
      setMessages((prev) => [...prev, errorMessage]);
      
      // Save error interaction
      saveMessageToHistory(input, "Error contacting AI server.");
    } finally {
      setLoading(false);
    }
  };

  // Clear chat history
  const clearChat = () => {
    setMessages([]);
    if (user?.uid) {
      localStorage.removeItem(`chat_history_${user.uid}`);
    }
  };

  return (
    <div className="chatbox-container">
      <div className="chatbox-header">
        <h3 className="chatbox-title">AI Assistant</h3>
        {messages.length > 0 && (
          <button onClick={clearChat} className="clear-chat-btn">
            Clear Chat
          </button>
        )}
      </div>
      <div className="chatbox-messages">
        {messages.length === 0 ? (
          <div className="empty-chat-message">
            <p>How can I help you today?</p>
            <p className="chat-suggestions">Try asking about:</p>
            <ul className="chat-suggestion-list">
              <li onClick={() => setInput("How do I improve my coding skills?")}>How do I improve my coding skills?</li>
              <li onClick={() => setInput("What learning path should I follow for web development?")}>What learning path should I follow for web development?</li>
              <li onClick={() => setInput("Tell me about the next hackathon")}>Tell me about the next hackathon</li>
            </ul>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={msg.sender === "user" ? "chat-msg user" : "chat-msg ai"}
            >
              <div className="chat-msg-avatar">
                {msg.sender === "user" ? "👤" : "🤖"}
              </div>
              <div className="chat-msg-content">
                <div className="chat-msg-sender">
                  {msg.sender === "user" ? (user?.displayName || "You") : "AI Assistant"}
                </div>
                <div className="chat-msg-text">{msg.text}</div>
                <div className="chat-msg-time">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="chat-msg ai">
            <div className="chat-msg-avatar">🤖</div>
            <div className="chat-msg-content">
              <div className="chat-msg-sender">AI Assistant</div>
              <div className="chat-msg-text typing-indicator">
                <span>.</span><span>.</span><span>.</span>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="chatbox-input">
        <input
          type="text"
          placeholder="Ask me anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button 
          onClick={sendMessage} 
          disabled={loading}
          className="send-button"
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
