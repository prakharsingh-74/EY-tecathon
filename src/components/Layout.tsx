import { LayoutDashboard, Bot, FileText, BarChart3, Settings } from 'lucide-react';
import { useState } from 'react';
import { LogOut, User, ChevronDown } from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';
import { HelpCenter } from './HelpCenter';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  user: { name: string; email: string; role: string };
  onLogout: () => void;
}

export function Layout({ children, currentPage, onNavigate, user, onLogout }: LayoutProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'agents', label: 'Agents', icon: Bot },
    { id: 'rfps', label: 'RFP Details', icon: FileText },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="text-gray-900">RFP Automation</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-50 to-blue-50 text-teal-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-200 space-y-3">
          <div className="px-4 py-3 bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg border border-teal-100">
            <p className="text-sm text-gray-600 mb-1">AI System Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-900">All Agents Active</span>
            </div>
          </div>

          {/* User Profile Section */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all group"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left overflow-hidden">
                <p className="text-sm text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.role}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onNavigate('profile');
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm">Profile Settings</span>
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="flex flex-col h-full">
          {/* Top Header Bar */}
          <header className="bg-white border-b border-gray-200 px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-gray-900">
                  {navItems.find(item => item.id === currentPage)?.label || 'Dashboard'}
                </h2>
                <p className="text-sm text-gray-600">Welcome back, {user.name.split(' ')[0]}</p>
              </div>
              <div className="flex items-center gap-2">
                <HelpCenter />
                <NotificationCenter />
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}