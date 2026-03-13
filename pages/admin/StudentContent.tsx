import React from 'react';
import { Page } from '../../types';

interface StudentContentProps {
  onNavigate: (page: Page) => void;
}

const StudentContent: React.FC<StudentContentProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="glass p-12 rounded-3xl border border-white/5 max-w-2xl w-full text-center animate-fadeIn">
        {/* Construction Icons */}
        <div className="flex justify-center space-x-4 mb-8">
          <div className="text-6xl animate-bounce">🚧</div>
          <div className="text-6xl animate-spin-slow">⚙️</div>
          <div className="text-6xl animate-pulse">🔧</div>
        </div>
        
        {/* Phase Badge */}
        <div className="inline-block px-4 py-2 bg-blue-600/20 rounded-full border border-blue-500/30 mb-6">
          <span className="text-blue-400 font-bold text-sm uppercase tracking-wider">Phase 2 Development</span>
        </div>
        
        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-orbitron font-bold text-white mb-4">
          Student Content
        </h1>
        
        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 mx-auto mb-6 rounded-full"></div>
        
        {/* Description */}
        <p className="text-gray-400 text-lg mb-8">
          This section is currently under construction and moderation. 
          The student content management features will be available in the next phase of development.
        </p>
        
        {/* Coming Soon Features */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 mb-8 text-left">
          <h3 className="text-blue-400 font-bold text-lg mb-4 flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
            Coming Soon:
          </h3>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-center">
              <span className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center mr-3 text-blue-400 text-xs">✓</span>
              Student login and authentication portal
            </li>
            <li className="flex items-center">
              <span className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center mr-3 text-blue-400 text-xs">✓</span>
              Personal dashboard for each student
            </li>
            <li className="flex items-center">
              <span className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center mr-3 text-blue-400 text-xs">✓</span>
              Course materials and progress tracking
            </li>
            <li className="flex items-center">
              <span className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center mr-3 text-blue-400 text-xs">✓</span>
              Fee payment history and statements
            </li>
            <li className="flex items-center">
              <span className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center mr-3 text-blue-400 text-xs">✓</span>
              Document management system
            </li>
            <li className="flex items-center">
              <span className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center mr-3 text-blue-400 text-xs">✓</span>
              Announcements and notifications
            </li>
          </ul>
        </div>
        
        
        
        {/* Return Button */}
        <button
          onClick={() => onNavigate(Page.AdminDashboard)}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl font-bold transition-all shadow-xl shadow-blue-600/20 transform hover:scale-105 active:scale-95"
        >
          Return to Dashboard
        </button>
        
        {/* Version */}
        <p className="text-xs text-gray-600 mt-8">
          Student Content Management v0.1 - Development Preview
        </p>
      </div>

      <style>{`
        .glass {
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          background-color: rgba(17, 25, 40, 0.75);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        .font-orbitron {
          font-family: 'Orbitron', sans-serif;
        }
      `}</style>
    </div>
  );
};

export default StudentContent;