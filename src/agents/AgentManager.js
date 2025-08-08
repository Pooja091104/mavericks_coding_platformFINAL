import { useState, useEffect } from 'react';

// Agent Types
export const AGENT_TYPES = {
  PROFILE: 'profile',
  ASSESSMENT: 'assessment',
  RECOMMENDER: 'recommender',
  TRACKER: 'tracker',
  HACKATHON: 'hackathon',
  LEADERBOARD: 'leaderboard'
};

// Agent Status
export const AGENT_STATUS = {
  IDLE: 'idle',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  ERROR: 'error'
};

class AgentManager {
  constructor() {
    this.agents = new Map();
    this.eventListeners = new Map();
    this.userData = null;
    this.initializeAgents();
  }

  initializeAgents() {
    // Initialize all agents
    this.agents.set(AGENT_TYPES.PROFILE, new ProfileAgent());
    this.agents.set(AGENT_TYPES.ASSESSMENT, new AssessmentAgent());
    this.agents.set(AGENT_TYPES.RECOMMENDER, new RecommenderAgent());
    this.agents.set(AGENT_TYPES.TRACKER, new TrackerAgent());
    this.agents.set(AGENT_TYPES.HACKATHON, new HackathonAgent());
    this.agents.set(AGENT_TYPES.LEADERBOARD, new LeaderboardAgent());
  }

  // Event system for agent communication
  subscribe(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  publish(event, data) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Get agent by type
  getAgent(type) {
    return this.agents.get(type);
  }

  // Execute agent workflow
  async executeWorkflow(userData) {
    this.userData = userData;
    
    try {
      // 1. Profile Agent - Extract skills from resume
      const profileResult = await this.getAgent(AGENT_TYPES.PROFILE).process(userData);
      this.publish('profile_completed', profileResult);

      // 2. Assessment Agent - Generate assessments based on skills
      const assessmentResult = await this.getAgent(AGENT_TYPES.ASSESSMENT).process(profileResult);
      this.publish('assessment_completed', assessmentResult);

      // 3. Recommender Agent - Generate learning recommendations
      const recommenderResult = await this.getAgent(AGENT_TYPES.RECOMMENDER).process(assessmentResult);
      this.publish('recommender_completed', recommenderResult);

      // 4. Tracker Agent - Set up progress tracking
      const trackerResult = await this.getAgent(AGENT_TYPES.TRACKER).process(recommenderResult);
      this.publish('tracker_completed', trackerResult);

      return {
        success: true,
        profile: profileResult,
        assessment: assessmentResult,
        recommender: recommenderResult,
        tracker: trackerResult
      };

    } catch (error) {
      console.error('Workflow execution failed:', error);
      this.publish('workflow_error', error);
      throw error;
    }
  }

  // Get workflow status
  getWorkflowStatus() {
    const status = {};
    this.agents.forEach((agent, type) => {
      status[type] = agent.getStatus();
    });
    return status;
  }
}

// Base Agent Class
class BaseAgent {
  constructor(type) {
    this.type = type;
    this.status = AGENT_STATUS.IDLE;
    this.lastResult = null;
    this.error = null;
  }

  setStatus(status) {
    this.status = status;
  }

  getStatus() {
    return {
      type: this.type,
      status: this.status,
      lastResult: this.lastResult,
      error: this.error
    };
  }

  async process(data) {
    this.setStatus(AGENT_STATUS.PROCESSING);
    try {
      const result = await this.execute(data);
      this.lastResult = result;
      this.setStatus(AGENT_STATUS.COMPLETED);
      return result;
    } catch (error) {
      this.error = error;
      this.setStatus(AGENT_STATUS.ERROR);
      throw error;
    }
  }

  async execute(data) {
    throw new Error('execute method must be implemented by subclass');
  }
}

// Profile Agent - Handles resume parsing and skill extraction
class ProfileAgent extends BaseAgent {
  constructor() {
    super(AGENT_TYPES.PROFILE);
  }

