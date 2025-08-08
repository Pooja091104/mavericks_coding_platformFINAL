import { useState, useEffect } from "react";
import PropTypes from "prop-types";


export default function SkillProgressTracker({ assessmentResults, onRetakeAssessment = () => {} }) {
  const [skillProgress, setSkillProgress] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);

  // Using useEffect with the calculation logic inside to avoid dependency issues
  useEffect(() => {
    if (assessmentResults) {
      // Calculate progress inside the effect to avoid dependency issues
      const progress = {};
      let totalScore = 0;
      let totalAssessments = 0;

      assessmentResults.forEach(result => {
        const score = result.score || 0;
        progress[result.skill] = {
          score: score,
          completed: true,
          lastTaken: result.timestamp || new Date().toISOString(),
          timeTaken: result.timeTaken || 0,
          weakSkills: result.results?.weak_skills || [],
          recommendations: result.results?.recommendations || []
        };
        
        totalScore += score;
        totalAssessments++;
      });

      setSkillProgress(progress);
      setOverallProgress(totalAssessments > 0 ? Math.round(totalScore / totalAssessments) : 0);
    }
  }, [assessmentResults]);

  // Keep this as a separate function for any other component that might need to call it directly
  const calculateProgress = () => {
    const progress = {};
    let totalScore = 0;
    let totalAssessments = 0;

    assessmentResults.forEach(result => {
      const score = result.score || 0;
      progress[result.skill] = {
        score: score,
        completed: true,
        lastTaken: result.timestamp || new Date().toISOString(),
        timeTaken: result.timeTaken || 0,
        weakSkills: result.results?.weak_skills || [],
        recommendations: result.results?.recommendations || []
      };
      
      totalScore += score;
      totalAssessments++;
    });

    setSkillProgress(progress);
    setOverallProgress(totalAssessments > 0 ? Math.round(totalScore / totalAssessments) : 0);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return "Expert";
    if (score >= 60) return "Intermediate";
    return "Beginner";
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">📊 Skill Assessment Progress</h3>
        <div className="text-right">
          <div className={`text-2xl font-bold ${getScoreColor(overallProgress)}`}>
            {overallProgress}%
          </div>
          <div className="text-sm text-gray-600">Overall Score</div>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
        <div 
          className={`h-3 rounded-full transition-all duration-300 ${
            overallProgress >= 80 ? 'bg-green-500' : 
            overallProgress >= 60 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${overallProgress}%` }}
        ></div>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {Object.keys(skillProgress).length}
          </div>
          <div className="text-sm text-gray-600">Skills Assessed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {Object.values(skillProgress).filter(skill => skill.score >= 80).length}
          </div>
          <div className="text-sm text-gray-600">Expert Level</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {Object.values(skillProgress).filter(skill => skill.score >= 60 && skill.score < 80).length}
          </div>
          <div className="text-sm text-gray-600">Intermediate</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {Object.values(skillProgress).filter(skill => skill.score < 60).length}
          </div>
          <div className="text-sm text-gray-600">Needs Improvement</div>
        </div>
      </div>

      {/* Skill Details */}
      <div className="space-y-4">
        {Object.entries(skillProgress).map(([skill, data]) => (
          <div key={skill} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <h4 className="font-semibold text-gray-800">{skill}</h4>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getScoreBadge(data.score)}`}>
                  {getScoreLabel(data.score)}
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className={`text-lg font-bold ${getScoreColor(data.score)}`}>
                    {data.score}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatTime(data.timeTaken)}
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    if (typeof onRetakeAssessment !== "function") {
                      console.warn("onRetakeAssessment is not a function!", onRetakeAssessment);
                      return;
                    }
                    onRetakeAssessment(skill);
                  }}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                >
                  Retake
                </button>
              </div>
            </div>

            {/* Skill Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  data.score >= 80 ? 'bg-green-500' : 
                  data.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${data.score}%` }}
              ></div>
            </div>

            {/* Additional Info */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Last taken: {formatDate(data.lastTaken)}</span>
              {data.weakSkills && data.weakSkills.length > 0 && (
                <span className="text-red-600">
                  {data.weakSkills.length} area{data.weakSkills.length > 1 ? 's' : ''} for improvement
                </span>
              )}
            </div>

            {/* Weak Skills Summary */}
            {data.weakSkills && data.weakSkills.length > 0 && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                <h5 className="text-sm font-medium text-red-800 mb-2">Areas for Improvement:</h5>
                <div className="flex flex-wrap gap-1">
                  {data.weakSkills.slice(0, 3).map((weakSkill, index) => (
                    <span 
                      key={index} 
                      className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs rounded"
                    >
                      {weakSkill}
                    </span>
                  ))}
                  {data.weakSkills.length > 3 && (
                    <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                      +{data.weakSkills.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {Object.keys(skillProgress).length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📝</div>
          <h4 className="text-lg font-semibold text-gray-800 mb-2">No Assessments Taken Yet</h4>
          <p className="text-gray-600">Complete your first skill assessment to see your progress here.</p>
        </div>
      )}
    </div>
  );
}