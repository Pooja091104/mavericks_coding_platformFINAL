import { useState, useEffect, useCallback } from "react";
import VideoRecorder from "./VideoRecorder";

export default function SkillAssessment({ skill, onComplete, onClose }) {
  const [assessment, setAssessment] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [results, setResults] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes per assessment
  const [timerActive, setTimerActive] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [showVideoRecorder, setShowVideoRecorder] = useState(false);
  const [recordedVideos, setRecordedVideos] = useState([]);

  // Define handleSubmitAssessment with useCallback to avoid dependency issues
  const handleSubmitAssessment = useCallback(async () => {
    setTimerActive(false);
    setLoading(true);

    try {
      const timeTaken = startTime ? Math.floor((Date.now() - startTime) / 1000 / 60) : 0; // in minutes

      const response = await fetch("http://127.0.0.1:8002/submit_assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assessment_id: assessment?.assessment_id,
          answers: answers,
          time_taken: timeTaken
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.success || !data.analysis) {
        throw new Error("Failed to analyze assessment results");
      }

      setResults(data.analysis);
      setAssessmentComplete(true);
      
      // Process results for comprehensive assessment
      if (skill === "comprehensive") {
        // Calculate scores for each skill based on questions
        const skillScores = {};
        const questions = assessment?.questions || [];
        
        // Group questions by skill
        const questionsBySkill = {};
        questions.forEach(q => {
          if (!questionsBySkill[q.skill]) {
            questionsBySkill[q.skill] = [];
          }
          questionsBySkill[q.skill].push(q);
        });
        
        // Calculate score for each skill
        Object.entries(questionsBySkill).forEach(([skillName, skillQuestions]) => {
          let correctCount = 0;
          
          skillQuestions.forEach(q => {
            if (answers[q.id] === q.correct_answer) {
              correctCount++;
            }
          });
          
          const skillScore = Math.round((correctCount / skillQuestions.length) * 100);
          skillScores[skillName] = skillScore;
        });
        
        // Add skill scores to analysis
        data.analysis.skillScores = skillScores;
        
        // Call parent callback with comprehensive results
        if (onComplete) {
          onComplete({
            skill: "comprehensive",
            score: data.analysis.score,
            results: data.analysis,
            timeTaken: timeTaken
          });
        }
      } else {
        // Call parent callback with single skill results
        if (onComplete) {
          onComplete({
            skill,
            score: data.analysis.score,
            results: data.analysis,
            timeTaken: timeTaken
          });
        }
      }
    } catch (err) {
      setError(`Failed to submit assessment: ${err.message}`);
      console.error("Error submitting assessment:", err);
    } finally {
      setLoading(false);
    }
  }, [assessment, answers, onComplete, skill, startTime]);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setTimerActive(false);
            handleSubmitAssessment();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, handleSubmitAssessment]);

  // Load assessment when component mounts
  useEffect(() => {
    generateAssessment();
  }, [skill]);

  const generateAssessment = async () => {
    setLoading(true);
    setError("");
    
    try {
      // Get all skills from localStorage if this is a comprehensive assessment
      let skillsToAssess = [];
      
      if (skill === "comprehensive") {
        const userProfile = localStorage.getItem("userProfile");
        if (userProfile) {
          const parsedProfile = JSON.parse(userProfile);
          skillsToAssess = parsedProfile.skills || [];
        }
      } else {
        skillsToAssess = [skill];
      }
      
      if (skillsToAssess.length === 0) {
        throw new Error("No skills found to assess");
      }
      
      const response = await fetch("http://127.0.0.1:8002/generate_assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skills: skillsToAssess,
          difficulty: "intermediate"
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.success || !data.assessment) {
        throw new Error("Failed to generate assessment");
      }

      setAssessment(data.assessment);
      setStartTime(Date.now());
      setTimerActive(true);
    } catch (err) {
      setError(`Failed to generate assessment: ${err.message}`);
      console.error("Error generating assessment:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < assessment.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // handleSubmitAssessment is now defined above with useCallback

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Generating Assessment</h3>
            <p className="text-gray-600">Creating personalized questions for {skill}...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold mb-2 text-red-600">Assessment Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={generateAssessment}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (assessmentComplete && results) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold mb-2">Assessment Complete!</h3>
            <p className="text-gray-600">Your {skill} assessment results</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getScoreColor(results.score)}`}>
                  {results.score}%
                </div>
                <div className="text-sm text-gray-600">Overall Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {formatTime(600 - timeLeft)}
                </div>
                <div className="text-sm text-gray-600">Time Taken</div>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className={`h-2 rounded-full ${results.score >= 80 ? 'bg-green-500' : results.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${results.score}%` }}
              ></div>
            </div>
          </div>

          {results.score < 40 && results.weak_skills && results.weak_skills.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold mb-3 text-red-600">⚠️ Areas for Improvement:</h4>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <ul className="list-disc list-inside space-y-1">
                  {results.weak_skills.map((weakSkill, index) => (
                    <li key={index} className="text-sm">{weakSkill}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {results.score < 40 && results.recommendations && results.recommendations.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold mb-3 text-blue-600">📚 Recommended Videos:</h4>
              <div className="space-y-3">
                {results.recommendations.map((rec, index) => (
                  <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-medium text-blue-800 mb-1">{rec.video_title}</h5>
                    <p className="text-sm text-blue-700 mb-2">{rec.description}</p>
                    <div className="flex gap-2">
                      <a 
                        href={rec.video_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Watch Video
                      </a>
                      <button
                        onClick={() => {
                          // Mark video as completed
                          if (onComplete) {
                            const timeTaken = startTime ? Math.floor((Date.now() - startTime) / 1000 / 60) : 0; // in minutes
                            onComplete({
                              skill,
                              score: results.score,
                              results: results,
                              timeTaken: timeTaken,
                              completedVideo: rec
                            });
                          }
                        }}
                        className="inline-block px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Mark Complete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.improvement_plan && (
            <div className="mb-6">
              <h4 className="font-semibold mb-3 text-green-600">📋 Improvement Plan:</h4>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm">{results.improvement_plan}</p>
              </div>
            </div>
          )}

          {/* Video Recording Section for Weak Skills */}
          {results.score < 40 && (
            <div className="mb-6">
              <h4 className="font-semibold mb-3 text-purple-600">🎥 Record Skill Demonstration:</h4>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm text-purple-700 mb-3">
                  Record a video demonstrating your {skill} skills to show your practical knowledge.
                </p>
                
                {recordedVideos.length > 0 && (
                  <div className="mb-4">
                    <h5 className="font-medium text-purple-800 mb-2">📹 Recorded Videos:</h5>
                    <div className="space-y-2">
                      {recordedVideos.map((video, index) => (
                        <div key={index} className="bg-white p-3 rounded border">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{video.skill} Demonstration</span>
                            <span className="text-xs text-gray-500">
                              {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                            </span>
                          </div>
                          <video 
                            src={`http://127.0.0.1:8002${video.videoUrl}`}
                            controls 
                            className="w-full h-32 object-cover rounded mt-2"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <button
                  onClick={() => setShowVideoRecorder(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 font-semibold"
                >
                  🎬 Record Video Demonstration
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-center">
            <button
              onClick={() => {
                // Reset for retake
                setAssessment(null);
                setCurrentQuestionIndex(0);
                setAnswers({});
                setAssessmentComplete(false);
                setResults(null);
                setTimeLeft(600);
                setStartTime(null);
                generateAssessment();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retake Assessment
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!assessment || !assessment.questions) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-yellow-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold mb-2">No Assessment Generated</h3>
            <p className="text-gray-600 mb-4">Unable to generate assessment for {skill}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = assessment.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / assessment.questions.length) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold">{skill} Assessment</h3>
            <p className="text-gray-600">Question {currentQuestionIndex + 1} of {assessment.questions.length}</p>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-blue-600'}`}>
              {formatTime(timeLeft)}
            </div>
            <div className="text-sm text-gray-600">Time Remaining</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <div className="bg-gray-50 rounded-lg p-6 mb-4">
            <div className="mb-3">
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                {currentQuestion.skill}
              </span>
            </div>
            <h4 className="font-semibold text-lg mb-3">
              {currentQuestion.question}
            </h4>
            
            <div className="space-y-2">
              {currentQuestion.options.map((option, index) => (
                <label key={index} className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-gray-100">
                  <input
                    type="radio"
                    name={`question_${currentQuestion.id}`}
                    value={option}
                    checked={answers[currentQuestion.id] === option}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex gap-2">
            {currentQuestionIndex === assessment.questions.length - 1 ? (
              <button
                onClick={handleSubmitAssessment}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold"
              >
                Submit Assessment
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Next
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Exit
          </button>
        </div>

        {/* Question Navigation Dots */}
        <div className="flex justify-center mt-6 space-x-2">
          {assessment.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-3 h-3 rounded-full ${
                index === currentQuestionIndex 
                  ? 'bg-blue-600' 
                  : answers[assessment.questions[index].id] 
                    ? 'bg-green-500' 
                    : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
      
      {/* Video Recorder Modal */}
      {showVideoRecorder && (
        <VideoRecorder
          skill={skill}
          onVideoRecorded={(videoData) => {
            setRecordedVideos(prev => [...prev, videoData]);
            setShowVideoRecorder(false);
          }}
          onClose={() => setShowVideoRecorder(false)}
        />
      )}
    </div>
  );
}
