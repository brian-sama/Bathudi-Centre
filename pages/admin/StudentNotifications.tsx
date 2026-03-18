import React, { useState } from 'react';
import { Page, StudentNotification } from '../../types';

interface StudentNotificationsProps {
  onNavigate: (page: Page) => void;
}

const StudentNotifications: React.FC<StudentNotificationsProps> = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState<StudentNotification[]>([
    {
      id: 1,
      title: 'Payment Reminder',
      message: 'Your payment is due in 3 days',
      type: 'warning',
      created_at: '2024-10-25T10:30:00',
      is_read: false
    },
    {
      id: 2,
      title: 'Assignment Graded',
      message: 'Your Engine Diagnostics assignment has been graded',
      type: 'info',
      created_at: '2024-10-24T14:20:00',
      is_read: true
    },
    {
      id: 3,
      title: 'System Alert',
      message: 'Portal maintenance scheduled for tonight',
      type: 'alert',
      created_at: '2024-10-23T09:15:00',
      is_read: false
    },
    {
      id: 4,
      title: 'Achievement Unlocked',
      message: 'Perfect attendance for October',
      type: 'success',
      created_at: '2024-10-22T16:45:00',
      is_read: true
    }
  ]);

  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'warning' | 'alert' | 'success',
    target: 'all' as 'all' | 'course' | 'specific'
  });

  const handleSendNotification = () => {
    if (!newNotification.title.trim() || !newNotification.message.trim()) {
      alert('Please fill in all fields');
      return;
    }

    const notification: StudentNotification = {
      id: notifications.length + 1,
      title: newNotification.title,
      message: newNotification.message,
      type: newNotification.type,
      created_at: new Date().toISOString(),
      is_read: false
    };

    setNotifications([notification, ...notifications]);
    setNewNotification({ title: '', message: '', type: 'info', target: 'all' });
    alert('Notification sent successfully!');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <header>
        <h1 className="text-2xl lg:text-3xl font-orbitron font-bold text-white mb-2">
          Push Notifications
        </h1>
        <p className="text-gray-400">
          Send instant notifications to students
        </p>
      </header>

      {/* Quick Send Form */}
      <div className="glass p-6 rounded-xl border border-white/5">
        <h2 className="text-lg font-bold text-white mb-4">Send New Notification</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Title
            </label>
            <input
              type="text"
              value={newNotification.title}
              onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500"
              placeholder="Enter notification title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Message
            </label>
            <textarea
              value={newNotification.message}
              onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500 min-h-[100px]"
              placeholder="Enter notification message"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Type
              </label>
              <select
                value={newNotification.type}
                onChange={(e) => setNewNotification({...newNotification, type: e.target.value as any})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500"
              >
                <option value="info">Information</option>
                <option value="warning">Warning</option>
                <option value="alert">Alert</option>
                <option value="success">Success</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Target
              </label>
              <select
                value={newNotification.target}
                onChange={(e) => setNewNotification({...newNotification, target: e.target.value as any})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500"
              >
                <option value="all">All Students</option>
                <option value="course">Specific Course</option>
                <option value="specific">Specific Students</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSendNotification}
            className="w-full py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-xl font-bold transition-all"
          >
            Send Notification
          </button>
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="glass rounded-xl border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-white/3">
          <h2 className="text-lg font-bold text-white">Recent Notifications</h2>
          <p className="text-sm text-gray-400 mt-1">
            {notifications.length} notification(s) sent
          </p>
        </div>

        <div className="divide-y divide-white/5">
          {notifications.map((notification) => (
            <div key={notification.id} className="p-4 hover:bg-white/5 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-3 h-3 rounded-full ${
                      notification.type === 'info' ? 'bg-blue-500' :
                      notification.type === 'warning' ? 'bg-yellow-500' :
                      notification.type === 'alert' ? 'bg-red-500' : 'bg-green-500'
                    }`} />
                    <h3 className="font-bold text-white">{notification.title}</h3>
                    {!notification.is_read && (
                      <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
                        Unread
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{notification.message}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
                <button className="text-gray-500 hover:text-white">
                  •••
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentNotifications;
