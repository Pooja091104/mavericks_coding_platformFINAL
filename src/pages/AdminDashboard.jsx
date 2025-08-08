import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Award, Activity, Settings, LogOut } from 'lucide-react';
import RecentActivityTable from '../analytics/components/RecentActivityTable';
import AdminAIAssistant from '../analytics/components/AdminAIAssistant';
import ChatInteractions from '../analytics/components/ChatInteractions';
import HackathonPanel from '../user/components/HackathonPanel';
// Local storage keys
const LOCAL_STORAGE_KEYS = {
  USERS: 'admin_dashboard_users',
  ACTIONS: 'admin_actions',
  ACHIEVEMENTS: 'admin_achievements'
};

// Mock achievements data
const getAdminAchievements = (counts) => {
  const achievements = [];
  if (counts.user_added >= 1) {
    achievements.push({ id: 'user_added_1', label: 'First User Added', icon: '👥' });
  }
  if (counts.assessment_reviewed >= 5) {
    achievements.push({ id: 'assessments_5', label: 'Assessment Master', icon: '📝' });
  }
  if (counts.hackathon_created >= 3) {
    achievements.push({ id: 'hackathon_3', label: 'Hackathon Host', icon: '🏆' });
  }
  return achievements;
};

function AdminGamificationBanner({ user }) {
  const [counts, setCounts] = useState({ user_added: 0, assessment_reviewed: 0, hackathon_created: 0 });
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [motivation, setMotivation] = useState('');

  useEffect(() => {
    // Load actions from localStorage
    const loadActions = () => {
      const savedActions = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.ACTIONS) || '[]');
      const countsData = { user_added: 0, assessment_reviewed: 0, hackathon_created: 0 };
      
      savedActions.forEach(action => {
        if (countsData[action.actionType] !== undefined) {
          countsData[action.actionType]++;
        }
      });
      
      setCounts(countsData);
      const ach = getAdminAchievements(countsData);
      setAchievements(ach);
      
      let msg = '';
      if (countsData.hackathon_created >= 5) msg = "You're a Hackathon Champion! 🥇";
      else if (countsData.user_added >= 10) msg = "You've built a thriving community! 🧑‍🤝‍🧑";
      else if (countsData.assessment_reviewed >= 1) msg = "You're helping users grow! 📝";
      else if (ach.length > 0) msg = "Keep up the great work!";
      else msg = "Start taking actions to earn achievements!";
      
      setMotivation(msg);
      setLoading(false);
    };
    
    // Initial load
    loadActions();
    
    // Set up storage event listener for cross-tab synchronization
    const handleStorageChange = (e) => {
      if (e.key === LOCAL_STORAGE_KEYS.ACTIONS) {
        loadActions();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-gray-100 rounded-lg p-4 mb-2 animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-1/2 mb-2"></div>
        <div className="flex space-x-2">
          <div className="h-6 w-6 bg-gray-100 rounded-full"></div>
          <div className="h-6 w-6 bg-gray-100 rounded-full"></div>
          <div className="h-6 w-6 bg-gray-100 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-100 to-purple-50 border border-purple-200 rounded-lg p-4 mb-2 flex flex-col md:flex-row md:items-center md:justify-between">
      <div className="mb-2 md:mb-0 text-purple-900 font-semibold text-lg flex items-center gap-2">
        <span className="mr-2">{motivation}</span>
        {achievements.length > 0 && (
          <span className="inline-flex items-center space-x-1">
            {achievements.map((a) => (
              <span key={a.id} title={a.label} className="text-2xl" aria-label={a.label}>
                {a.icon}
              </span>
            ))}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-gray-700">
        <span className="bg-white border border-purple-200 rounded px-2 py-1">Users Added: {counts.user_added}</span>
        <span className="bg-white border border-purple-200 rounded px-2 py-1">Assessments Reviewed: {counts.assessment_reviewed}</span>
        <span className="bg-white border border-purple-200 rounded px-2 py-1">Hackathons Created: {counts.hackathon_created}</span>
      </div>
    </div>
  );
}

export default function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    assessmentsCompleted: 0,
    averageScore: 0,
  });
  const [userList, setUserList] = useState([]);
  const [error, setError] = useState(null);
  
  const fetchDashboardData = async () => {
    try {
      // Load users from localStorage
      const savedUsers = localStorage.getItem(LOCAL_STORAGE_KEYS.USERS) || '[]';
      const users = JSON.parse(savedUsers);
      
      // Update user list
      setUserList(users);
      
      // Calculate stats
      const totalUsers = users.length;
      const activeUsers = Math.ceil(totalUsers * 0.7); // 70% of users are active
      const assessmentsCompleted = Math.floor(totalUsers * 2.5); // Average 2.5 assessments per user
      
      setStats({
        totalUsers,
        activeUsers,
        assessmentsCompleted,
        averageScore: 75, // Mock average score
      });
      
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    // Initialize with mock data if none exists
    const initializeUsers = () => {
      const savedUsers = localStorage.getItem(LOCAL_STORAGE_KEYS.USERS);
      if (!savedUsers) {
        const mockUsers = [
          { id: '1', displayName: 'Admin User', email: 'admin@example.com', role: 'admin', lastLogin: new Date().toISOString() },
          { id: '2', displayName: 'John Doe', email: 'john@example.com', role: 'user', lastLogin: new Date(Date.now() - 86400000).toISOString() },
          { id: '3', displayName: 'Jane Smith', email: 'jane@example.com', role: 'user', lastLogin: new Date(Date.now() - 172800000).toISOString() }
        ];
        localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(mockUsers));
      }
    };

    initializeUsers();
    fetchDashboardData();
    
    // Set up storage event listener for cross-tab synchronization
    const handleStorageChange = (e) => {
      if (e.key === LOCAL_STORAGE_KEYS.USERS) {
        fetchDashboardData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  // Update stats when userList changes
  useEffect(() => {
    const totalUsers = userList.length;
    const activeUsers = Math.ceil(totalUsers * 0.7);
    const assessmentsCompleted = Math.floor(totalUsers * 2.5);
    
    setStats({
      totalUsers,
      activeUsers,
      assessmentsCompleted,
      averageScore: 78.5
    });
  }, [userList]);

  // Helper function to save users to localStorage
  const saveUsers = (users) => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(users));
    setUserList(users);
    // Trigger storage event for other tabs
    window.dispatchEvent(new Event('storage'));
  };
  
  // Helper function to add a new action
  const addAction = (actionType) => {
    const actions = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.ACTIONS) || '[]');
    const newAction = {
      id: Date.now().toString(),
      actionType,
      timestamp: new Date().toISOString(),
      adminId: user?.uid || 'anonymous'
    };
    actions.push(newAction);
    localStorage.setItem(LOCAL_STORAGE_KEYS.ACTIONS, JSON.stringify(actions));
    // Trigger storage event for other tabs
    window.dispatchEvent(new Event('storage'));
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'hackathons', label: 'Hackathons', icon: Award },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">A</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Manage your platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-gray-50 rounded-lg px-3 py-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">{user.displayName?.charAt(0) || 'A'}</span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user.displayName}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={20} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
            <button onClick={fetchDashboardData} className="ml-4 text-sm underline">
              Retry
            </button>
          </div>
        )}

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <AdminGamificationBanner user={user} />
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="metrics-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users size={20} className="text-blue-600" />
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-green-600">
                    <TrendingUp size={16} />
                    <span>+12%</span>
                  </div>
                </div>
                <div className="metrics-title">Total Users</div>
                <div className="metrics-value">{stats.totalUsers.toLocaleString()}</div>
              </div>
              <div className="metrics-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Activity size={20} className="text-green-600" />
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-green-600">
                    <TrendingUp size={16} />
                    <span>+8%</span>
                  </div>
                </div>
                <div className="metrics-title">Active Users</div>
                <div className="metrics-value">{stats.activeUsers.toLocaleString()}</div>
              </div>
              <div className="metrics-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Award size={20} className="text-yellow-600" />
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-green-600">
                    <TrendingUp size={16} />
                    <span>+15%</span>
                  </div>
                </div>
                <div className="metrics-title">Assessments</div>
                <div className="metrics-value">{stats.assessmentsCompleted.toLocaleString()}</div>
              </div>
              <div className="metrics-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp size={20} className="text-purple-600" />
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-green-600">
                    <TrendingUp size={16} />
                    <span>+5%</span>
                  </div>
                </div>
                <div className="metrics-title">Avg Score</div>
                <div className="metrics-value">{stats.averageScore}%</div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="card">
                  <div className="card-header">
                    <h2 className="card-title">Recent Activity</h2>
                    <p className="card-subtitle">Latest user activities and assessments</p>
                  </div>
                  <RecentActivityTable />
                </div>
              </div>
              <div className="space-y-6">
                <div className="card">
                  <div className="card-header">
                    <h2 className="card-title">Quick Actions</h2>
                  </div>
                  <div className="space-y-3">
                    <button className="w-full btn btn-primary">Add New User</button>
                    <button className="w-full btn btn-secondary">Create Assessment</button>
                    <button className="w-full btn btn-secondary">Schedule Hackathon</button>
                    <button className="w-full btn btn-secondary">Generate Report</button>
                  </div>
                </div>
                <div className="card">
                  <div className="card-header">
                    <h2 className="card-title">Admin AI Assistant</h2>
                    <p className="card-subtitle">Get help with administrative tasks</p>
                  </div>
                  <div className="p-4">
                    <AdminAIAssistant user={user} />
                  </div>
                </div>
                <div className="card">
                  <div className="card-header">
                    <h2 className="card-title">Platform Status</h2>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Server Status</span>
                      <span className="badge badge-success">Online</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Database</span>
                      <span className="badge badge-success">Connected</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">API Services</span>
                      <span className="badge badge-success">Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Last Backup</span>
                      <span className="text-sm text-gray-900">2 hours ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users */}
        {activeTab === 'users' && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">User Management</h2>
              <p className="card-subtitle">Manage platform users and their access</p>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-medium">Platform Users</h3>
                  <p className="text-sm text-gray-500">Total users: {stats.totalUsers}</p>
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    const newUser = {
                      id: Date.now().toString(),
                      displayName: `User ${userList.length + 1}`,
                      email: `user${userList.length + 1}@example.com`,
                      role: 'user',
                      lastLogin: new Date().toISOString()
                    };
                    const updatedUsers = [...userList, newUser];
                    saveUsers(updatedUsers);
                    addAction('user_added');
                  }}
                >
                  <Users size={16} className="mr-2" /> Add New User
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {userList.map((u) => (
                      <tr key={u.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.displayName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.role || 'User'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.lastLogin || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                            onClick={() => {
                              // Toggle role between user and admin
                              const updatedUsers = userList.map(usr => 
                                usr.id === u.id 
                                  ? { ...usr, role: usr.role === 'admin' ? 'user' : 'admin' } 
                                  : usr
                              );
                              saveUsers(updatedUsers);
                              addAction('user_updated');
                            }}
                          >
                            {u.role === 'admin' ? 'Make User' : 'Make Admin'}
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-900"
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete ${u.displayName}?`)) {
                                const updatedUsers = userList.filter(usr => usr.id !== u.id);
                                saveUsers(updatedUsers);
                                addAction('user_deleted');
                              }
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="metrics-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users size={20} className="text-blue-600" />
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-green-600">
                    <TrendingUp size={16} />
                    <span>+12%</span>
                  </div>
                </div>
                <div className="metrics-title">New Users</div>
                <div className="metrics-value">145</div>
              </div>
              <div className="metrics-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Activity size={20} className="text-green-600" />
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-green-600">
                    <TrendingUp size={16} />
                    <span>+8%</span>
                  </div>
                </div>
                <div className="metrics-title">Engagement</div>
                <div className="metrics-value">72%</div>
              </div>
              <div className="metrics-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Award size={20} className="text-yellow-600" />
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-green-600">
                    <TrendingUp size={16} />
                    <span>+15%</span>
                  </div>
                </div>
                <div className="metrics-title">Completions</div>
                <div className="metrics-value">312</div>
              </div>
              <div className="metrics-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp size={20} className="text-purple-600" />
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-green-600">
                    <TrendingUp size={16} />
                    <span>+5%</span>
                  </div>
                </div>
                <div className="metrics-title">Growth</div>
                <div className="metrics-value">5.2%</div>
              </div>
            </div>
            <ChatInteractions />
          </div>
        )}

        {/* Hackathons */}
        {activeTab === 'hackathons' && (
          <div className="card">
            <HackathonPanel user={user} />
          </div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Settings</h2>
              <p className="card-subtitle">Manage your account and platform preferences</p>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Display Name</label>
                <input
                  type="text"
                  defaultValue={user.displayName}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  defaultValue={user.email}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                />
              </div>
              <div className="flex justify-end">
                <button className="btn btn-primary">Save Changes</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
