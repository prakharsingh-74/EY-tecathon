import { User, Mail, Briefcase, Calendar, Shield, Key, Bell } from 'lucide-react';
import { useState } from 'react';

interface ProfileProps {
  user: { name: string; email: string; role: string };
}

export function Profile({ user }: ProfileProps) {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [rfpAlerts, setRfpAlerts] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-600">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-gray-900 mb-6">Personal Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={user.name}
                    readOnly
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={user.email}
                    readOnly
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Role</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={user.role}
                    readOnly
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-gray-900">Security Settings</h3>
            </div>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-teal-200 hover:bg-gray-50 transition-all">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-gray-600" />
                  <div className="text-left">
                    <p className="text-gray-900">Change Password</p>
                    <p className="text-sm text-gray-500">Update your password regularly for security</p>
                  </div>
                </div>
                <span className="text-teal-600 text-sm">Update</span>
              </button>

              <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-teal-200 hover:bg-gray-50 transition-all">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-600" />
                  <div className="text-left">
                    <p className="text-gray-900">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">Add an extra layer of security</p>
                  </div>
                </div>
                <span className="text-gray-500 text-sm">Enable</span>
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-gray-900">Notification Preferences</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-500">Receive updates via email</p>
                </div>
                <button
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
                    emailNotifications ? 'bg-gradient-to-r from-teal-500 to-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${
                      emailNotifications ? 'left-7' : 'left-1'
                    }`}
                  ></div>
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="text-gray-900">RFP Match Alerts</p>
                  <p className="text-sm text-gray-500">Get notified of new high-match RFPs</p>
                </div>
                <button
                  onClick={() => setRfpAlerts(!rfpAlerts)}
                  className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
                    rfpAlerts ? 'bg-gradient-to-r from-teal-500 to-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${
                      rfpAlerts ? 'left-7' : 'left-1'
                    }`}
                  ></div>
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="text-gray-900">Weekly Reports</p>
                  <p className="text-sm text-gray-500">Receive weekly performance summaries</p>
                </div>
                <button
                  onClick={() => setWeeklyReports(!weeklyReports)}
                  className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
                    weeklyReports ? 'bg-gradient-to-r from-teal-500 to-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${
                      weeklyReports ? 'left-7' : 'left-1'
                    }`}
                  ></div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="w-20 h-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <User className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-center mb-1">{user.name}</h3>
            <p className="text-center text-sm text-white text-opacity-90 mb-4">{user.role}</p>
            <div className="flex items-center justify-center gap-2 text-sm">
              <Calendar className="w-4 h-4" />
              <span>Member since Dec 2025</span>
            </div>
          </div>

          {/* Account Stats */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-gray-900 mb-4">Account Activity</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">RFPs Processed</span>
                <span className="text-sm text-gray-900">47</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Responses Generated</span>
                <span className="text-sm text-gray-900">32</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="text-sm text-green-600">68%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last Login</span>
                <span className="text-sm text-gray-900">Today</span>
              </div>
            </div>
          </div>

          {/* Help */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-sm text-gray-900 mb-2">Need Help?</p>
            <p className="text-sm text-gray-600 mb-3">
              Contact our support team for assistance with your account.
            </p>
            <button className="w-full py-2 px-4 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all text-sm">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}