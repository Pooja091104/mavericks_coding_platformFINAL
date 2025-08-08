import React from 'react';
import { FolderOpen, Plus } from 'lucide-react';

export default function EmptyState({ 
  title = 'No data available', 
  description = 'There are no items to display at the moment.',
  actionText,
  onAction,
  icon: Icon = FolderOpen 
}) {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon size={24} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="btn btn-primary inline-flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
} 