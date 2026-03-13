import React, { useState, useEffect } from 'react';
import { Page } from '../types';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onStudentPortal?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate, onStudentPortal }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen]);

  const menuItems = [
    { label: 'Home', page: Page.Home },
    { label: 'Courses', page: Page.Courses },
    { label: 'About', page: Page.About },
    { label: 'Gallery', page: Page.Gallery },
    { label: 'Team', page: Page.Team },
  ];

  const handleLogoClick = () => {
    onNavigate(Page.Home);
    setIsMobileMenuOpen(false);
  };

  const handleNavClick = (page: Page) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'py-2 md:py-3 glass-dark shadow-lg' 
        : 'py-3 md:py-4 bg-gradient-to-b from-slate-950/90 to-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo Section - UPDATED HEADING */}
        <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group" onClick={handleLogoClick}>
          <div className="relative">
            <img 
              src="/images/bathudi logo.png" 
              alt="Bathudi Training Center Logo" 
              className="h-14 sm:h-16 md:h-20 lg:h-27 w-auto transition-all duration-300 group-hover:scale-110 group-hover:rotate-2"
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                const img = e.currentTarget;
                console.error("❌ Navbar logo failed to load. Attempted path:", img.src);
                setLogoError(true);
              }}
              onLoad={() => console.log("✅ Navbar logo loaded successfully from:", "/images/bathudi logo.png")}
            />
            {logoError && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-600 rounded-lg">
                <span className="text-white font-bold text-base sm:text-lg">BTC</span>
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-orbitron font-bold text-base sm:text-lg md:text-xl lg:text-2xl text-white tracking-tight leading-tight">
              BATHUDI
            </span>
            <span className="text-[8px] sm:text-[10px] md:text-xs lg:text-sm text-red-400 font-medium tracking-widest uppercase">
              SKILLS DEVELOPMENT TRAINING CENTRE
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
          {menuItems.map((item) => (
            <button
              key={item.page}
              onClick={() => handleNavClick(item.page)}
              className={`relative text-xs xl:text-sm font-semibold uppercase tracking-wider transition-all duration-300 ${
                currentPage === item.page 
                  ? 'text-red-500' 
                  : 'text-gray-300 hover:text-red-400'
              }`}
            >
              {item.label}
              {currentPage === item.page && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-red-400 rounded-full"></span>
              )}
            </button>
          ))}
          <div className="h-6 w-[1px] bg-white/10 mx-2" />
          {onStudentPortal && (
            <button 
              onClick={onStudentPortal}
              className="text-[10px] xl:text-xs font-bold text-blue-400 hover:text-white transition-colors uppercase tracking-widest"
            >
              Student Portal
            </button>
          )}
          <button 
            onClick={() => handleNavClick(Page.Apply)}
            className="relative px-5 xl:px-6 py-2 xl:py-2.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-full font-bold transition-all transform hover:scale-105 shadow-lg shadow-red-500/25 active:scale-95 group overflow-hidden text-xs xl:text-sm"
          >
            <span className="relative z-10">APPLY NOW</span>
            <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden p-2 text-white hover:text-red-400 transition-colors relative z-50 focus:outline-none"
          onClick={(e) => {
            e.stopPropagation();
            setIsMobileMenuOpen(!isMobileMenuOpen);
          }}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          <div className="w-5 h-5 sm:w-6 sm:h-6 flex flex-col justify-center items-center">
            <span className={`block h-0.5 w-5 sm:w-6 bg-current transform transition-transform duration-300 ${
              isMobileMenuOpen ? 'rotate-45 translate-y-1.5 sm:translate-y-1.5' : '-translate-y-1 sm:-translate-y-1'
            }`}></span>
            <span className={`block h-0.5 w-5 sm:w-6 bg-current transition-opacity duration-300 ${
              isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
            }`}></span>
            <span className={`block h-0.5 w-5 sm:w-6 bg-current transform transition-transform duration-300 ${
              isMobileMenuOpen ? '-rotate-45 -translate-y-1.5 sm:-translate-y-1.5' : 'translate-y-1 sm:translate-y-1'
            }`}></span>
          </div>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-950/98 backdrop-blur-md pt-20 z-40 animate-fadeIn"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div className="max-w-7xl mx-auto px-4">
            <div className="space-y-2 animate-slideDown">
              {menuItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => handleNavClick(item.page)}
                  className={`block w-full text-left px-4 sm:px-6 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold transition-all duration-300 ${
                    currentPage === item.page 
                      ? 'bg-red-600/30 text-red-400 border-l-4 border-red-400' 
                      : 'text-gray-300 hover:bg-red-950/30 hover:text-red-300 hover:border-l-4 hover:border-red-400/50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              {onStudentPortal && (
                <button 
                  onClick={onStudentPortal}
                  className="block w-full text-left px-4 sm:px-6 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 transition-all duration-300"
                >
                  Student Portal
                </button>
              )}
              <button 
                onClick={() => handleNavClick(Page.Apply)}
                className="block w-full text-left px-4 sm:px-6 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-bold bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600 transition-all duration-300 transform hover:scale-[1.02] active:scale-95"
              >
                APPLY NOW
              </button>
              
              {/* Contact Info in Mobile Menu */}
              <div className="mt-8 pt-8 border-t border-white/10">
                <div className="space-y-4 text-gray-400">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-sm">+27 12 345 6789</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">info@bathuditraining.co.za</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Page Indicator (Desktop) */}
      {currentPage !== Page.Home && (
        <div className="hidden lg:block absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500/20 to-transparent"></div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideDown {
          from { 
            opacity: 0;
            transform: translateY(-20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        .animate-slideDown {
          animation: slideDown 0.4s ease-out forwards;
        }
        
        .glass-dark {
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          background-color: rgba(17, 25, 40, 0.85);
          border-bottom: 1px solid rgba(255, 255, 255, 0.125);
        }
        
        .font-orbitron {
          font-family: 'Orbitron', sans-serif;
        }
        
        @media (max-width: 1024px) {
          button {
            min-height: 44px;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;