  async execute(userData) {
    console.log('🔍 Profile Agent: Processing user data...');
    
    // Extract skills from resume using AI
    let skills = [];
    
    if (userData.resume instanceof File) {
      // If resume is a File object (from file input)
      skills = await this.extractSkillsFromResume(userData.resume);
    } else if (typeof userData.resume === 'string') {
      // If resume is a string (text content)
      const blob = new Blob([userData.resume], { type: 'text/plain' });
      const file = new File([blob], 'resume.txt', { type: 'text/plain' });
      skills = await this.extractSkillsFromResume(file);
    } else {
      console.error('Invalid resume format:', userData.resume);
      skills = [];
    }
    
    // Create user profile
    const profile = {
      userId: userData.userId || Date.now(),
      name: userData.name || 'User',
      email: userData.email || '',
      skills: skills,
      experience: userData.experience || 'beginner',
      interests: userData.interests || [],
      createdAt: new Date().toISOString()
    };

    console.log('✅ Profile Agent: Skills extracted:', skills);
    return profile;
  }

  async extractSkillsFromResume(resumeData) {
    try {
      // Create a FormData object to properly send the file
      const formData = new FormData();
      formData.append('file', resumeData);
      
      const response = await fetch('http://127.0.0.1:8002/analyze_resume', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to analyze resume');
      }

      const result = await response.json();
      return result.skills || [];
    } catch (error) {
      console.error('Error extracting skills:', error);
      // Fallback to basic skill detection
      return this.extractBasicSkills(resumeData);
    }
  }

  extractBasicSkills(resumeData) {
    // Basic skill extraction as fallback
    const commonSkills = [
      'JavaScript', 'Python', 'React', 'Node.js', 'HTML', 'CSS',
      'SQL', 'Git', 'Docker', 'AWS', 'Java', 'C++', 'PHP'
    ];
    
    const text = resumeData.toString().toLowerCase();
    return commonSkills.filter(skill => 
      text.includes(skill.toLowerCase())
    );
  }
}

// Assessment Agent - Generates and manages assessments
class AssessmentAgent extends BaseAgent {
  constructor() {
    super(AGENT_TYPES.ASSESSMENT);
  }

  async execute(profileData) {
    console.log('📝 Assessment Agent: Generating assessments...');
    
    const assessments = [];
    
    // Generate assessments for each skill
    for (const skill of profileData.skills) {
      try {
        const assessment = await this.generateAssessment(skill);
        assessments.push(assessment);
      } catch (error) {
        console.error(`Error generating assessment for ${skill}:`, error);
      }
    }

    console.log('✅ Assessment Agent: Generated', assessments.length, 'assessments');
    return {
      assessments,
      totalSkills: profileData.skills.length,
      generatedAssessments: assessments.length
    };
  }

