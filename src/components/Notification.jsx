import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const notificationTypes = {
  success: {
    icon: CheckCircle,
    className: 'bg-green-50 border-green-200 text-green-800',
    iconClassName: 'text-green-600'
  },
  error: {
    icon: XCircle,
    className: 'bg-red-50 border-red-200 text-red-800',
    iconClassName: 'text-red-600'
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    iconClassName: 'text-yellow-600'
  },
  info: {
    icon: Info,
    className: 'bg-blue-50 border-blue-200 text-blue-800',
    iconClassName: 'text-blue-600'
  }
};

export default function Notification({ 
  type = 'info', 
  title, 
  message, 
  duration = 5000,
  onClose,
  show = true 
}) {
  const [isVisible, setIsVisible] = useState(show);
  const config = notificationTypes[type];
  const Icon = config.icon;

  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full animate-slide-in`}>
      <div className={`rounded-lg border p-4 shadow-lg ${config.className}`}>
        <div className="flex items-start space-x-3">
          <Icon size={20} className={`mt-0.5 ${config.iconClassName}`} />
          <div className="flex-1">
            {title && (
              <h4 className="font-medium mb-1">{title}</h4>
            )}
            {message && (
              <p className="text-sm">{message}</p>
            )}
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              onClose?.();
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
} 