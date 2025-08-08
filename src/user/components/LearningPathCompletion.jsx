import { useState } from "react";

export default function LearningPathCompletion({ assessmentResults, completedVideos, onReset }) {
  const [showCertificate, setShowCertificate] = useState(false);
  const [showNextSteps, setShowNextSteps] = useState(false);

  const getOverallScore = () => {
    if (assessmentResults.length === 0) return 0;
    const totalScore = assessmentResults.reduce((sum, result) => sum + (result.score || 0), 0);
    return Math.round(totalScore / assessmentResults.length);
  };

  const getExpertSkills = () => {
    return assessmentResults.filter(result => (result.score || 0) >= 80);
  };

  const getImprovementAreas = () => {
    return assessmentResults.filter(result => (result.score || 0) < 80);
  };

  const generateCertificate = () => {
    setShowCertificate(true);
  };

  const downloadCertificate = () => {
    // Create a simple certificate download
    const certificateData = {
      name: "Learning Path Completion Certificate",
      date: new Date().toLocaleDateString(),
      score: getOverallScore(),
      skills: assessmentResults.map(r => r.skill),
      videosCompleted: completedVideos.length
    };
    
    const blob = new Blob([JSON.stringify(certificateData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'learning-path-certificate.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Congratulations!</h1>
          <p className="text-xl text-gray-600 mb-8">
            You've successfully completed your learning path and mastered all the required skills!
          </p>
        </div>

        {/* Achievement Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl mb-2">🏆</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Overall Score</h3>
            <p className="text-3xl font-bold text-green-600">{getOverallScore()}%</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl mb-2">📚</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Skills Mastered</h3>
            <p className="text-3xl font-bold text-blue-600">{assessmentResults.length}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl mb-2">🎬</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Videos Completed</h3>
            <p className="text-3xl font-bold text-purple-600">{completedVideos.length}</p>
          </div>
        </div>

        {/* Skills Breakdown */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Skills Breakdown</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Expert Skills */}
            <div>
              <h3 className="text-lg font-semibold text-green-600 mb-4 flex items-center">
                <span className="mr-2">✅</span>
                Expert Level Skills
              </h3>
              <div className="space-y-3">
                {getExpertSkills().map((skill, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">{skill.skill}</span>
                    <span className="text-green-600 font-bold">{skill.score}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Improvement Areas */}
            <div>
              <h3 className="text-lg font-semibold text-yellow-600 mb-4 flex items-center">
                <span className="mr-2">📈</span>
                Areas for Improvement
              </h3>
              <div className="space-y-3">
                {getImprovementAreas().map((skill, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <span className="font-medium">{skill.skill}</span>
                    <span className="text-yellow-600 font-bold">{skill.score}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={generateCertificate}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-300 shadow-lg"
          >
            🏆 Generate Certificate
          </button>
          
          <button
            onClick={() => setShowNextSteps(true)}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg"
          >
            🚀 Next Steps
          </button>
          
          <button
            onClick={onReset}
            className="px-8 py-4 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600 transition-all duration-300 shadow-lg"
          >
            🔄 Start New Path
          </button>
        </div>

        {/* Certificate Modal */}
        {showCertificate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">🏆</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Certificate of Completion</h2>
                <p className="text-gray-600">Congratulations on completing your learning path!</p>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">AI-Powered Learning Platform</h3>
                  <p className="text-gray-600 mb-4">Certificate of Achievement</p>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>Overall Score: {getOverallScore()}%</p>
                    <p>Skills Mastered: {assessmentResults.length}</p>
                    <p>Videos Completed: {completedVideos.length}</p>
                    <p>Date: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 justify-center">
                <button
                  onClick={downloadCertificate}
                  className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Download Certificate
                </button>
                <button
                  onClick={() => setShowCertificate(false)}
                  className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps Modal */}
        {showNextSteps && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">🚀</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">What's Next?</h2>
                <p className="text-gray-600">Continue your learning journey with these next steps</p>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                  <span className="text-2xl">💼</span>
                  <div>
                    <h3 className="font-semibold text-gray-800">Build Real Projects</h3>
                    <p className="text-sm text-gray-600">Apply your skills by building portfolio projects</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                  <span className="text-2xl">🤝</span>
                  <div>
                    <h3 className="font-semibold text-gray-800">Join Hackathons</h3>
                    <p className="text-sm text-gray-600">Participate in coding competitions and challenges</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
                  <span className="text-2xl">📚</span>
                  <div>
                    <h3 className="font-semibold text-gray-800">Advanced Learning</h3>
                    <p className="text-sm text-gray-600">Explore advanced topics and specializations</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <h3 className="font-semibold text-gray-800">Career Preparation</h3>
                    <p className="text-sm text-gray-600">Prepare for technical interviews and job applications</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowNextSteps(false)}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Got It!
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 