import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';

export default function ChatInteractions() {
  const [chatHistory, setChatHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [selectedUser, setSelectedUser] = useState('');
  const [uniqueUsers, setUniqueUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchChatHistory();
  }, []);

  const fetchChatHistory = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to fetch real chat history from Firestore
      const chatQuery = query(
        collection(db, 'chat_interactions'),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      
      const chatSnapshot = await getDocs(chatQuery);
      
      if (!chatSnapshot.empty) {
        const history = [];
        chatSnapshot.forEach(doc => {
          history.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setChatHistory(history);
        setFilteredHistory(history);
        
        // Extract unique users for filtering
        const users = [...new Set(history.map(item => item.userName || 'Anonymous'))];
        setUniqueUsers(users);
      } else {
        // If no real data exists, try to use localStorage as fallback
        const localHistory = JSON.parse(localStorage.getItem('admin_chat_history') || '[]');
        
        if (localHistory.length > 0) {
          setChatHistory(localHistory);
          setFilteredHistory(localHistory);
          
          // Extract unique users for filtering
          const users = [...new Set(localHistory.map(item => item.userName || 'Anonymous'))];
          setUniqueUsers(users);
        } else {
          // Create demo data if no data exists
          const demoData = generateDemoData();
          setChatHistory(demoData);
          setFilteredHistory(demoData);
          
          // Extract unique users for filtering
          const users = [...new Set(demoData.map(item => item.userName))];
          setUniqueUsers(users);
        }
      }
    } catch (err) {
      console.error('Error fetching chat history:', err);
      setError('Failed to load chat history data');
      
      // Fall back to localStorage or demo data
      const localHistory = JSON.parse(localStorage.getItem('admin_chat_history') || '[]');
      
      if (localHistory.length > 0) {
        setChatHistory(localHistory);
        setFilteredHistory(localHistory);
        
        // Extract unique users for filtering
        const users = [...new Set(localHistory.map(item => item.userName || 'Anonymous'))];
        setUniqueUsers(users);
      } else {
        // Create demo data if no data exists
        const demoData = generateDemoData();
        setChatHistory(demoData);
        setFilteredHistory(demoData);
        
        // Extract unique users for filtering
        const users = [...new Set(demoData.map(item => item.userName))];
        setUniqueUsers(users);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const generateDemoData = () => {
    // Generate realistic demo data for the hackathon demo
    return [
      {
        id: '1',
        userId: 'user1',
        userName: 'John Smith',
        userMessage: 'How do I start with JavaScript?',
        aiResponse: 'JavaScript is a great language to start with! I recommend beginning with basic syntax, variables, and functions. Would you like me to suggest some resources?',
        timestamp: new Date(Date.now() - 86400000).toISOString() // 1 day ago
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'Emily Johnson',
        userMessage: 'Can you help me debug this React code?',
        aiResponse: 'I\'d be happy to help debug your React code. What specific issue are you encountering?',
        timestamp: new Date(Date.now() - 43200000).toISOString() // 12 hours ago
      },
      {
        id: '3',
        userId: 'user1',
        userName: 'John Smith',
        userMessage: 'What are the best practices for API security?',
        aiResponse: 'For API security, I recommend: 1) Always use HTTPS, 2) Implement proper authentication, 3) Use rate limiting, 4) Validate all inputs, and 5) Keep dependencies updated. Would you like more details on any of these?',
        timestamp: new Date(Date.now() - 21600000).toISOString() // 6 hours ago
      },
      {
        id: '4',
        userId: 'user3',
        userName: 'Sarah Williams',
        userMessage: 'How do I prepare for a coding interview?',
        aiResponse: 'To prepare for a coding interview: 1) Practice algorithms and data structures, 2) Solve problems on platforms like LeetCode, 3) Review system design concepts, 4) Practice explaining your thought process, and 5) Conduct mock interviews. Would you like specific resources?',
        timestamp: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
      },
      {
        id: '5',
        userId: 'user4',
        userName: 'Michael Brown',
        userMessage: 'What\'s the difference between var, let, and const in JavaScript?',
        aiResponse: 'In JavaScript: var has function scope and is hoisted, let has block scope and is not hoisted, and const is like let but cannot be reassigned after declaration. Let and const were introduced in ES6 and are generally preferred over var in modern JavaScript.',
        timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
      }
    ];
  };

  useEffect(() => {
    let filtered = [...chatHistory];

    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.userMessage.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.aiResponse.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply date range filter
    if (dateFilter.start) {
      filtered = filtered.filter(item => 
        new Date(item.timestamp) >= new Date(dateFilter.start)
      );
    }
    if (dateFilter.end) {
      filtered = filtered.filter(item => 
        new Date(item.timestamp) <= new Date(dateFilter.end)
      );
    }

    // Apply user filter
    if (selectedUser) {
      filtered = filtered.filter(item => item.userName === selectedUser);
    }

    setFilteredHistory(filtered);
  }, [searchTerm, dateFilter, selectedUser, chatHistory]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setDateFilter({ start: '', end: '' });
    setSelectedUser('');
  };

  const handleExportData = () => {
    // Create CSV content
    const csvContent = [
      ['User', 'Message', 'AI Response', 'Timestamp'].join(','),
      ...filteredHistory.map(item => [
        item.userName,
        `"${item.userMessage.replace(/"/g, '""')}"`,
        `"${item.aiResponse.replace(/"/g, '""')}"`,
        item.timestamp
      ].join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `chat_interactions_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="chat-interactions-container">
      <div className="chat-interactions-header">
        <h2 className="card-title">User Chat Interactions</h2>
        <p className="card-subtitle">Monitor and analyze user conversations with the AI assistant</p>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button 
              onClick={fetchChatHistory} 
              className="ml-4 text-sm underline"
            >
              Retry
            </button>
          </div>
        )}
        {loading && (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-700"></div>
            <span className="ml-2 text-gray-600">Loading chat history...</span>
          </div>
        )}
      </div>

      <div className="chat-interactions-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search in messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <select 
            value={selectedUser} 
            onChange={(e) => setSelectedUser(e.target.value)}
            className="user-select"
          >
            <option value="">All Users</option>
            {uniqueUsers.map((user, index) => (
              <option key={index} value={user}>{user}</option>
            ))}
          </select>
        </div>

        <div className="filter-group date-filters">
          <input
            type="date"
            value={dateFilter.start}
            onChange={(e) => setDateFilter({...dateFilter, start: e.target.value})}
            className="date-input"
          />
          <span>to</span>
          <input
            type="date"
            value={dateFilter.end}
            onChange={(e) => setDateFilter({...dateFilter, end: e.target.value})}
            className="date-input"
          />
        </div>

        <div className="filter-actions">
          <button onClick={handleClearFilters} className="clear-filters-btn">
            Clear Filters
          </button>
          <button onClick={handleExportData} className="export-data-btn">
            Export Data
          </button>
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="no-interactions">
          <p>No chat interactions found.</p>
          {chatHistory.length > 0 && (
            <p>Try adjusting your filters or wait for users to interact with the chatbot.</p>
          )}
        </div>
      ) : (
        <div className="chat-interactions-list">
          {filteredHistory.map((item, index) => (
            <div key={index} className="chat-interaction-card">
              <div className="interaction-header">
                <div className="user-info">
                  <span className="user-avatar">👤</span>
                  <span className="user-name">{item.userName}</span>
                </div>
                <span className="interaction-time">{formatDate(item.timestamp)}</span>
              </div>
              <div className="interaction-content">
                <div className="user-message">
                  <div className="message-label">User:</div>
                  <div className="message-text">{item.userMessage}</div>
                </div>
                <div className="ai-response">
                  <div className="message-label">AI:</div>
                  <div className="message-text">{item.aiResponse}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="chat-interactions-stats">
        <div className="stat-card">
          <div className="stat-value">{filteredHistory.length}</div>
          <div className="stat-label">Interactions</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{uniqueUsers.length}</div>
          <div className="stat-label">Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {chatHistory.length > 0 
              ? Math.round(filteredHistory.length / uniqueUsers.length * 10) / 10 
              : 0}
          </div>
          <div className="stat-label">Avg. per User</div>
        </div>
      </div>
    </div>
  );
}