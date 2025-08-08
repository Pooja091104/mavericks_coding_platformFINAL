import React from 'react';
import { 
  Home, 
  Target, 
  Trophy, 
  Users, 
  FileText,
  Settings,
  HelpCircle
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'resume', label: 'Resume Builder', icon: FileText },
    { id: 'assessment', label: 'Skill Assessment', icon: Target },
    { id: 'hackathons', label: 'Hackathons', icon: Trophy },
    { id: 'leaderboard', label: 'Leaderboard', icon: Users },
  ];

  return (
    <aside className="w-64 bg-white/95 backdrop-blur-md shadow-xl border-r border-gray-200/60 min-h-screen">
      <div className="p-6">
        {/* Navigation Items */}
        <nav className="space-y-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-4 px-4 py-4 rounded-xl text-left transition-all duration-300 relative overflow-hidden group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/50 hover:text-gray-900 hover:shadow-md hover:transform hover:scale-102'
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse"></div>
                )}
                <Icon 
                  size={20} 
                  className={`relative z-10 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'}`} 
                />
                <span className="font-semibold relative z-10">{item.label}</span>
                {isActive && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </button>
            );
          })}
        </nav>
        
        {/* Bottom Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="space-y-2">
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200">
              <Settings size={20} className="text-gray-400" />
              <span className="font-medium">Settings</span>
            </button>
            
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200">
              <HelpCircle size={20} className="text-gray-400" />
              <span className="font-medium">Help & Support</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}