import { useState, useEffect, useCallback } from "react";

export default function VideoRecommendations({ weakSkills, onVideoComplete }) {
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [completedVideos, setCompletedVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState([]);
  const [skillLevels, setSkillLevels] = useState({
    weak: [],
    average: [],
    strong: []
  });

  // Sample video recommendations based on weak skills
  const videoDatabase = {
    "JavaScript": [
      {
        id: "js-1",
        title: "JavaScript Fundamentals for Beginners",
        description: "Learn the basics of JavaScript including variables, functions, and DOM manipulation",
        url: "https://www.youtube.com/watch?v=W6NZfCO5SIk",
        duration: "3:12:00",
        skill: "JavaScript",
        difficulty: "beginner"
      },
      {
        id: "js-2",
        title: "Advanced JavaScript Concepts",
        description: "Master closures, promises, async/await, and modern ES6+ features",
        url: "https://www.youtube.com/watch?v=Mus_vwhTCq0",
        duration: "2:45:30",
        skill: "JavaScript",
        difficulty: "advanced"
      }
    ],
    "Python": [
      {
        id: "py-1",
        title: "Python for Beginners - Full Course",
        description: "Complete Python tutorial for beginners with hands-on projects",
        url: "https://www.youtube.com/watch?v=_uQrJ0TkZlc",
        duration: "4:26:00",
        skill: "Python",
        difficulty: "beginner"
      },
      {
        id: "py-2",
        title: "Python Data Structures and Algorithms",
        description: "Learn data structures and algorithms in Python",
        url: "https://www.youtube.com/watch?v=pkYVOmU3MgA",
        duration: "1:55:20",
        skill: "Python",
        difficulty: "intermediate"
      }
    ],
    "React": [
      {
        id: "react-1",
        title: "React Tutorial for Beginners",
        description: "Learn React from scratch with practical examples",
        url: "https://www.youtube.com/watch?v=w7ejDZ8SWv8",
        duration: "2:25:00",
        skill: "React",
        difficulty: "beginner"
      },
      {
        id: "react-2",
        title: "Advanced React Patterns",
        description: "Master advanced React concepts like hooks, context, and performance optimization",
        url: "https://www.youtube.com/watch?v=dpw9EHDh2bM",
        duration: "1:45:30",
        skill: "React",
        difficulty: "advanced"
      }
    ],
    "Node.js": [
      {
        id: "node-1",
        title: "Node.js and Express.js - Full Course",
        description: "Build REST APIs and web applications with Node.js and Express",
        url: "https://www.youtube.com/watch?v=Oe421EPjeBE",
        duration: "2:15:00",
        skill: "Node.js",
        difficulty: "intermediate"
      }
    ],
    "Database Design": [
      {
        id: "db-1",
        title: "Database Design for Beginners",
        description: "Learn database design principles and SQL fundamentals",
        url: "https://www.youtube.com/watch?v=ztHopE5Wnpc",
        duration: "1:30:00",
        skill: "Database Design",
        difficulty: "beginner"
      }
    ],
    "Java": [
      {
        id: "java-1",
        title: "Java Programming for Beginners",
        description: "Learn Java programming from scratch with hands-on examples",
        url: "https://www.youtube.com/watch?v=eIrMbAQSU34",
        duration: "2:30:00",
        skill: "Java",
        difficulty: "beginner"
      },
      {
        id: "java-2",
        title: "Java Data Structures and Algorithms",
        description: "Master data structures and algorithms in Java",
        url: "https://www.youtube.com/watch?v=BBpAmxU_NQo",
        duration: "3:15:00",
        skill: "Java",
        difficulty: "intermediate"
      }
    ],
    "SQL": [
      {
        id: "sql-1",
        title: "SQL Tutorial for Beginners",
        description: "Learn SQL basics for database management and querying",
        url: "https://www.youtube.com/watch?v=HXV3zeQKqGY",
        duration: "4:20:00",
        skill: "SQL",
        difficulty: "beginner"
      },
      {
        id: "sql-2",
        title: "Advanced SQL Techniques",
        description: "Master complex SQL queries, joins, and database optimization",
        url: "https://www.youtube.com/watch?v=qw--VYLpxG4",
        duration: "2:10:00",
        skill: "SQL",
        difficulty: "advanced"
      }
    ]
  };

  // Load assessment results from localStorage
  useEffect(() => {
    const savedResults = localStorage.getItem('assessmentResults');
    if (savedResults) {
      const results = JSON.parse(savedResults);
      setAssessmentResults(results);
      
      // Categorize skills based on scores
      const levels = {
        weak: [],
        average: [],
        strong: []
      };
      
      results.forEach(result => {
        const { skill, score } = result;
        if (score < 50) {
          levels.weak.push(skill);
        } else if (score < 80) {
          levels.average.push(skill);
        } else {
          levels.strong.push(skill);
        }
      });
      
      setSkillLevels(levels);
      console.log("Skill levels categorized:", levels);
    }
    
    // For backward compatibility
    if (weakSkills && weakSkills.length > 0) {
      generateRecommendations();
      console.log("Weak skills detected:", weakSkills);
    }
  }, [weakSkills]);

  // Load completed videos from localStorage
  useEffect(() => {
    const savedCompletedVideos = localStorage.getItem('completedVideos');
    if (savedCompletedVideos) {
      setCompletedVideos(JSON.parse(savedCompletedVideos));
    }
  }, []);

  // Save completed videos to localStorage when updated
  useEffect(() => {
    if (completedVideos.length > 0) {
      localStorage.setItem('completedVideos', JSON.stringify(completedVideos));
    }
  }, [completedVideos]);
  
  const generateRecommendations = useCallback(() => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const recommendations = [];
      
      // Process videos for each skill level
      const processSkillLevel = (skills, level) => {
        skills.forEach(skill => {
          console.log(`Looking for ${level} level videos for skill:`, skill);
          
          // Try exact match first
          let skillVideos = videoDatabase[skill] || [];
          
          // If no videos found, try case-insensitive match
          if (skillVideos.length === 0) {
            const skillLower = skill.toLowerCase();
            const databaseKeys = Object.keys(videoDatabase);
            
            for (const key of databaseKeys) {
              if (key.toLowerCase() === skillLower) {
                skillVideos = videoDatabase[key];
                console.log("Found videos using case-insensitive match:", key);
                break;
              }
            }
          }
          
          // If still no videos found, create a generic recommendation
          if (skillVideos.length === 0) {
            console.log(`No predefined videos found, creating generic ${level} recommendation for:`, skill);
            
            // Customize video based on skill level
            let videoParams = {};
            
            if (level === 'weak') {
              videoParams = {
                id: `${skill.toLowerCase().replace(/\s+/g, '-')}-weak`,
                title: `${skill} Comprehensive Tutorial`,
                description: `In-depth ${skill} tutorial covering fundamentals and advanced concepts`,
                url: `https://www.youtube.com/results?search_query=${encodeURIComponent(skill)}+comprehensive+tutorial`,
                duration: "Long (2+ hours)",
                skill: skill,
                difficulty: "beginner-to-intermediate",
                level: "weak"
              };
            } else if (level === 'average') {
              videoParams = {
                id: `${skill.toLowerCase().replace(/\s+/g, '-')}-avg`,
                title: `${skill} Intermediate Concepts`,
                description: `Strengthen your ${skill} knowledge with these intermediate concepts`,
                url: `https://www.youtube.com/results?search_query=${encodeURIComponent(skill)}+intermediate+tutorial`,
                duration: "Medium (1-2 hours)",
                skill: skill,
                difficulty: "intermediate",
                level: "average"
              };
            } else { // strong
              videoParams = {
                id: `${skill.toLowerCase().replace(/\s+/g, '-')}-strong`,
                title: `${skill} Advanced Tips & Tricks`,
                description: `Quick tips to take your ${skill} expertise to the next level`,
                url: `https://www.youtube.com/results?search_query=${encodeURIComponent(skill)}+advanced+tips+tricks`,
                duration: "Short (15-30 min)",
                skill: skill,
                difficulty: "advanced",
                level: "strong"
              };
            }
            
            skillVideos = [videoParams];
          } else {
            // Filter existing videos based on skill level
            if (level === 'weak') {
              // For weak skills, prefer longer, beginner-friendly videos
              skillVideos = skillVideos
                .filter(v => v.difficulty === "beginner" || v.difficulty === "intermediate")
                .map(v => ({ ...v, level: "weak" }));
            } else if (level === 'average') {
              // For average skills, prefer intermediate videos
              skillVideos = skillVideos
                .filter(v => v.difficulty === "intermediate")
                .map(v => ({ ...v, level: "average" }));
            } else { // strong
              // For strong skills, prefer advanced, shorter videos
              skillVideos = skillVideos
                .filter(v => v.difficulty === "advanced")
                .map(v => ({ ...v, level: "strong" }));
            }
          }
          
          console.log(`Found ${level} videos:`, skillVideos.length);
          recommendations.push(...skillVideos);
        });
      };
      
      // Process each skill level with appropriate video recommendations
      // For weak skills, recommend longer, comprehensive videos
      if (skillLevels.weak.length > 0) {
        processSkillLevel(skillLevels.weak, 'weak');
      } else if (weakSkills && weakSkills.length > 0) {
        // Backward compatibility
        processSkillLevel(weakSkills, 'weak');
      }
      
      // For average skills, recommend medium-length videos
      if (skillLevels.average.length > 0) {
        processSkillLevel(skillLevels.average, 'average');
      }
      
      // For strong skills, recommend short, advanced videos
      if (skillLevels.strong.length > 0) {
        processSkillLevel(skillLevels.strong, 'strong');
      }
      
      console.log("Total recommended videos:", recommendations.length);
      setRecommendedVideos(recommendations);
      setLoading(false);
    }, 1000);
  }, [weakSkills, skillLevels, videoDatabase]);

  const markVideoComplete = (videoId) => {
    const video = recommendedVideos.find(v => v.id === videoId);
    if (video && !completedVideos.find(v => v.id === videoId)) {
      setCompletedVideos(prev => [...prev, video]);
      if (onVideoComplete) {
        onVideoComplete(video);
      }
    }
  };

  const getProgressPercentage = () => {
    if (recommendedVideos.length === 0) return 0;
    return Math.round((completedVideos.length / recommendedVideos.length) * 100);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Generating video recommendations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">📚 Recommended Learning Videos</h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{getProgressPercentage()}%</div>
          <div className="text-sm text-gray-600">Complete</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
        <div 
          className="bg-blue-600 h-3 rounded-full transition-all duration-300"
          style={{ width: `${getProgressPercentage()}%` }}
        ></div>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{recommendedVideos.length}</div>
          <div className="text-sm text-gray-600">Total Videos</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{completedVideos.length}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{recommendedVideos.length - completedVideos.length}</div>
          <div className="text-sm text-gray-600">Remaining</div>
        </div>
      </div>

      {/* Skill Level Headers */}
      {skillLevels.weak.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-red-700 mb-2">🔍 Focus Areas (Weak Skills)</h3>
          <p className="text-sm text-gray-600 mb-4">These are areas where you should focus your learning. We recommend longer, comprehensive videos to build a strong foundation.</p>
          <div className="space-y-4">
            {recommendedVideos
              .filter(video => video.level === 'weak')
              .map((video) => {
                const isCompleted = completedVideos.find(v => v.id === video.id);
                
                return (
                  <div 
                    key={video.id} 
                    className={`border-l-4 border-l-red-500 border rounded-lg p-4 transition-all duration-200 ${
                      isCompleted 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 hover:border-red-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-800">{video.title}</h4>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Priority
                          </span>
                          {isCompleted && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✓ Completed
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3">{video.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <span className="mr-1">🎯</span>
                            {video.skill}
                          </span>
                          <span className="flex items-center">
                            <span className="mr-1">⏱️</span>
                            {video.duration}
                          </span>
                          <span className="flex items-center">
                            <span className="mr-1">📊</span>
                            {video.difficulty}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <a
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                        >
                          Watch Video
                        </a>
                        
                        {!isCompleted && (
                          <button
                            onClick={() => markVideoComplete(video.id)}
                            className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
      
      {skillLevels.average.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-yellow-700 mb-2">🔄 Improvement Areas (Average Skills)</h3>
          <p className="text-sm text-gray-600 mb-4">You have a good foundation in these skills. These videos will help you strengthen your knowledge.</p>
          <div className="space-y-4">
            {recommendedVideos
              .filter(video => video.level === 'average')
              .map((video) => {
                const isCompleted = completedVideos.find(v => v.id === video.id);
                
                return (
                  <div 
                    key={video.id} 
                    className={`border-l-4 border-l-yellow-500 border rounded-lg p-4 transition-all duration-200 ${
                      isCompleted 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 hover:border-yellow-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-800">{video.title}</h4>
                          {isCompleted && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✓ Completed
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3">{video.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <span className="mr-1">🎯</span>
                            {video.skill}
                          </span>
                          <span className="flex items-center">
                            <span className="mr-1">⏱️</span>
                            {video.duration}
                          </span>
                          <span className="flex items-center">
                            <span className="mr-1">📊</span>
                            {video.difficulty}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <a
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
                        >
                          Watch Video
                        </a>
                        
                        {!isCompleted && (
                          <button
                            onClick={() => markVideoComplete(video.id)}
                            className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
      
      {skillLevels.strong.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-green-700 mb-2">✅ Strong Skills</h3>
          <p className="text-sm text-gray-600 mb-4">You're already proficient in these areas. These short videos will help you master advanced concepts.</p>
          <div className="space-y-4">
            {recommendedVideos
              .filter(video => video.level === 'strong')
              .map((video) => {
                const isCompleted = completedVideos.find(v => v.id === video.id);
                
                return (
                  <div 
                    key={video.id} 
                    className={`border-l-4 border-l-green-500 border rounded-lg p-4 transition-all duration-200 ${
                      isCompleted 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 hover:border-green-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-800">{video.title}</h4>
                          {isCompleted && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✓ Completed
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3">{video.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <span className="mr-1">🎯</span>
                            {video.skill}
                          </span>
                          <span className="flex items-center">
                            <span className="mr-1">⏱️</span>
                            {video.duration}
                          </span>
                          <span className="flex items-center">
                            <span className="mr-1">📊</span>
                            {video.difficulty}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <a
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                        >
                          Watch Video
                        </a>
                        
                        {!isCompleted && (
                          <button
                            onClick={() => markVideoComplete(video.id)}
                            className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
      
      {/* For backward compatibility - videos without level classification */}
      {recommendedVideos.filter(v => !v.level).length > 0 && (
        <div className="space-y-4">
          {recommendedVideos
            .filter(video => !video.level)
            .map((video) => {
              const isCompleted = completedVideos.find(v => v.id === video.id);
              
              return (
                <div 
                  key={video.id} 
                  className={`border rounded-lg p-4 transition-all duration-200 ${
                    isCompleted 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-800">{video.title}</h4>
                        {isCompleted && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ Completed
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3">{video.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <span className="mr-1">🎯</span>
                          {video.skill}
                        </span>
                        <span className="flex items-center">
                          <span className="mr-1">⏱️</span>
                          {video.duration}
                        </span>
                        <span className="flex items-center">
                          <span className="mr-1">📊</span>
                          {video.difficulty}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        Watch Video
                      </a>
                      
                      {!isCompleted && (
                        <button
                          onClick={() => markVideoComplete(video.id)}
                          className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {recommendedVideos.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🎉</div>
          <h4 className="text-lg font-semibold text-gray-800 mb-2">No Weak Skills Detected!</h4>
          <p className="text-gray-600">Great job! Your assessment shows strong skills across all areas.</p>
        </div>
      )}
    </div>
  );
}