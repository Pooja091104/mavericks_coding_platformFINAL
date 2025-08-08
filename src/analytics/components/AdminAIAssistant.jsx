import { useState, useEffect, useRef } from 'react';
import './chat-styles.css';

// Helper to parse markdown tables
function parseMarkdownTable(md) {
  const lines = md.trim().split('\n');
  if (lines.length < 3) return null;
  const header = lines[0].split('|').map(s => s.trim()).filter(Boolean);
  const rows = lines.slice(2).map(line => line.split('|').map(s => s.trim()).filter(Boolean));
  return { header, rows };
}

function MarkdownTable({ table }) {
  return (
    <div style={{ overflowX: 'auto', margin: '8px 0' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
        <thead>
          <tr>
            {table.header.map((h, i) => (
              <th key={i} style={{ borderBottom: '1px solid #e5e7eb', padding: '6px 8px', background: '#f3f4f6', fontWeight: 600 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={{ borderBottom: '1px solid #f3f4f6', padding: '6px 8px' }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderAnalysisAndRecommendations(text) {
  // Extract bullet points and numbered lists
  const analysis = [];
  const recommendations = [];
  let inAnalysis = false, inRecommendations = false;
  text.split('\n').forEach(line => {
    if (line.toLowerCase().includes('analysis:')) inAnalysis = true;
    else if (line.toLowerCase().includes('recommendations:')) {
      inAnalysis = false; inRecommendations = true;
    } else if (inAnalysis && line.trim().startsWith('-')) analysis.push(line.replace(/^-\s*/, ''));
    else if (inRecommendations && line.trim().match(/^\d+\./)) recommendations.push(line.replace(/^\d+\.\s*/, ''));
  });
  return (
    <>
      {analysis.length > 0 && (
        <div style={{ margin: '8px 0' }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Analysis:</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {analysis.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      )}
      {recommendations.length > 0 && (
        <div style={{ margin: '8px 0' }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Recommendations:</div>
          <ol style={{ margin: 0, paddingLeft: 18 }}>
            {recommendations.map((r, i) => <li key={i}>{r}</li>)}
          </ol>
        </div>
      )}
    </>
  );
}

export default function AdminAIAssistant({ user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [suggestions, _setSuggestions] = useState([
    'List users who failed Module 3',
    'Show all users inactive for 7+ days',
    'Generate progress report for Ravi',
    'Which users completed learning early?'
  ]);
  const messagesEndRef = useRef(null);

  // Load previous messages from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem(`admin_chat_history_${user?.uid}`);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, [user]);

  // Save messages to localStorage when they change
  useEffect(() => {
    if (messages.length > 0 && user?.uid) {
      localStorage.setItem(`admin_chat_history_${user.uid}`, JSON.stringify(messages));
    }
  }, [messages, user]);

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // In a real app, this would call your AI backend
      // For demo, we'll simulate a response with admin-specific functionality
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate contextual response based on admin query
      let aiResponse = generateAdminResponse(input);
      
      const aiMessage = { sender: 'ai', text: aiResponse };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error contacting AI assistant:', error);
      const errorMessage = { 
        sender: 'ai', 
        text: 'I\'m having trouble connecting to the database. Please try again in a moment.' 
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    if (user?.uid) {
      localStorage.removeItem(`admin_chat_history_${user.uid}`);
    }
  };

  const generateAdminResponse = (query) => {
    // Convert query to lowercase for easier matching
    const lowerQuery = query.toLowerCase();
    
    // Check for specific query patterns and generate appropriate responses
    if (lowerQuery.includes('failed module') || lowerQuery.includes('failed assessment')) {
      return generateFailedModuleResponse(lowerQuery);
    } else if (lowerQuery.includes('inactive') || lowerQuery.includes('not active')) {
      return generateInactiveUsersResponse(lowerQuery);
    } else if (lowerQuery.includes('progress report') || lowerQuery.includes('report for')) {
      return generateProgressReportResponse(lowerQuery);
    } else if (lowerQuery.includes('completed') || lowerQuery.includes('early completion')) {
      return generateEarlyCompletionResponse(lowerQuery);
    } else if (lowerQuery.includes('export') || lowerQuery.includes('download')) {
      return generateExportResponse(lowerQuery);
    } else {
      return `I'll help you find that information. In a fully implemented system, I would query the database for: "${query}" and return relevant data in table or chart format.\n\nWould you like me to prepare a report on this topic?`;
    }
  };

  const generateFailedModuleResponse = (query) => {
    // Extract module number if present
    const moduleMatch = query.match(/module\s*(\d+)/i);
    const moduleNum = moduleMatch ? moduleMatch[1] : '3'; // Default to module 3 if not specified
    
    return `### Users who failed Module ${moduleNum}\n\n| User | Email | Score | Attempts | Last Attempt |\n|------|-------|-------|----------|-------------|\n| Rahul Singh | rahul.s@example.com | 32% | 2 | 2023-05-12 |\n| Priya Patel | priya.p@example.com | 28% | 1 | 2023-05-14 |\n| Michael Chen | m.chen@example.com | 35% | 3 | 2023-05-11 |\n\n**Summary**: 3 users failed this module with an average score of 31.7%.\n\nWould you like to:\n1. Send reminder emails to these users\n2. Schedule a group review session\n3. Adjust the difficulty of Module ${moduleNum}\n4. Export this data as CSV`;
  };

  const generateInactiveUsersResponse = (query) => {
    // Extract days if present
    const daysMatch = query.match(/(\d+)\+?\s*days/i);
    const days = daysMatch ? daysMatch[1] : '7'; // Default to 7 days if not specified
    
    return `### Users inactive for ${days}+ days\n\n| User | Email | Last Active | Completed Modules | Progress |\n|------|-------|-------------|-------------------|----------|\n| Aditya Sharma | a.sharma@example.com | 2023-05-05 | 4/12 | 33% |\n| Emma Wilson | e.wilson@example.com | 2023-05-04 | 7/12 | 58% |\n| Carlos Rodriguez | c.rod@example.com | 2023-05-03 | 2/12 | 17% |\n| Sarah Johnson | s.johnson@example.com | 2023-05-01 | 9/12 | 75% |\n\n**Summary**: 4 users have been inactive for ${days}+ days.\n\n**Recommended Actions**:\n1. Send re-engagement emails\n2. Offer personalized assistance\n3. Conduct survey to understand barriers\n\nWould you like me to prepare a re-engagement campaign for these users?`;
  };

  const generateProgressReportResponse = (query) => {
    // Extract user name if present
    const nameMatch = query.match(/report\s+for\s+([\w\s]+)/i);
    let userName = 'Ravi'; // Default name
    
    if (nameMatch && nameMatch[1]) {
      userName = nameMatch[1].trim();
    }
    
    return `### Progress Report for ${userName}\n\n**User Profile**:\n- Email: ${userName.toLowerCase().replace(' ', '.')}@example.com\n- Joined: 2023-03-15\n- Learning Path: Full Stack Development\n\n**Module Completion**:\n- Completed: 8/12 modules (67%)\n- Current Module: Advanced JavaScript\n- Estimated Completion: 2 weeks\n\n**Assessment Performance**:\n| Module | Score | Percentile | Time Taken |\n|--------|-------|------------|------------|\n| HTML/CSS | 92% | 87th | 45 min |\n| JavaScript Basics | 88% | 82nd | 52 min |\n| React Fundamentals | 76% | 68th | 65 min |\n\n**Strengths**: Frontend development, UI design\n**Areas for Improvement**: Database design, API integration\n\n**Recommendations**:\n1. Additional practice on RESTful API concepts\n2. Pair programming sessions for backend development\n\nWould you like to export this report or send it to ${userName}?`;
  };

  const generateEarlyCompletionResponse = (query) => {
    return `### Users with Early Learning Path Completion\n\n| User | Email | Path | Expected Time | Actual Time | Time Saved |\n|------|-------|------|---------------|-------------|------------|\n| Neha Gupta | n.gupta@example.com | Data Science | 12 weeks | 9 weeks | 25% |\n| David Kim | d.kim@example.com | Web Development | 10 weeks | 7 weeks | 30% |\n| Lisa Chen | l.chen@example.com | Mobile Dev | 14 weeks | 11 weeks | 21% |\n\n**Analysis**:\n- These users completed assessments with an average score of 91%\n- All have prior programming experience\n- 2/3 participated in hackathons\n\n**Recommendations**:\n1. Offer advanced learning paths\n2. Invite as mentors for new users\n3. Feature in platform success stories\n\nWould you like me to generate a detailed analysis of their learning patterns?`;
  };

  const generateExportResponse = (query) => {
    return `I've prepared the requested data for export.\n\n**Export Options**:\n1. CSV (spreadsheet compatible)\n2. PDF Report\n3. JSON Data\n\nIn a fully implemented system, clicking any of these options would trigger the download with properly formatted data. For now, this is a simulation of that functionality.\n\nWould you like me to prepare any other reports or analysis?`;
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
  };

  return (
    <div className="chatbox-container admin-assistant">
      <div className="chatbox-header">
        <h3 className="chatbox-title">Admin AI Assistant</h3>
        {messages.length > 0 && (
          <button onClick={clearChat} className="clear-chat-btn">
            Clear Chat
          </button>
        )}
      </div>
      <div className="chatbox-messages">
        {messages.length === 0 ? (
          <div className="empty-chat-message">
            <p>Ask me about user data, reports, or platform analytics</p>
            <p className="chat-suggestions">Try asking:</p>
            <ul className="chat-suggestion-list">
              {suggestions.map((suggestion, index) => (
                <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
            >
              <div className="message-bubble">
                {message.sender === 'ai' && message.text.includes('|') && message.text.match(/\|.*\|.*\|/g) ? (
                  (() => {
                    // Try to extract the first markdown table
                    const tableMatch = message.text.match(/\|(.|\n)*?\|.*\|/g);
                    const table = tableMatch ? parseMarkdownTable(tableMatch[0]) : null;
                    return (
                      <>
                        {table && <MarkdownTable table={table} />}
                        {renderAnalysisAndRecommendations(message.text)}
                      </>
                    );
                  })()
                ) : message.sender === 'ai' ? (
                  <div>{message.text}</div>
                ) : (
                  message.text
                )}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="message ai-message">
            <div className="message-bubble typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chatbox-input">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about user data, reports, or analytics..."
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className={`send-button ${loading || !input.trim() ? 'disabled' : ''}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>
      </div>
    </div>
  );
}