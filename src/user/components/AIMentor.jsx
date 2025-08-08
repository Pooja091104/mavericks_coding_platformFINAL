import { useState, useEffect, useRef } from 'react';
import '../../analytics/components/chat-styles.css';
import { FaLightbulb, FaCode, FaRobot, FaBookOpen, FaLaptopCode, FaGraduationCap, FaBrain } from 'react-icons/fa';

export default function AIMentor({ userProfile }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [activeCategory, setActiveCategory] = useState('general');
  const messagesEndRef = useRef(null);

  // Load previous messages from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('mentor_chat_history');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      // Add welcome message if no history
      setMessages([
        {
          sender: 'ai',
          text: 'Hello! I\'m your AI learning mentor. I can help you with your learning journey, explain concepts, recommend resources, or answer questions about your progress. How can I assist you today?',
          type: 'text'
        }
      ]);
    }
    
    // Initialize suggestions based on user profile
    generateInitialSuggestions(userProfile);
  }, []);

  // Save messages to localStorage when they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('mentor_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Generate new suggestions based on current conversation
  const generateNewSuggestions = (currentInput) => {
    let newSuggestions = [];
    
    if (currentInput.includes('skill') || currentInput.includes('learn')) {
      newSuggestions = [
        'Show me learning resources',
        'What projects can I build?',
        'How long will it take to master?'
      ];
    } else if (currentInput.includes('project') || currentInput.includes('build')) {
      newSuggestions = [
        'Beginner project ideas',
        'How to structure my project?',
        'Tools for this project'
      ];
    } else if (currentInput.includes('interview') || currentInput.includes('job')) {
      newSuggestions = [
        'Common interview questions',
        'How to build a portfolio',
        'Resume improvement tips'
      ];
    } else {
      // Default suggestions
      newSuggestions = [
        'Learning path recommendations',
        'Coding challenge help',
        'Career advancement tips'
      ];
    }
    
    setSuggestions(newSuggestions);
  };

  const sendMessage = async (messageText = input) => {
    if (!messageText.trim()) return;

    const userMessage = { sender: 'user', text: messageText, type: 'text' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // In a real app, this would call your AI backend
      // For demo, we'll simulate a response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate contextual response based on user profile and message
      const aiResponse = generateMentorResponse(messageText, userProfile);
      
      const aiMessage = { 
        sender: 'ai', 
        text: aiResponse.text,
        type: aiResponse.type,
        ...(aiResponse.type === 'code' && { 
          language: aiResponse.language,
          code: aiResponse.code 
        })
      };
      
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error contacting AI mentor:', error);
      const errorMessage = { 
        sender: 'ai', 
        text: 'I\'m having trouble connecting to my knowledge base. Please try again in a moment.',
        type: 'text' 
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        sender: 'ai',
        text: 'Chat history cleared. How else can I help you with your learning journey?',
        type: 'text'
      }
    ]);
    localStorage.removeItem('mentor_chat_history');
  };
  
  const exportChat = () => {
    // Create a text version of the chat
    const chatText = messages.map(msg => {
      const sender = msg.sender === 'user' ? 'You' : 'AI Mentor';
      if (msg.type === 'code') {
        return `${sender}:\n${msg.text}\n\n\`\`\`${msg.language}\n${msg.code}\n\`\`\`\n`;
      } else {
        return `${sender}: ${msg.text}\n`;
      }
    }).join('\n');
    
    // Create a blob and download link
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-mentor-chat.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleCodeUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const code = event.target.result;
      const fileExtension = file.name.split('.').pop().toLowerCase();
      
      // Map file extensions to language names
      const languageMap = {
        'js': 'javascript',
        'py': 'python',
        'java': 'java',
        'html': 'html',
        'css': 'css',
        'cpp': 'cpp',
        'c': 'c',
        'cs': 'csharp',
        'go': 'go',
        'rb': 'ruby',
        'php': 'php',
        'ts': 'typescript',
        'jsx': 'jsx',
        'tsx': 'tsx',
      };
      
      const language = languageMap[fileExtension] || 'plaintext';
      
      // Add the code as a user message
      const userMessage = { 
        sender: 'user', 
        text: `I've uploaded a ${language} file: ${file.name}`, 
        type: 'code',
        language: language,
        code: code
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Simulate AI analyzing the code
      setLoading(true);
      setTimeout(() => {
        const aiResponse = {
          sender: 'ai',
          text: `I've analyzed your ${language} code. Here are some observations:`,
          type: 'text'
        };
        
        setMessages(prev => [...prev, aiResponse]);
        setLoading(false);
        
        // Generate new suggestions based on code upload
        setSuggestions([
          'Explain this code',
          'Optimize this code',
          'Find bugs in this code',
          'Add documentation'
        ]);
      }, 1500);
    };
    
    reader.readAsText(file);
    
    // Reset the file input
    e.target.value = null;
  };

  // Generate initial chat suggestions based on user profile
  const generateInitialSuggestions = (userProfile) => {
    const categoryMap = {
      general: [
        'What skills should I improve next?',
        'Recommend learning resources',
        'How do I prepare for a technical interview?'
      ],
      coding: [
        'Show me a code example',
        'Explain a coding concept',
        'Debug my code'
      ],
      career: [
        'Resume improvement tips',
        'Portfolio project ideas',
        'Industry trends'
      ],
      learning: [
        'Create a study plan',
        'Recommended courses',
        'Learning strategies'
      ]
    };
    
    // Add personalized suggestions if user has skills
    if (userProfile?.skills?.length > 0) {
      const topSkill = userProfile.skills[0];
      categoryMap.general.push(`Help me advance in ${topSkill}`);
      categoryMap.coding.push(`Project ideas using ${topSkill}`);
    }
    
    setSuggestions(categoryMap[activeCategory] || categoryMap.general);
  };
  
  // Update suggestions when category changes
  useEffect(() => {
    if (userProfile) {
      generateInitialSuggestions(userProfile);
    }
  }, [activeCategory, userProfile]);
  
  // Function to generate contextual responses based on user profile and input
  const generateMentorResponse = (input, userProfile) => {
    const inputLower = input.toLowerCase();
    
    // Check for skill-related questions
    if (inputLower.includes('skill') || inputLower.includes('improve') || inputLower.includes('learn')) {
      if (userProfile?.skills?.length > 0) {
        const relatedSkills = getRelatedSkills(userProfile.skills);
        return {
          text: `Based on your profile, you're already familiar with ${userProfile.skills.slice(0, 3).join(', ')}. To improve further, I recommend focusing on advanced topics in these areas or exploring related technologies like ${relatedSkills.join(', ')}.`,
          type: 'text'
        };
      } else {
        return {
          text: 'To improve your skills, I recommend completing the skill assessment first so I can provide more personalized recommendations.',
          type: 'text'
        };
      }
    }
    
    // Check for assessment-related questions
    if (inputLower.includes('assessment') || inputLower.includes('test') || inputLower.includes('quiz')) {
      return {
        text: 'Assessments help us understand your current skill level. Head to the Assessment tab to take a skill assessment. This will help me provide more tailored learning recommendations.',
        type: 'text'
      };
    }
    
    // Check for learning path questions
    if (inputLower.includes('learning path') || inputLower.includes('course') || inputLower.includes('tutorial')) {
      return {
        text: 'Your personalized learning path is available in the Learning Path tab. It contains modules tailored to your skill level and goals. I recommend starting with the first incomplete module to make steady progress.',
        type: 'text'
      };
    }
    
    // Check for hackathon questions
    if (inputLower.includes('hackathon') || inputLower.includes('challenge') || inputLower.includes('competition')) {
      return {
        text: 'Participating in hackathons is a great way to apply your skills! Check the Hackathons tab to see current opportunities. I recommend choosing one that aligns with your strongest skills for the best chance of success.',
        type: 'text'
      };
    }
    
    // Check for code-related questions
    if (inputLower.includes('code') || inputLower.includes('example') || inputLower.includes('syntax')) {
      // Determine which language to show based on user profile or question
      let language = 'javascript'; // Default
      let codeExample = '';
      
      if (userProfile?.skills?.includes('Python') || inputLower.includes('python')) {
        language = 'python';
        codeExample = `def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

# Example usage
for number in fibonacci(10):
    print(number)`;
      } else if (userProfile?.skills?.includes('Java') || inputLower.includes('java')) {
        language = 'java';
        codeExample = `public class Fibonacci {
    public static void main(String[] args) {
        int n = 10;
        for (int i = 0; i < n; i++) {
            System.out.print(fibonacci(i) + " ");
        }
    }

    public static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n-1) + fibonacci(n-2);
    }
}`;
      } else {
        codeExample = `function fibonacci(n) {
  const sequence = [0, 1];
  for (let i = 2; i < n; i++) {
    sequence.push(sequence[i-1] + sequence[i-2]);
  }
  return sequence;
}

// Example usage
console.log(fibonacci(10));`;
      }
      
      return {
        text: `Here's a ${language} example of a Fibonacci sequence implementation:`,
        type: 'code',
        language: language,
        code: codeExample
      };
    }
    
    // Check for interview preparation questions
    if (inputLower.includes('interview') || inputLower.includes('job') || inputLower.includes('career')) {
      return {
        text: 'For technical interviews, I recommend focusing on these key areas:\n\n1. **Data Structures & Algorithms**: Practice on platforms like LeetCode or HackerRank\n2. **System Design**: Understand scalability, reliability, and efficiency concepts\n3. **Technical Communication**: Practice explaining complex concepts clearly\n4. **Project Experience**: Prepare to discuss your projects in depth\n\nWould you like me to suggest specific practice problems based on your skill level?',
        type: 'text'
      };
    }
    
    // Default responses for general questions
    const generalResponses = [
      'That\'s a great question! To give you the best answer, could you tell me more about what specific skills you\'re trying to develop?',
      'I\'m here to help guide your learning journey. Have you checked your personalized learning path in the Learning Path tab?',
      'Learning is most effective when it\'s consistent. I recommend setting aside regular time each day for studying and practice.',
      'Remember that making mistakes is part of the learning process. Don\'t be discouraged by challenges - they help you grow!',
      'Based on your progress, you\'re doing well! Keep up the consistent effort and you\'ll continue to improve.',
    ];
    
    // Generate new suggestions based on the current question
    generateNewSuggestions(inputLower);
    
    return {
      text: generalResponses[Math.floor(Math.random() * generalResponses.length)],
      type: 'text'
    };
  };

  // Helper function to suggest related skills
  const getRelatedSkills = (skills) => {
    const skillMap = {
      'JavaScript': ['TypeScript', 'React', 'Node.js'],
      'Python': ['Django', 'Flask', 'Data Science'],
      'Java': ['Spring Boot', 'Android', 'Microservices'],
      'React': ['Redux', 'Next.js', 'React Native'],
      'Node.js': ['Express', 'MongoDB', 'GraphQL'],
      'HTML': ['CSS', 'JavaScript', 'Responsive Design'],
      'CSS': ['Sass', 'Tailwind', 'Bootstrap'],
      'SQL': ['PostgreSQL', 'Database Design', 'ORM'],
      // Add more mappings as needed
    };
    
    const relatedSkills = new Set();
    skills.forEach(skill => {
      const related = skillMap[skill] || [];
      related.forEach(r => relatedSkills.add(r));
    });
    
    // Filter out skills the user already has
    return [...relatedSkills].filter(skill => !skills.includes(skill)).slice(0, 3);
  };

  return (
    <div className="chatbox-container">
      <div className="chatbox-header">
        <div className="chatbox-title-container">
          <FaRobot className="mentor-icon" />
          <h3 className="chatbox-title">AI Learning Mentor</h3>
        </div>
        <div className="chatbox-actions">
          {messages.length > 1 && (
            <>
              <button onClick={clearChat} className="clear-chat-btn">
                Clear Chat
              </button>
              <button onClick={exportChat} className="export-chat-btn">
                Export Chat
              </button>
              <label className="upload-code-btn">
                <input 
                  type="file" 
                  accept=".js,.py,.java,.html,.css,.cpp,.c,.cs,.go,.rb,.php,.ts,.jsx,.tsx" 
                  onChange={handleCodeUpload} 
                  style={{ display: 'none' }} 
                />
                Upload Code
              </label>
            </>
          )}
        </div>
      </div>
      
      {/* Category selector */}
      <div className="category-selector">
        <button 
          className={`category-btn ${activeCategory === 'general' ? 'active' : ''}`}
          onClick={() => setActiveCategory('general')}
        >
          <FaBrain /> General
        </button>
        <button 
          className={`category-btn ${activeCategory === 'coding' ? 'active' : ''}`}
          onClick={() => setActiveCategory('coding')}
        >
          <FaCode /> Coding
        </button>
        <button 
          className={`category-btn ${activeCategory === 'career' ? 'active' : ''}`}
          onClick={() => setActiveCategory('career')}
        >
          <FaGraduationCap /> Career
        </button>
        <button 
          className={`category-btn ${activeCategory === 'learning' ? 'active' : ''}`}
          onClick={() => setActiveCategory('learning')}
        >
          <FaBookOpen /> Learning
        </button>
      </div>
      
      <div className="chatbox-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
          >
            <div className="message-bubble">
              {message.type === 'code' ? (
                <div className="code-block">
                  <div className="code-header">
                    <span className="code-language">{message.language}</span>
                  </div>
                  <pre>
                    <code>{message.code}</code>
                  </pre>
                </div>
              ) : (
                <div className="text-message">{message.text}</div>
              )}
            </div>
          </div>
        ))}
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
      
      {/* Suggestions */}
      <div className="suggestion-chips">
        {suggestions.map((suggestion, index) => (
          <button 
            key={index} 
            className="suggestion-chip"
            onClick={() => sendMessage(suggestion)}
            disabled={loading}
          >
            <FaLightbulb className="suggestion-icon" />
            {suggestion}
          </button>
        ))}
      </div>
      
      <div className="chatbox-input">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask your AI mentor a question..."
          disabled={loading}
        />
        <button
          onClick={() => sendMessage()}
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