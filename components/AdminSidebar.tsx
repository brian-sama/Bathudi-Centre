import React, { useState } from 'react';
import { Page } from '../types';

interface AdminSidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentPage, onNavigate, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Main navigation items
  const mainNavItems = [
    { id: Page.AdminDashboard, label: 'Dashboard', icon: '📊' },
    { id: Page.AdminStudents, label: 'Students', icon: '👥' },
    { id: Page.AdminApplications, label: 'Applications', icon: '📝' },
  ];

  // Content Management items
  const contentNavItems = [
    { id: Page.AdminCMS, label: 'Website Content', icon: '🌐' },
    { id: Page.StudentContent, label: 'Student Content', icon: '📢', badge: 'New' },
  ];

  // Settings items
  const settingsNavItems = [
    { id: Page.StudentNotifications, label: 'Push Notifications', icon: '🔔' },
    { id: Page.BroadcastMessages, label: 'Broadcast Messages', icon: '📣' },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavClick = (page: Page) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  const sidebarWidth = isCollapsed ? 'w-20' : 'w-64 lg:w-72';
  const showLabels = !isCollapsed;

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-[100] p-3 bg-slate-900 border border-white/10 rounded-xl text-white hover:bg-red-600/20 transition-colors"
        aria-label="Toggle menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>

      {/* Desktop Sidebar Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden lg:flex fixed bottom-4 left-4 z-[100] p-2 bg-slate-800 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
        aria-label="Toggle sidebar"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isCollapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
        </svg>
      </button>

      {/* Sidebar */}
      <aside className={`
        ${sidebarWidth} bg-slate-900 border-r border-white/10 flex flex-col h-screen sticky top-0 overflow-hidden
        transition-all duration-300 ease-in-out
        fixed lg:relative z-50
        ${isMobileMenuOpen ? 'left-0' : '-left-full lg:left-0'}
      `}>
        {/* Logo Section */}
        <div className="p-4 sm:p-6 border-b border-white/5">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <img 
              src="/images/bathudi logo.png" 
              alt="Logo" 
              className="h-8 sm:h-10 w-auto flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://picsum.photos/40/40';
              }}
            />
            {showLabels && (
              <div className="flex flex-col overflow-hidden">
                <span className="font-orbitron font-bold text-xs sm:text-sm text-white leading-none truncate">BATHUDI</span>
                <span className="text-[8px] sm:text-[10px] text-red-400 font-medium tracking-widest uppercase truncate">Admin Panel</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-grow overflow-y-auto px-2 sm:px-3 py-4">
          {/* Main Section */}
          <div className="mb-4">
            {showLabels && <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 px-2">MAIN</h3>}
            <div className="space-y-1">
              {mainNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2 sm:py-3 rounded-lg transition-all duration-300 group ${
                    currentPage === item.id 
                      ? 'bg-red-600 shadow-lg shadow-red-600/20 text-white' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                  title={isCollapsed ? item.label : ''}
                >
                  <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
                    <span className="text-base sm:text-lg">{item.icon}</span>
                    {showLabels && <span className="font-semibold text-xs sm:text-sm">{item.label}</span>}
                  </div>
                  {currentPage === item.id && showLabels && (
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content Management Section */}
          <div className="mb-4">
            {showLabels && <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 px-2">CONTENT</h3>}
            <div className="space-y-1">
              {contentNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2 sm:py-3 rounded-lg transition-all duration-300 group ${
                    currentPage === item.id 
                      ? 'bg-red-600 shadow-lg shadow-red-600/20 text-white' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                  title={isCollapsed ? item.label : ''}
                >
                  <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
                    <span className="text-base sm:text-lg">{item.icon}</span>
                    {showLabels && <span className="font-semibold text-xs sm:text-sm">{item.label}</span>}
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.badge && showLabels && (
                      <span className="text-[8px] sm:text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded">
                        {item.badge}
                      </span>
                    )}
                    {currentPage === item.id && showLabels && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Communication Section */}
          <div className="mb-4">
            {showLabels && <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 px-2">COMMUNICATION</h3>}
            <div className="space-y-1">
              {settingsNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2 sm:py-3 rounded-lg transition-all duration-300 group ${
                    currentPage === item.id 
                      ? 'bg-red-600 shadow-lg shadow-red-600/20 text-white' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                  title={isCollapsed ? item.label : ''}
                >
                  <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
                    <span className="text-base sm:text-lg">{item.icon}</span>
                    {showLabels && <span className="font-semibold text-xs sm:text-sm">{item.label}</span>}
                  </div>
                  {currentPage === item.id && showLabels && (
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Footer - Admin Profile & Logout */}
        <div className="p-3 sm:p-4 border-t border-white/5 space-y-3">
          {/* Admin Profile */}
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} p-2 sm:p-3 glass rounded-xl group cursor-pointer hover:bg-white/5 transition-colors`}>
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center font-bold text-white text-xs sm:text-sm">
                A
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 border-2 border-slate-900 rounded-full animate-pulse"></div>
            </div>
            {showLabels && (
              <div className="flex flex-col overflow-hidden flex-grow">
                <span className="text-[10px] sm:text-xs font-bold text-white truncate">System Admin</span>
                <span className="text-[8px] sm:text-[9px] text-gray-400 truncate">admin@bathudi.co.za</span>
              </div>
            )}
            {showLabels && (
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 group-hover:text-white transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>

          {/* Logout Button */}
          <button 
            onClick={onLogout}
            className={`w-full ${isCollapsed ? 'px-2' : 'px-3 sm:px-4'} py-2 sm:py-2.5 border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-white rounded-lg text-[10px] sm:text-xs font-bold transition-all duration-300 flex items-center justify-center space-x-2 group`}
            title={isCollapsed ? 'Logout' : ''}
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4 group-hover:rotate-180 transition-transform flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {showLabels && <span>Logout</span>}
          </button>
        </div>

        {/* Mobile close button */}
        {isMobileMenuOpen && (
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-2 bg-slate-800 rounded-lg text-gray-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <style>{`
        .glass {
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          background-color: rgba(255, 255, 255, 0.05);
        }
        
        .font-orbitron {
          font-family: 'Orbitron', sans-serif;
        }
        
        nav::-webkit-scrollbar {
          width: 4px;
        }
        
        nav::-webkit-scrollbar-track {
          background: transparent;
        }
        
        nav::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        
        nav::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        @media (max-width: 768px) {
          button {
            min-height: 44px;
          }
        }
      `}</style>
    </>
  );
};

export default AdminSidebar;