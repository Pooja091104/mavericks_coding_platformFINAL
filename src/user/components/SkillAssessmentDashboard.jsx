import { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import SkillAssessment from "./SkillAssessment";
import VideoRecommendations from "./VideoRecommendations";
import SkillProgressTracker from "./SkillProgressTracker";
import LearningPathCompletion from "./LearningPathCompletion";

export default function SkillAssessmentDashboard() {
  const [assessmentResults, setAssessmentResults] = useState([]);
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [showAssessment, setShowAssessment] = useState(false);
  const [weakSkills, setWeakSkills] = useState([]);
  const [completedVideos, setCompletedVideos] = useState([]);
  const [activeTab, setActiveTab] = useState("progress"); // progress, assessments, videos
  const [showCompletion, setShowCompletion] = useState(false);

  // Available skills for assessment
  const availableSkills = [
    "JavaScript",
    "Python", 
    "React",
    "Node.js",
    "Database Design",
    "HTML/CSS",
    "Git",
    "API Development"
  ];

  useEffect(() => {
    // Real-time Firestore listener for assessments
    const assessmentsQuery = collection(db, 'assessments');
    const unsubscribe = onSnapshot(assessmentsQuery, (snapshot) => {
      const results = [];
      snapshot.forEach(doc => {
        results.push({ id: doc.id, ...doc.data() });
      });
      setAssessmentResults(results);
    });

    // Load completed videos from localStorage
    const savedVideos = localStorage.getItem("completedVideos");
    if (savedVideos) {
      setCompletedVideos(JSON.parse(savedVideos));
    }
    return () => unsubscribe();
  }, []);



  useEffect(() => {
    // Save completed videos to localStorage
    localStorage.setItem("completedVideos", JSON.stringify(completedVideos));
  }, [completedVideos]);

  // Check if learning path is completed
  useEffect(() => {
    const allSkillsAssessed = assessmentResults.length === availableSkills.length;
    const allVideosCompleted = completedVideos.length >= weakSkills.length;
    const highScores = assessmentResults.filter(result => (result.score || 0) >= 80).length;
    
    // Show completion if all skills assessed, videos completed, and high scores achieved
    if (allSkillsAssessed && allVideosCompleted && highScores >= availableSkills.length * 0.8) {
      setShowCompletion(true);
    }
  }, [assessmentResults, completedVideos, weakSkills]);

  const handleAssessmentComplete = (result) => {
    const newResult = {
      ...result,
      timestamp: new Date().toISOString(),
      id: Date.now()
    };

    setAssessmentResults(prev => {
      // Replace existing result for same skill or add new one
      const filtered = prev.filter(r => r.skill !== result.skill);
      return [...filtered, newResult];
    });

    // Extract weak skills for video recommendations
    if (result.results && result.results.weak_skills) {
      setWeakSkills(prev => {
        const newWeakSkills = [...prev];
        result.results.weak_skills.forEach(skill => {
          if (!newWeakSkills.includes(skill)) {
            newWeakSkills.push(skill);
          }
        });
        return newWeakSkills;
      });
    }

    setShowAssessment(false);
    setCurrentAssessment(null);
  };

  const handleStartAssessment = (skill) => {
  console.log('Starting assessment for skill:', skill);
  setCurrentAssessment(skill);
  setShowAssessment(true);
  };

  const handleRetakeAssessment = (skill) => {
    handleStartAssessment(skill);
  };

  const handleVideoComplete = (video) => {
    setCompletedVideos(prev => {
      const exists = prev.find(v => v.id === video.id);
      if (!exists) {
        return [...prev, { ...video, completedAt: new Date().toISOString() }];
      }
      return prev;
    });
  };

  const getOverallProgress = () => {
    if (assessmentResults.length === 0) return 0;
    const totalScore = assessmentResults.reduce((sum, result) => sum + (result.score || 0), 0);
    return Math.round(totalScore / assessmentResults.length);
  };

  const getCompletedSkillsCount = () => {
    return assessmentResults.filter(result => (result.score || 0) >= 80).length;
  };

  const getSkillsNeedingImprovement = () => {
    return assessmentResults.filter(result => (result.score || 0) < 60).length;
  };

  // Show completion page if learning path is finished
  if (showCompletion) {
    return (
      <LearningPathCompletion 
        assessmentResults={assessmentResults}
        completedVideos={completedVideos}
        onReset={() => {
          setShowCompletion(false);
          setAssessmentResults([]);
          setCompletedVideos([]);
          setWeakSkills([]);
          localStorage.removeItem("assessmentResults");
          localStorage.removeItem("completedVideos");
        }}
      />
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Skill Assessment Dashboard</h1>
          <p className="text-gray-600">Track your progress, take assessments, and improve your skills</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overall Score</p>
                <p className="text-2xl font-bold text-blue-600">{getOverallProgress()}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Skills Assessed</p>
                <p className="text-2xl font-bold text-green-600">{assessmentResults.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expert Level</p>
                <p className="text-2xl font-bold text-yellow-600">{getCompletedSkillsCount()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-full">
                <span className="text-2xl">📚</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Videos Completed</p>
                <p className="text-2xl font-bold text-red-600">{completedVideos.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress to Completion */}
        {assessmentResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">🎯 Learning Path Progress</h3>
              <span className="text-sm text-gray-600">
                {assessmentResults.length}/{availableSkills.length} skills assessed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(assessmentResults.length / availableSkills.length) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {availableSkills.length - assessmentResults.length} skills remaining to complete your learning path
            </p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("progress")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "progress"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                📊 Progress Tracker
              </button>
              <button
                onClick={() => setActiveTab("assessments")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "assessments"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                📝 Skill Assessments
              </button>
              <button
                onClick={() => setActiveTab("videos")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "videos"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                📚 Video Recommendations
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Progress Tab */}
            {activeTab === "progress" && (
              <SkillProgressTracker
                assessmentResults={assessmentResults}
                onRetakeAssessment={handleRetakeAssessment}
              />
            )}

            {/* Assessments Tab */}
            {activeTab === "assessments" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Available Skill Assessments</h3>
                  <p className="text-sm text-gray-600">
                    {assessmentResults.length} of {availableSkills.length} completed
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableSkills.map((skill) => {
                    const existingResult = assessmentResults.find(r => r.skill === skill);
                    const isCompleted = !!existingResult;
                    const score = existingResult?.score || 0;

                    return (
                      <div
                        key={skill}
                        className={`border rounded-lg p-6 transition-all duration-200 ${
                          isCompleted
                            ? "border-green-200 bg-green-50"
                            : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-gray-800">{skill}</h4>
                          {isCompleted && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {score}%
                            </span>
                          )}
                        </div>

                        {isCompleted ? (
                          <div className="space-y-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : "bg-red-500"
                                }`}
                                style={{ width: `${score}%` }}
                              ></div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleRetakeAssessment(skill)}
                                className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                              >
                                Retake
                              </button>
                              <button
                                onClick={() => {
                                  // View detailed results
                                  setActiveTab("progress");
                                }}
                                className="flex-1 px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartAssessment(skill)}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium"
                          >
                            Start Assessment
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Videos Tab */}
            {activeTab === "videos" && (
              <VideoRecommendations
                weakSkills={weakSkills}
                onVideoComplete={handleVideoComplete}
              />
            )}
          </div>
        </div>
      </div>

      {/* Assessment Modal */}
      {showAssessment && currentAssessment && (
        <div style={{ zIndex: 9999, position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)' }}>
          <SkillAssessment
            skill={currentAssessment}
            onComplete={handleAssessmentComplete}
            onClose={() => {
              setShowAssessment(false);
              setCurrentAssessment(null);
            }}
          />
        </div>
      )}
    </div>
  );
} 