  async generateAssessment(skill) {
    try {
      const response = await fetch('http://127.0.0.1:8002/generate_assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skills: [skill],
          difficulty: 'intermediate'
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate assessment for ${skill}`);
      }

      const result = await response.json();
      return {
        skill,
        assessment: result.assessment,
        difficulty: 'intermediate',
        status: 'pending'
      };
    } catch (error) {
      console.error(`Error generating assessment for ${skill}:`, error);
      return {
        skill,
        assessment: null,
        difficulty: 'intermediate',
        status: 'error',
        error: error.message
      };
    }
  }
}

// Recommender Agent - Generates learning recommendations
class RecommenderAgent extends BaseAgent {
  constructor() {
    super(AGENT_TYPES.RECOMMENDER);
  }

  async execute(assessmentData) {
    console.log('🎯 Recommender Agent: Generating learning recommendations...');
    
    const recommendations = [];
    
    // Generate recommendations based on assessment results
    for (const assessment of assessmentData.assessments) {
      if (assessment.status === 'completed') {
        const skillRecommendations = await this.generateRecommendations(assessment);
        recommendations.push(...skillRecommendations);
      }
    }

    console.log('✅ Recommender Agent: Generated', recommendations.length, 'recommendations');
    return {
      recommendations,
      totalRecommendations: recommendations.length,
      skillsCovered: [...new Set(recommendations.map(r => r.skill))]
    };
  }

  async generateRecommendations(assessment) {
    const recommendations = [];
    
    // Generate video recommendations
    const videoRecommendations = await this.getVideoRecommendations(assessment.skill);
    recommendations.push(...videoRecommendations);

    // Generate course recommendations
    const courseRecommendations = await this.getCourseRecommendations(assessment.skill);
    recommendations.push(...courseRecommendations);

    // Generate project recommendations
    const projectRecommendations = await this.getProjectRecommendations(assessment.skill);
    recommendations.push(...projectRecommendations);

    return recommendations;
  }

  async getVideoRecommendations(skill) {
    // This would integrate with your existing video recommendation system
    const videoDatabase = {
      'JavaScript': [
        {
          id: 'js-1',
          type: 'video',
          title: 'JavaScript Fundamentals',
          description: 'Learn the basics of JavaScript',
          url: 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
          duration: '3:12:00',
          skill: 'JavaScript',
          difficulty: 'beginner'
        }
      ],
      'Python': [
        {
          id: 'py-1',
          type: 'video',
          title: 'Python for Beginners',
          description: 'Complete Python tutorial',
          url: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc',
          duration: '4:26:00',
          skill: 'Python',
          difficulty: 'beginner'
        }
      ]
    };

    return videoDatabase[skill] || [];
  }

  async getCourseRecommendations(skill) {
    // Mock course recommendations
    return [
      {
        id: `course-${skill.toLowerCase()}-1`,
        type: 'course',
        title: `${skill} Complete Course`,
        description: `Comprehensive ${skill} course for all levels`,
        platform: 'Udemy',
        duration: '10 hours',
        skill: skill,
        difficulty: 'intermediate',
        price: '$19.99'
      }
    ];
  }

  async getProjectRecommendations(skill) {
    // Mock project recommendations
    return [
      {
        id: `project-${skill.toLowerCase()}-1`,
        type: 'project',
        title: `Build a ${skill} Application`,
        description: `Create a real-world project using ${skill}`,
        difficulty: 'intermediate',
        skill: skill,
        estimatedTime: '2-3 weeks',
        githubUrl: `https://github.com/example/${skill.toLowerCase()}-project`
      }
    ];
  }
}

// Tracker Agent - Tracks user progress
class TrackerAgent extends BaseAgent {
  constructor() {
    super(AGENT_TYPES.TRACKER);
  }

  async execute(recommenderData) {
    console.log('📊 Tracker Agent: Setting up progress tracking...');
    
    const trackingData = {
      userId: Date.now(),
      startDate: new Date().toISOString(),
      progress: {
        videosCompleted: 0,
        coursesCompleted: 0,
        projectsCompleted: 0,
        assessmentsTaken: 0,
        totalScore: 0
      },
      learningPath: this.createLearningPath(recommenderData.recommendations),
      milestones: this.createMilestones(recommenderData.recommendations),
      achievements: []
    };

    console.log('✅ Tracker Agent: Progress tracking initialized');
    return trackingData;
  }

  createLearningPath(recommendations) {
    const learningPath = {
      phases: [
        {
          name: 'Foundation',
          description: 'Build core skills',
          items: recommendations.filter(r => r.difficulty === 'beginner'),
          completed: false
        },
        {
          name: 'Intermediate',
          description: 'Apply skills to projects',
          items: recommendations.filter(r => r.difficulty === 'intermediate'),
          completed: false
        },
        {
          name: 'Advanced',
          description: 'Master advanced concepts',
          items: recommendations.filter(r => r.difficulty === 'advanced'),
          completed: false
        }
      ]
    };

    return learningPath;
  }

  createMilestones(recommendations) {
    return [
      {
        id: 'first-assessment',
        name: 'Complete First Assessment',
        description: 'Take your first skill assessment',
        completed: false,
        points: 50
      },
      {
        id: 'first-video',
        name: 'Watch First Video',
        description: 'Complete your first learning video',
        completed: false,
        points: 25
      },
      {
        id: 'first-project',
        name: 'Complete First Project',
        description: 'Finish your first hands-on project',
        completed: false,
        points: 100
      }
    ];
  }
}

// Hackathon Agent - Manages hackathons
class HackathonAgent extends BaseAgent {
  constructor() {
    super(AGENT_TYPES.HACKATHON);
  }

