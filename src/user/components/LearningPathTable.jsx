import { useState } from 'react';

export default function LearningPathTable({ modules = [] }) {
  const [selectedModule, setSelectedModule] = useState(null);

  // Default modules if none provided
  const defaultModules = [
    { 
      name: "JavaScript Essentials", 
      time: "3 hrs", 
      status: "Completed", 
      progress: 100,
      description: "Master JavaScript fundamentals including variables, functions, and DOM manipulation",
      topics: ["Variables & Data Types", "Functions & Scope", "DOM Manipulation", "ES6 Features"],
      difficulty: "Beginner"
    },
    { 
      name: "React Basics", 
      time: "4 hrs", 
      status: "Completed", 
      progress: 100,
      description: "Learn React fundamentals and build your first components",
      topics: ["Components & Props", "State Management", "Hooks", "Event Handling"],
      difficulty: "Intermediate"
    },
    { 
      name: "Advanced Node.js", 
      time: "5 hrs", 
      status: "In Progress", 
      progress: 65,
      description: "Build scalable backend applications with Node.js and Express",
      topics: ["Express Framework", "Middleware", "Database Integration", "API Design"],
      difficulty: "Advanced"
    },
    { 
      name: "Database Design", 
      time: "4 hrs", 
      status: "Not Started", 
      progress: 0,
      description: "Learn database design principles and SQL fundamentals",
      topics: ["Database Normalization", "SQL Queries", "Indexing", "Performance Optimization"],
      difficulty: "Intermediate"
    }
  ];

  const displayModules = modules.length > 0 ? modules : defaultModules;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Not Started':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Learning Modules</h3>
          <p className="text-sm text-gray-600">
            {displayModules.filter(m => m.status === 'Completed').length} of {displayModules.length} completed
          </p>
        </div>
        <div className="text-sm text-gray-600">
          Total Time: {displayModules.reduce((sum, m) => sum + parseInt(m.time), 0)} hrs
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm text-gray-600">
            {Math.round(displayModules.reduce((sum, m) => sum + m.progress, 0) / displayModules.length)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${displayModules.reduce((sum, m) => sum + m.progress, 0) / displayModules.length}%` 
            }}
          ></div>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayModules.map((module, index) => (
          <div
            key={index}
            className={`border rounded-lg p-6 transition-all duration-200 cursor-pointer hover:shadow-md ${
              module.status === 'Completed' 
                ? 'border-green-200 bg-green-50' 
                : module.status === 'In Progress'
                ? 'border-blue-200 bg-blue-50'
                : 'border-gray-200 bg-white'
            }`}
            onClick={() => setSelectedModule(module)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-2">{module.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{module.description}</p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(module.status)}`}>
                  {module.status}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">{module.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    module.status === 'Completed' 
                      ? 'bg-green-500' 
                      : module.status === 'In Progress'
                      ? 'bg-blue-500'
                      : 'bg-gray-300'
                  }`}
                  style={{ width: `${module.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Module Details */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <span className="mr-1">⏱️</span>
                  {module.time}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(module.difficulty)}`}>
                  {module.difficulty}
                </span>
              </div>
              <button className="text-blue-600 hover:text-blue-700 font-medium">
                {module.status === 'Completed' ? 'Review' : 'Start'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Module Detail Modal */}
      {selectedModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">{selectedModule.name}</h3>
              <button
                onClick={() => setSelectedModule(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Module Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">⏱️</div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-semibold text-gray-800">{selectedModule.time}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">📊</div>
                  <p className="text-sm text-gray-600">Progress</p>
                  <p className="font-semibold text-gray-800">{selectedModule.progress}%</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">🎯</div>
                  <p className="text-sm text-gray-600">Difficulty</p>
                  <p className="font-semibold text-gray-800">{selectedModule.difficulty}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
                <p className="text-gray-600">{selectedModule.description}</p>
              </div>

              {/* Topics */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Topics Covered</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedModule.topics.map((topic, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-gray-700">{topic}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                {selectedModule.status === 'Completed' ? (
                  <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors">
                    Review Module
                  </button>
                ) : selectedModule.status === 'In Progress' ? (
                  <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
                    Continue Learning
                  </button>
                ) : (
                  <button className="flex-1 bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors">
                    Start Module
                  </button>
                )}
                <button 
                  onClick={() => setSelectedModule(null)}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
