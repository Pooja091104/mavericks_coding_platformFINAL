import { useState, useEffect } from 'react';
import { getUserProfile, logout } from '../../firebaseConfig';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import MetricsCard from '../../components/MetricsCard';
import ResumeUploader from './ResumeUploader';
import SkillAssessmentDashboard from './SkillAssessmentDashboard';
import HackathonPanel from './HackathonPanel';
import Leaderboard from './Leaderboard';
import ProgressStepper from './ProgressStepper';
import { Target, Trophy, BookOpen, Video } from 'lucide-react';

export default function UserDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('userDashboardTab');
    return savedTab || 'overview';
  });
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, [user]);
  
  // Save active tab to localStorage
  useEffect(() => {
    localStorage.setItem('userDashboardTab', activeTab);
  }, [activeTab]);

  const loadUserProfile = async () => {
    try {
      // First check localStorage for cached profile
      const cachedProfile = localStorage.getItem('userProfile');
      
      if (cachedProfile) {
        setUserProfile(JSON.parse(cachedProfile));
        setLoading(false);
        return;
      }
      
      if (user.uid) {
        const profile = await getUserProfile(user.uid);
        if (profile) {
          setUserProfile(profile);
          // Cache the profile in localStorage
          localStorage.setItem('userProfile', JSON.stringify(profile));
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (user.uid) {
        await logout();
      }
      onLogout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6 shadow-lg"></div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-lg border border-gray-200/60">
            <p className="text-gray-700 font-medium text-lg">Loading your dashboard...</p>
            <p className="text-gray-500 text-sm mt-2">Preparing your personalized experience</p>
          </div>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Welcome back, {userProfile?.name || user.displayName}! 👋</h2>
                  <p className="card-subtitle">Here's your learning progress and recent activities</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="badge badge-primary">{userProfile?.points || 0} Points</span>
                </div>
              </div>
              
              {/* Progress Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <MetricsCard
                  title="Assessments Completed"
                  value={userProfile?.progress?.assessmentsCompleted || 0}
                  change="+2 this week"
                  changeType="positive"
                  icon={Target}
                />
                
                <MetricsCard
                  title="Skills Assessed"
                  value={userProfile?.progress?.skillsAssessed || 0}
                  change="+3 this week"
                  changeType="positive"
                  icon={BookOpen}
                />
                
                <MetricsCard
                  title="Videos Completed"
                  value={userProfile?.progress?.videosCompleted || 0}
                  change="+5 this week"
                  changeType="positive"
                  icon={Video}
                />
                
                <MetricsCard
                  title="Hackathons Joined"
                  value={userProfile?.progress?.hackathonsJoined || 0}
                  change="+1 this month"
                  changeType="positive"
                  icon={Trophy}
                />
              </div>
              
              {/* Learning Progress */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Learning Progress</h3>
                <ProgressStepper learningPath={userProfile?.learningPath || []} />
              </div>
            </div>
          </div>
        );
        

        
      case 'assessment':
        return (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Skill Assessment</h2>
              <p className="card-subtitle">Evaluate and improve your coding skills</p>
            </div>
            <SkillAssessmentDashboard user={user} />
          </div>
        );
        
      case 'hackathons':
        return (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Hackathons</h2>
              <p className="card-subtitle">Join exciting coding competitions and challenges</p>
            </div>
            <HackathonPanel />
          </div>
        );
        
      case 'leaderboard':
        return (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Leaderboard</h2>
              <p className="card-subtitle">See how you rank among other learners</p>
            </div>
            <Leaderboard />
          </div>
        );
        

        
      case 'resume':
        return (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Resume Builder</h2>
              <p className="card-subtitle">Create and manage your professional resume</p>
            </div>
            <ResumeUploader user={user} />
          </div>
        );
        
      default:
        return (
          <div className="card">
            <div className="text-center py-8">
              <p className="text-gray-500">Select a tab to get started</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
      {/* Header */}
      <Header user={user} onLogout={handleLogout} />
      
      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* Content Area */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {renderTabContent()}
          </div>
        </main>
      </div>
    </div>
  );
}