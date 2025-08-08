import { useState, useEffect } from "react";
import SkillAssessment from "./SkillAssessment";
import ProgressStepper from "./ProgressStepper";
import VideoRecommendations from "./VideoRecommendations";
import SkillProgressTracker from "./SkillProgressTracker";
import { uploadResume, updateUserProfile, getUserProfile } from "../../firebaseConfig";

export default function ResumeUploader({ onResumeUpload }) {
  const [files, setFiles] = useState([]);
  // Don't load resume profiles from localStorage, only initialize with empty array
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [skillsExtracted, setSkillsExtracted] = useState(() => {
    return localStorage.getItem("skillsExtracted") === "true";
  });
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState([]);
  const [weakSkills, setWeakSkills] = useState(() => {
    const savedWeakSkills = localStorage.getItem("weakSkills");
    return savedWeakSkills ? JSON.parse(savedWeakSkills) : [];
  });
  const [completedVideos, setCompletedVideos] = useState([]);
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem("resumeActiveTab");
    return savedTab || "resume"; // resume, assessment, videos, progress
  });

  const progressSteps = [
    { label: "Resume Upload", completed: resumeUploaded },
    { label: "Skills Extraction", completed: skillsExtracted },
    { label: "Skill Assessment", completed: assessmentResults.length > 0 },
    { label: "Video Learning", completed: completedVideos.length > 0 }
  ];
  
  // Load saved data from Firebase and localStorage on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Get current user from localStorage if available
        const userString = localStorage.getItem("user");
        const user = userString ? JSON.parse(userString) : null;
        
        if (user && user.uid) {
          // Get user profile from Firebase
          const userProfile = await getUserProfile(user.uid);
          
          if (userProfile) {
            // Check if resume is already uploaded in session data
            if (userProfile.sessionData && userProfile.sessionData.resumeUploaded) {
              setResumeUploaded(true);
              localStorage.setItem("resumeUploaded", "true");
              
              // If resume has a filename, add it to profiles
              if (userProfile.sessionData.resumeFileName) {
                setProfiles([{
                  filename: userProfile.sessionData.resumeFileName,
                  skills: userProfile.skills || []
                }]);
              } else if (userProfile.skills && userProfile.skills.length > 0) {
                setProfiles([{
                  filename: "Saved Profile",
                  skills: userProfile.skills
                }]);
              }
              
              if (userProfile.skills && userProfile.skills.length > 0) {
                setSkillsExtracted(true);
                localStorage.setItem("skillsExtracted", "true");
              }
            }
            
            // Load assessment results if available
            if (userProfile.assessmentResults) {
              setAssessmentResults(userProfile.assessmentResults);
              localStorage.setItem("assessmentResults", JSON.stringify(userProfile.assessmentResults));
            } else {
              // Fallback to localStorage
              const savedAssessments = localStorage.getItem("assessmentResults");
              if (savedAssessments) {
                setAssessmentResults(JSON.parse(savedAssessments));
              }
            }
            
            // Load completed videos if available
            if (userProfile.completedVideos) {
              setCompletedVideos(userProfile.completedVideos);
              localStorage.setItem("completedVideos", JSON.stringify(userProfile.completedVideos));
            } else {
              // Fallback to localStorage
              const savedVideos = localStorage.getItem("completedVideos");
              if (savedVideos) {
                setCompletedVideos(JSON.parse(savedVideos));
              }
            }
          }
        } else {
          // No logged in user, fallback to localStorage
          const savedAssessments = localStorage.getItem("assessmentResults");
          if (savedAssessments) {
            setAssessmentResults(JSON.parse(savedAssessments));
          }
          
          const savedVideos = localStorage.getItem("completedVideos");
          if (savedVideos) {
            setCompletedVideos(JSON.parse(savedVideos));
          }
          
          // If there's a profile with skills in localStorage, use it
          const localUserProfile = localStorage.getItem("userProfile");
          if (localUserProfile) {
            const parsedProfile = JSON.parse(localUserProfile);
            if (parsedProfile.skills && parsedProfile.skills.length > 0) {
              setProfiles([{
                filename: "Saved Profile",
                skills: parsedProfile.skills
              }]);
              setSkillsExtracted(true);
              setResumeUploaded(localStorage.getItem("resumeUploaded") === "true");
            }
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        // Fallback to localStorage if Firebase fails
        const resumeStatus = localStorage.getItem("resumeUploaded") === "true";
        setResumeUploaded(resumeStatus);
      }
    };
    
    loadUserData();
  }, []);

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
    setError("");
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError("Please select files first!");
      return;
    }
    setLoading(true);

    try {
      const uploadedProfiles = [];
      
      // Get current user from localStorage if available
      const userString = localStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;
      const userId = user?.uid || "guest-" + Date.now(); // Use a timestamp as fallback ID

      for (const file of files) {
        // Upload resume to Firebase Storage (this now updates session data)
        if (user) {
          await uploadResume(file, userId);
        }

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("http://127.0.0.1:8002/analyze_resume", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        
        if (data.skills && data.skills.length > 0) {
          uploadedProfiles.push({
            filename: file.name,
            skills: data.skills
          });
          
          // Save to localStorage for fallback
          localStorage.setItem("userProfile", JSON.stringify({
            skills: data.skills,
            resumeFileName: file.name,
            resumeUploaded: true,
            uploadDate: new Date().toISOString()
          }));
          
          // Update user profile in Firebase if user is logged in
          if (user) {
            await updateUserProfile(userId, { 
              skills: data.skills,
              'sessionData.skillsExtracted': true
            });
          }
        }
      }
      
      setProfiles(uploadedProfiles);
      setSkillsExtracted(true);
      setResumeUploaded(true);
      localStorage.setItem("skillsExtracted", "true");
      localStorage.setItem("resumeUploaded", "true");
      
      if (onResumeUpload) {
        onResumeUpload(uploadedProfiles);
      }
    } catch (err) {
      console.error("Error uploading resume:", err);
      setError("Failed to upload resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartAssessment = (skill) => {
    setCurrentAssessment(skill);
    setShowAssessment(true);
    localStorage.setItem("currentAssessment", skill);
  };

  const handleStartComprehensiveAssessment = () => {
    setCurrentAssessment("comprehensive");
    setShowAssessment(true);
    localStorage.setItem("currentAssessment", "comprehensive");
  };

  const handleAssessmentComplete = (result) => {
    setShowAssessment(false);
    
    // Handle comprehensive assessment results
    if (result.isComprehensive) {
      // Process each skill's score in the comprehensive result
      const updatedResults = [...assessmentResults];
      const newWeakSkills = [...weakSkills];
      
      Object.entries(result.skillScores).forEach(([skill, score]) => {
        // Find if we already have a result for this skill
        const existingIndex = updatedResults.findIndex(r => r.skill === skill);
        
        if (existingIndex >= 0) {
          // Update existing result
          updatedResults[existingIndex] = {
            ...updatedResults[existingIndex],
            score: score,
            date: new Date().toISOString()
          };
        } else {
          // Add new result
          updatedResults.push({
            skill,
            score,
            date: new Date().toISOString()
          });
        }
        
        // Check if this is a weak skill (score < 50%)
        if (score < 50 && !newWeakSkills.includes(skill)) {
          newWeakSkills.push(skill);
        }
      });
      
      setAssessmentResults(updatedResults);
      setWeakSkills(newWeakSkills);
      
      // Save to localStorage
      localStorage.setItem("assessmentResults", JSON.stringify(updatedResults));
      localStorage.setItem("weakSkills", JSON.stringify(newWeakSkills));
      
      // Switch to videos tab if we have weak skills
      if (newWeakSkills.length > 0) {
        setActiveTab("videos");
        localStorage.setItem("resumeActiveTab", "videos");
      }
    } else {
      // Handle single skill assessment (original logic)
      const updatedResults = [...assessmentResults];
      const existingIndex = updatedResults.findIndex(r => r.skill === result.skill);
      
      if (existingIndex >= 0) {
        updatedResults[existingIndex] = result;
      } else {
        updatedResults.push(result);
      }
      
      setAssessmentResults(updatedResults);
      
      // Check if this is a weak skill (score < 40%)
      const newWeakSkills = [...weakSkills];
      if (result.score < 40 && !newWeakSkills.includes(result.skill)) {
        newWeakSkills.push(result.skill);
        setWeakSkills(newWeakSkills);
      }
      
      // Save to localStorage
      localStorage.setItem("assessmentResults", JSON.stringify(updatedResults));
      localStorage.setItem("weakSkills", JSON.stringify(newWeakSkills));
      
      // Switch to videos tab if this is a weak skill
      if (result.score < 40) {
        setActiveTab("videos");
        localStorage.setItem("resumeActiveTab", "videos");
      }
    }
  };

  const handleRetakeAssessment = (skill) => {
    handleStartAssessment(skill);
  };

  const handleVideoComplete = (videoId) => {
    const updatedVideos = [...completedVideos, videoId];
    setCompletedVideos(updatedVideos);
    localStorage.setItem("completedVideos", JSON.stringify(updatedVideos));
  };

  const getCurrentStep = () => {
    if (!resumeUploaded) return 0;
    if (!skillsExtracted) return 1;
    if (assessmentResults.length === 0) return 2;
    return 3;
  };

  // Save active tab to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("resumeActiveTab", activeTab);
  }, [activeTab]);

  return (
    <div className="p-6 bg-white rounded shadow">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("resume")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "resume"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            📄 Resume Upload
          </button>
          <button
            onClick={() => setActiveTab("assessment")}
            disabled={!skillsExtracted}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${!skillsExtracted ? "text-gray-400 cursor-not-allowed" : 
              activeTab === "assessment"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            📝 Skill Assessment
          </button>
          <button
            onClick={() => setActiveTab("videos")}
            disabled={weakSkills.length === 0}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${weakSkills.length === 0 ? "text-gray-400 cursor-not-allowed" :
              activeTab === "videos"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            📚 Video Learning
          </button>
          <button
            onClick={() => setActiveTab("progress")}
            disabled={assessmentResults.length === 0}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${assessmentResults.length === 0 ? "text-gray-400 cursor-not-allowed" :
              activeTab === "progress"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            📊 Progress Tracker
          </button>
        </nav>
      </div>

      {/* Progress Stepper */}
      <ProgressStepper currentStep={getCurrentStep()} steps={progressSteps} />

      {/* Resume Upload Tab */}
      {activeTab === "resume" && (
        <div>
          <h2 className="text-xl font-bold mb-4">Upload Resume and Extract Skills</h2>
          
          <input
            type="file"
            multiple
            accept=".pdf,.txt,.docx"
            onChange={handleFileChange}
            className="mb-4"
          />

          <button
            onClick={handleUpload}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {loading ? "Uploading..." : "Upload and Extract Skills"}
          </button>

          {error && <p className="text-red-500 mt-2">{error}</p>}

          {profiles.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Extracted Skills:</h3>
              {profiles.map((profile, idx) => (
                <div key={idx} className="mb-4">
                  <p className="font-medium">{profile.filename}</p>
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={() => {
                        handleStartComprehensiveAssessment();
                        setActiveTab("assessment");
                      }}
                      className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
                    >
                      Start Comprehensive Assessment
                    </button>
                  </div>
                  <ul className="list-disc ml-6">
                    {profile.skills.map((skill, i) => (
                      <li key={i} className="flex items-center justify-between">
                        <span>{skill}</span>
                        <button 
                          onClick={() => {
                            handleStartAssessment(skill);
                            setActiveTab("assessment");
                          }}
                          className="ml-4 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Assess Individual Skill
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              
              {skillsExtracted && (
                <button
                  onClick={() => setActiveTab("assessment")}
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Continue to Skill Assessment
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Skill Assessment Tab */}
      {activeTab === "assessment" && (
        <div>
          <h2 className="text-xl font-bold mb-4">Skill Assessment</h2>
          
          {showAssessment && currentAssessment ? (
            <SkillAssessment 
              skill={currentAssessment} 
              onComplete={handleAssessmentComplete} 
              onClose={() => setShowAssessment(false)} 
            />
          ) : (
            <>
              <div className="mb-6 p-4 border border-blue-200 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Comprehensive Assessment</h3>
                <p className="text-gray-700 mb-3">Take a single assessment covering all your skills with two questions per skill.</p>
                <button
                  onClick={handleStartComprehensiveAssessment}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium"
                >
                  Start Comprehensive Assessment
                </button>
              </div>
              
              <h3 className="font-semibold text-lg mb-3">Individual Skill Assessments</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profiles.flatMap(profile => profile.skills).map((skill) => {
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
                              onClick={() => setActiveTab("progress")}
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
            </>
          )}
          
          {assessmentResults.length > 0 && weakSkills.length > 0 && (
            <button
              onClick={() => setActiveTab("videos")}
              className="mt-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Continue to Video Learning
            </button>
          )}
        </div>
      )}

      {/* Video Learning Tab */}
      {activeTab === "videos" && (
        <div>
          <h2 className="text-xl font-bold mb-4">Video Learning for Weak Skills</h2>
          <VideoRecommendations
            weakSkills={weakSkills}
            onVideoComplete={handleVideoComplete}
          />
          
          {completedVideos.length > 0 && (
            <button
              onClick={() => setActiveTab("progress")}
              className="mt-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              View Progress Tracker
            </button>
          )}
        </div>
      )}

      {/* Progress Tracker Tab */}
      {activeTab === "progress" && (
        <div>
          <h2 className="text-xl font-bold mb-4">Skill Progress Tracker</h2>
          <SkillProgressTracker
            assessmentResults={assessmentResults}
            completedVideos={completedVideos}
          />
        </div>
      )}
    </div>
  );
}
