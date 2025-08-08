import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function MetricsCard({ title, value, change, changeType = 'positive', icon: Icon }) {
  return (
    <div className="metrics-card group">
      <div className="flex items-center justify-between mb-4">
        {Icon && (
          <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
            <Icon size={20} className="text-blue-600" />
          </div>
        )}
        <div className={`flex items-center space-x-1 text-sm ${
          changeType === 'positive' ? 'text-green-600' : 'text-red-600'
        }`}>
          {changeType === 'positive' ? (
            <TrendingUp size={16} />
          ) : (
            <TrendingDown size={16} />
          )}
          <span>{change}</span>
        </div>
      </div>
      
      <div className="metrics-title">{title}</div>
      <div className="metrics-value">{value}</div>
    </div>
  );
} 