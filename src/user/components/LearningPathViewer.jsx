import { useState, useEffect } from 'react';
import LearningPathTable from './LearningPathTable';

export default function LearningPathViewer({ userProfile }) {
  const [learningPath, setLearningPath] = useState([]);
  const [completionStats, setCompletionStats] = useState({
    totalModules: 0,
    completedModules: 0,
    inProgressModules: 0,
    notStartedModules: 0,
    estimatedTimeRemaining: 0
  });
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    // In a real app, this would fetch from an API
    // For demo, we'll use mock data with timestamps
    const mockLearningPath = [
      { 
        id: 1,
        name: "JavaScript Essentials", 
        time: "3", 
        status: "Completed", 
        progress: 100,
        description: "Master JavaScript fundamentals including variables, functions, and DOM manipulation",
        topics: ["Variables & Data Types", "Functions & Scope", "DOM Manipulation", "ES6 Features"],
        difficulty: "Beginner",
        completedAt: "2023-12-15T14:30:00Z",
        startedAt: "2023-12-10T09:15:00Z"
      },
      { 
        id: 2,
        name: "React Basics", 
        time: "4", 
        status: "Completed", 
        progress: 100,
        description: "Learn React fundamentals and build your first components",
        topics: ["Components & Props", "State Management", "Hooks", "Event Handling"],
        difficulty: "Intermediate",
        completedAt: "2023-12-28T16:45:00Z",
        startedAt: "2023-12-20T10:30:00Z"
      },
      { 
        id: 3,
        name: "Advanced Node.js", 
        time: "5", 
        status: "In Progress", 
        progress: 65,
        description: "Build scalable backend applications with Node.js and Express",
        topics: ["Express Framework", "Middleware", "Database Integration", "API Design"],
        difficulty: "Advanced",
        startedAt: "2024-01-05T11:20:00Z",
        lastAccessedAt: "2024-01-10T15:10:00Z"
      },
      { 
        id: 4,
        name: "Database Design", 
        time: "4", 
        status: "Not Started", 
        progress: 0,
        description: "Learn database design principles and SQL fundamentals",
        topics: ["Database Normalization", "SQL Queries", "Indexing", "Performance Optimization"],
        difficulty: "Intermediate"
      },
      { 
        id: 5,
        name: "Cloud Deployment", 
        time: "3", 
        status: "Not Started", 
        progress: 0,
        description: "Deploy applications to cloud platforms like AWS and Azure",
        topics: ["AWS Services", "Containerization", "CI/CD Pipelines", "Serverless Architecture"],
        difficulty: "Advanced"
      },
      { 
        id: 6,
        name: "UI/UX Fundamentals", 
        time: "2", 
        status: "Not Started", 
        progress: 0,
        description: "Learn principles of good UI/UX design",
        topics: ["Design Principles", "Wireframing", "User Testing", "Accessibility"],
        difficulty: "Beginner"
      }
    ];

    setLearningPath(mockLearningPath);
    setLastUpdated(new Date().toISOString());

    // Calculate completion stats
    const completed = mockLearningPath.filter(m => m.status === 'Completed').length;
    const inProgress = mockLearningPath.filter(m => m.status === 'In Progress').length;
    const notStarted = mockLearningPath.filter(m => m.status === 'Not Started').length;
    
    // Calculate estimated time remaining (only count not started modules and remaining time for in-progress)
    const notStartedTime = mockLearningPath
      .filter(m => m.status === 'Not Started')
      .reduce((sum, m) => sum + parseInt(m.time), 0);
    
    const inProgressRemainingTime = mockLearningPath
      .filter(m => m.status === 'In Progress')
      .reduce((sum, m) => sum + (parseInt(m.time) * (100 - m.progress) / 100), 0);
    
    setCompletionStats({
      totalModules: mockLearningPath.length,
      completedModules: completed,
      inProgressModules: inProgress,
      notStartedModules: notStarted,
      estimatedTimeRemaining: Math.round(notStartedTime + inProgressRemainingTime)
    });
  }, [userProfile]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">Your Learning Path</h3>
        <div className="text-sm text-gray-500">
          Last updated: {formatDate(lastUpdated)}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-600 font-medium">Completion</p>
          <p className="text-2xl font-bold text-blue-700">
            {Math.round((completionStats.completedModules / completionStats.totalModules) * 100)}%
          </p>
          <p className="text-xs text-blue-500 mt-1">
            {completionStats.completedModules} of {completionStats.totalModules} modules
          </p>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-green-600 font-medium">Completed</p>
          <p className="text-2xl font-bold text-green-700">{completionStats.completedModules}</p>
          <p className="text-xs text-green-500 mt-1">modules</p>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <p className="text-sm text-yellow-600 font-medium">In Progress</p>
          <p className="text-2xl font-bold text-yellow-700">{completionStats.inProgressModules}</p>
          <p className="text-xs text-yellow-500 mt-1">modules</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-sm text-purple-600 font-medium">Time Remaining</p>
          <p className="text-2xl font-bold text-purple-700">{completionStats.estimatedTimeRemaining}</p>
          <p className="text-xs text-purple-500 mt-1">hours</p>
        </div>
      </div>

      {/* Learning Path Table */}
      <LearningPathTable modules={learningPath} />
    </div>
  );
}