  async execute(data) {
    console.log('🏆 Hackathon Agent: Setting up hackathon system...');
    
    const hackathonData = {
      activeHackathons: await this.getActiveHackathons(),
      userSubmissions: [],
      challenges: await this.generateChallenges(data),
      leaderboard: []
    };

    console.log('✅ Hackathon Agent: Hackathon system initialized');
    return hackathonData;
  }

  async getActiveHackathons() {
    // Mock active hackathons
    return [
      {
        id: 'hack-1',
        name: 'AI Innovation Challenge',
        description: 'Build innovative AI applications',
        startDate: '2024-01-15',
        endDate: '2024-02-15',
        prize: '$5000',
        participants: 45,
        status: 'active'
      },
      {
        id: 'hack-2',
        name: 'Web Development Sprint',
        description: 'Create modern web applications',
        startDate: '2024-01-20',
        endDate: '2024-02-20',
        prize: '$3000',
        participants: 32,
        status: 'active'
      }
    ];
  }

  async generateChallenges(data) {
    // Generate AI-powered challenges based on user skills
    return [
      {
        id: 'challenge-1',
        title: 'Build a Skill Assessment App',
        description: 'Create an application that assesses programming skills',
        difficulty: 'intermediate',
        skills: ['JavaScript', 'React', 'Node.js'],
        estimatedTime: '2-3 days',
        points: 200
      },
      {
        id: 'challenge-2',
        title: 'AI-Powered Learning Recommender',
        description: 'Build a system that recommends learning content',
        difficulty: 'advanced',
        skills: ['Python', 'Machine Learning', 'API Development'],
        estimatedTime: '3-4 days',
        points: 300
      }
    ];
  }
}

// Leaderboard Agent - Manages leaderboards and achievements
class LeaderboardAgent extends BaseAgent {
  constructor() {
    super(AGENT_TYPES.LEADERBOARD);
  }

  async execute(data) {
    console.log('🏅 Leaderboard Agent: Setting up leaderboard system...');
    
    const leaderboardData = {
      globalLeaderboard: await this.getGlobalLeaderboard(),
      achievements: this.createAchievements(),
      badges: this.createBadges(),
      userRank: null
    };

    console.log('✅ Leaderboard Agent: Leaderboard system initialized');
    return leaderboardData;
  }

  async getGlobalLeaderboard() {
    // Mock global leaderboard
    return [
      {
        rank: 1,
        userId: 'user-1',
        name: 'Alex Johnson',
        score: 2850,
        badges: ['Expert', 'Hackathon Winner', 'Mentor'],
        skills: ['JavaScript', 'React', 'Node.js']
      },
      {
        rank: 2,
        userId: 'user-2',
        name: 'Sarah Chen',
        score: 2720,
        badges: ['Advanced', 'Project Master'],
        skills: ['Python', 'Machine Learning', 'Data Science']
      }
    ];
  }

  createAchievements() {
    return [
      {
        id: 'first-blood',
        name: 'First Blood',
        description: 'Complete your first assessment',
        icon: '🎯',
        points: 50
      },
      {
        id: 'video-master',
        name: 'Video Master',
        description: 'Complete 10 learning videos',
        icon: '📺',
        points: 100
      },
      {
        id: 'project-champion',
        name: 'Project Champion',
        description: 'Complete 5 hands-on projects',
        icon: '🏆',
        points: 200
      }
    ];
  }

  createBadges() {
    return [
      {
        id: 'beginner',
        name: 'Beginner',
        description: 'Just getting started',
        icon: '🌱',
        requirement: 'Complete first assessment'
      },
      {
        id: 'intermediate',
        name: 'Intermediate',
        description: 'Making good progress',
        icon: '🚀',
        requirement: 'Complete 5 assessments'
      },
      {
        id: 'expert',
        name: 'Expert',
        description: 'Master of the craft',
        icon: '👑',
        requirement: 'Complete 20 assessments with 90%+ scores'
      }
    ];
  }
}

// Create and export singleton instance
const agentManager = new AgentManager();
export default agentManager;