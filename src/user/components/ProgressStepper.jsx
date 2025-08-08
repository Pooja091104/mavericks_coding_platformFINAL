import React, { useState } from 'react';

export default function ProgressStepper({ currentStep, steps = [] }) {
  const [tooltipVisible, setTooltipVisible] = useState(null);
  
  // Default steps if none provided
  const defaultSteps = [
    {
      id: 1,
      name: 'Profile Loaded',
      description: 'Your profile has been analyzed',
      completed: currentStep > 1,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
      details: 'AI has analyzed your profile and identified key skills and areas for improvement.'
    },
    {
      id: 2,
      name: 'Assessment',
      description: 'Skill assessment completed',
      completed: currentStep > 2,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      details: 'Your skills have been assessed and scored based on your performance.'
    },
    {
      id: 3,
      name: 'Recommendations',
      description: 'Learning resources recommended',
      completed: currentStep > 3,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
      details: 'Personalized learning resources have been recommended based on your assessment results.'
    },
    {
      id: 4,
      name: 'Learning Path',
      description: 'Learning path generated',
      completed: currentStep > 4,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
      details: 'A customized learning path has been created to help you achieve your goals.'
    },
    {
      id: 5,
      name: 'Completion',
      description: 'Ready for hackathons',
      completed: currentStep > 5,
      timestamp: currentStep > 5 ? new Date().toISOString() : null,
      details: 'You are now ready to participate in hackathons and apply your skills.'
    }
  ];

  const displaySteps = steps.length > 0 ? steps : defaultSteps;
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="relative mb-8 bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Your Learning Journey</h3>
      
      <div className="flex items-center justify-between mb-8">
        {displaySteps.map((step, index) => (
          <div key={index} className="flex flex-col items-center relative">
            {/* Tooltip */}
            {tooltipVisible === index && (
              <div className="absolute bottom-full mb-2 w-48 bg-gray-800 text-white text-xs rounded py-2 px-3 shadow-lg z-10">
                <p className="font-semibold mb-1">{step.name}</p>
                <p className="mb-1">{step.description}</p>
                {step.timestamp && (
                  <p className="text-gray-300 text-xs">{formatDate(step.timestamp)}</p>
                )}
                <p className="mt-1 text-xs">{step.details}</p>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
              </div>
            )}
            
            {/* Step Circle */}
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium cursor-pointer transition-all duration-200 hover:scale-110 ${
                step.completed
                  ? 'bg-green-500 text-white'
                  : index < currentStep
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
              onMouseEnter={() => setTooltipVisible(index)}
              onMouseLeave={() => setTooltipVisible(null)}
            >
              {step.completed ? '✓' : index + 1}
            </div>
            
            {/* Step Label */}
            <div className="mt-2 text-center">
              <p className={`text-sm font-medium ${
                step.completed
                  ? 'text-green-600'
                  : index < currentStep
                  ? 'text-blue-600'
                  : 'text-gray-500'
              }`}>
                {step.name}
              </p>
              {step.timestamp && (
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(step.timestamp).split(',')[0]}
                </p>
              )}
            </div>
            
            {/* Connector Line */}
            {index < displaySteps.length - 1 && (
              <div className="absolute top-5 left-10 w-full h-0.5 -z-10">
                <div className={`h-full ${
                  step.completed ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{Math.round((currentStep / displaySteps.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / displaySteps.length) * 100}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2 text-center">
          Step {currentStep} of {steps.length} completed
        </p>
      </div>
    </div>
  );
}
