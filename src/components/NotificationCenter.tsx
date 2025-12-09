import { useState } from 'react';
import { Bell, X, CheckCircle2, AlertCircle, Info, Clock } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'New RFP Match Detected',
    message: 'High-priority RFP from Fortune 500 company matches 94% of your capabilities',
    time: '2 minutes ago',
    read: false,
  },
  {
    id: '2',
    type: 'info',
    title: 'Response Generated',
    message: 'Master Agent completed proposal for RFP-2025-001',
    time: '15 minutes ago',
    read: false,
  },
  {
    id: '3',
    type: 'success',
    title: 'Agent Task Completed',
    message: 'Pricing Agent finished cost analysis for 3 RFPs',
    time: '1 hour ago',
    read: true,
  },
  {
    id: '4',
    type: 'warning',
    title: 'Deadline Approaching',
    message: 'RFP-2025-003 submission due in 48 hours',
    time: '2 hours ago',
    read: true,
  },
  {
    id: '5',
    type: 'info',
    title: 'System Update',
    message: 'AI models updated with latest industry data',
    time: '5 hours ago',
    read: true,
  },
];

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-pink-600 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 top-12 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-in slide-in-from-top-4 duration-200">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-900">Notifications</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-teal-600 hover:text-teal-700"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-all ${
                      !notification.read ? 'bg-blue-50 bg-opacity-50' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className={`text-sm ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-teal-600 rounded-full flex-shrink-0 mt-1"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{notification.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200">
              <button className="w-full py-2 text-sm text-teal-600 hover:text-teal-700 transition-colors">
                View all notifications
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
