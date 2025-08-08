import { useState, useEffect, useCallback } from 'react';

export default function Leaderboard({ user }) {
  // State management
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [activeTab, setActiveTab] = useState('overall');

  // Data loading function
  const loadLeaderboardData = useCallback(() => {
    const mockData = [
      {
        id: '1',
        name: 'Alex Johnson',
        email: 'alex@example.com',
        points: 2850,
        rank: 1,
        badges: ['Hackathon Winner', 'Assessment Master', 'Video Expert'],
        progress: {
          assessmentsCompleted: 12,
          skillsAssessed: 15,
          videosCompleted: 25,
          hackathonsJoined: 5
        },
        avatar: 'AJ',
        joinDate: '2024-01-15',
        lastActive: '2024-01-28'
      },
      {
        id: '2',
        name: 'Sarah Chen',
        email: 'sarah@example.com',
        points: 2400,
        rank: 2,
        badges: ['First Assessment', 'Learning Path Complete'],
        progress: {
          assessmentsCompleted: 10,
          skillsAssessed: 12,
          videosCompleted: 20,
          hackathonsJoined: 3
        },
        avatar: 'SC',
        joinDate: '2024-01-20',
        lastActive: '2024-01-27'
      },
      {
        id: '3',
        name: 'Mike Rodriguez',
        email: 'mike@example.com',
        points: 2100,
        rank: 3,
        badges: ['Video Master', 'Consistent Learner'],
        progress: {
          assessmentsCompleted: 8,
          skillsAssessed: 10,
          videosCompleted: 18,
          hackathonsJoined: 2
        },
        avatar: 'MR',
        joinDate: '2024-01-25',
        lastActive: '2024-01-26'
      },
      {
        id: '4',
        name: 'Emma Wilson',
        email: 'emma@example.com',
        points: 1850,
        rank: 4,
        badges: ['Assessment Master'],
        progress: {
          assessmentsCompleted: 9,
          skillsAssessed: 11,
          videosCompleted: 15,
          hackathonsJoined: 1
        },
        avatar: 'EW',
        joinDate: '2024-02-01',
        lastActive: '2024-01-25'
      },
      {
        id: '5',
        name: 'David Kim',
        email: 'david@example.com',
        points: 1650,
        rank: 5,
        badges: ['First Assessment'],
        progress: {
          assessmentsCompleted: 7,
          skillsAssessed: 8,
          videosCompleted: 12,
          hackathonsJoined: 1
        },
        avatar: 'DK',
        joinDate: '2024-02-05',
        lastActive: '2024-01-24'
      },
      // Current user placeholder (will be replaced with actual user data)
      {
        id: 'current-user',
        name: user?.displayName || 'Current User',
        email: user?.email || 'user@example.com',
        points: 1250,
        rank: 6,
        badges: ['First Assessment', 'Video Master', 'Hackathon Winner'],
        progress: {
          assessmentsCompleted: 6,
          skillsAssessed: 8,
          videosCompleted: 12,
          hackathonsJoined: 3
        },
        avatar: user?.displayName?.charAt(0) || 'U',
        isCurrentUser: true,
        joinDate: '2024-02-10',
        lastActive: '2024-01-28'
      }
    ];

    // Sort by points and update ranks
    const sortedData = mockData.sort((a, b) => b.points - a.points);
    const rankedData = sortedData.map((user, index) => ({
      ...user,
      rank: index + 1
    }));

    setLeaderboardData(rankedData);
    
    // Find current user's rank
    const currentUser = rankedData.find(u => u.id === 'demo-user');
    setUserRank(currentUser);
  }, [user]);

  // Load data on component mount
  useEffect(() => {
    loadLeaderboardData();
  }, [loadLeaderboardData]);

  // Utility functions
  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getPointsColor = (points) => {
    if (points >= 2500) return 'text-purple-600';
    if (points >= 2000) return 'text-blue-600';
    if (points >= 1500) return 'text-green-600';
    if (points >= 1000) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getSortedData = () => {
    switch (activeTab) {
      case 'assessments':
        return [...leaderboardData].sort((a, b) => 
          (b?.progress?.assessmentsCompleted || 0) - (a?.progress?.assessmentsCompleted || 0));
      case 'hackathons':
        return [...leaderboardData].sort((a, b) => 
          (b?.progress?.hackathonsJoined || 0) - (a?.progress?.hackathonsJoined || 0));
      case 'videos':
        return [...leaderboardData].sort((a, b) => 
          (b?.progress?.videosCompleted || 0) - (a?.progress?.videosCompleted || 0));
      default:
        return leaderboardData;
    }
  };

  const getColumnTitle = () => {
    switch (activeTab) {
      case 'assessments': return 'Assessments';
      case 'hackathons': return 'Hackathons';
      case 'videos': return 'Videos';
      default: return 'Points';
    }
  };

  const getColumnValue = (user) => {
    if (!user) return 0;
    switch (activeTab) {
      case 'assessments': return user?.progress?.assessmentsCompleted || 0;
      case 'hackathons': return user?.progress?.hackathonsJoined || 0;
      case 'videos': return user?.progress?.videosCompleted || 0;
      default: return user?.points || 0;
    }
  };

  const getColumnColor = (value) => {
    switch (activeTab) {
      case 'assessments':
        return value >= 10 ? 'text-green-600' : value >= 5 ? 'text-blue-600' : 'text-gray-600';
      case 'hackathons':
        return value >= 3 ? 'text-purple-600' : value >= 1 ? 'text-blue-600' : 'text-gray-600';
      case 'videos':
        return value >= 20 ? 'text-green-600' : value >= 10 ? 'text-blue-600' : 'text-gray-600';
      default:
        return getPointsColor(value);
    }
  };

  // Tab configuration
  const tabs = [
    { id: 'overall', label: '🏆 Overall Ranking', icon: '🏆' },
    { id: 'assessments', label: '📝 Assessment Masters', icon: '📝' },
    { id: 'hackathons', label: '🏆 Hackathon Winners', icon: '🏆' },
    { id: 'videos', label: '📹 Video Masters', icon: '📹' }
  ];

  // Points earning guide
  const pointsGuide = [
    { action: 'Complete Assessment', points: '+100', colorClass: 'bg-green-100' },
    { action: 'Watch Learning Videos', points: '+25', colorClass: 'bg-blue-100' },
    { action: 'Join Hackathon', points: '+200', colorClass: 'bg-purple-100' },
    { action: 'Win Hackathon', points: '+500', colorClass: 'bg-yellow-100' },
    { action: 'Daily Streak', points: '+50', colorClass: 'bg-red-100' },
    { action: 'Complete Learning Path', points: '+1000', colorClass: 'bg-indigo-100' }
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">🏅 Leaderboard</h2>
        <p className="text-yellow-100 text-lg">
          Compete with fellow developers and climb the ranks!
        </p>
      </div>

      {/* User Stats Section */}
      {userRank && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Ranking</h3>
          
          {/* User Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {userRank?.avatar || '?'}
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">{userRank?.name || 'Current User'}</h4>
                <p className="text-sm text-gray-600">{userRank?.email || 'user@example.com'}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{userRank?.points || 0} pts</div>
              <div className="text-sm text-gray-600">Rank #{userRank?.rank || 0}</div>
            </div>
          </div>
          
          {/* Progress Bars */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Assessments</span>
                <span className="font-medium">{userRank?.progress?.assessmentsCompleted || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${((userRank?.progress?.assessmentsCompleted || 0) / 15) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Skills</span>
                <span className="font-medium">{userRank?.progress?.skillsAssessed || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${((userRank?.progress?.skillsAssessed || 0) / 15) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Videos</span>
                <span className="font-medium">{userRank?.progress?.videosCompleted || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${((userRank?.progress?.videosCompleted || 0) / 30) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Hackathons</span>
                <span className="font-medium">{userRank?.progress?.hackathonsJoined || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${((userRank?.progress?.hackathonsJoined || 0) / 10) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table Section */}
      <div className="bg-white rounded-lg shadow">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Table Content */}
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              {/* Table Header */}
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {getColumnTitle()}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Badges
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Active
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="bg-white divide-y divide-gray-200">
                {getSortedData().map((user) => (
                  <tr
                    key={user?.id || Math.random().toString()}
                    className={`${user?.isCurrentUser ? 'bg-blue-50' : ''} hover:bg-gray-50`}
                  >
                    {/* Rank Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-gray-900">
                          {getRankIcon(user?.rank || 0)}
                        </span>
                      </div>
                    </td>

                    {/* User Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
                          {user?.avatar || '?'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            {user?.name || 'Unknown User'}
                            {user?.isCurrentUser && (
                              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{user?.email || 'No email'}</div>
                        </div>
                      </div>
                    </td>

                    {/* Score Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-lg font-bold ${getColumnColor(getColumnValue(user || {}))}`}>
                        {getColumnValue(user || {})}
                        {activeTab === 'overall' && ' pts'}
                      </div>
                    </td>

                    {/* Progress Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Assessments:</span>
                          <span className="ml-1 font-medium">{user?.progress?.assessmentsCompleted || 0}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Videos:</span>
                          <span className="ml-1 font-medium">{user?.progress?.videosCompleted || 0}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Skills:</span>
                          <span className="ml-1 font-medium">{user?.progress?.skillsAssessed || 0}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Hackathons:</span>
                          <span className="ml-1 font-medium">{user?.progress?.hackathonsJoined || 0}</span>
                        </div>
                      </div>
                    </td>

                    {/* Badges Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {user.badges?.slice(0, 2).map((badge, badgeIndex) => (
                          <span
                            key={badgeIndex}
                            className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full"
                          >
                            {badge}
                          </span>
                        ))}
                        {user.badges?.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{user.badges?.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Last Active Column */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastActive || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Points Guide Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">How to Earn Points</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            {pointsGuide.slice(0, 3).map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-8 h-8 ${item.colorClass} rounded-full flex items-center justify-center`}>
                  <span className="font-bold">+</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">{item.action}</p>
                  <p className="text-sm text-gray-600">{item.points} points</p>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {pointsGuide.slice(3).map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-8 h-8 ${item.colorClass} rounded-full flex items-center justify-center`}>
                  <span className="font-bold">+</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">{item.action}</p>
                  <p className="text-sm text-gray-600">{item.points} points</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
