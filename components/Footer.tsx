import React from 'react';
import { Page } from '../types';

interface FooterProps {
  onNavigate: (page: Page) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  // Quick link handler
  const handleQuickLinkClick = (page: Page) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* First Row - Logo and Brand */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <img 
                src="/images/bathudi logo.png" 
                alt="Bathudi Automotive Technical Center Logo" 
                className="h-12 w-auto"
                onError={(e) => {
                   (e.target as HTMLImageElement).src = 'https://picsum.photos/50/50';
                }}
              />
              <div className="flex flex-col">
                <span className="font-orbitron font-bold text-lg text-white leading-none">BATHUDI</span>
                <span className="text-[8px] text-blue-400 font-medium tracking-widest uppercase">Automotive Technical Center</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              South Africa's premier automotive training institute dedicated to empowering youth through specialized skills development.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => handleQuickLinkClick(Page.Home)}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleQuickLinkClick(Page.Courses)}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Courses
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleQuickLinkClick(Page.About)}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  About Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleQuickLinkClick(Page.Gallery)}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Gallery
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleQuickLinkClick(Page.Team)}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Team
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleQuickLinkClick(Page.Apply)}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Apply Now
                </button>
              </li>
            </ul>
          </div>

          {/* Address */}
          <div>
            <h4 className="text-white font-bold mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Address
            </h4>
            <p className="text-gray-400 text-sm leading-loose">
              771 Helen Street,<br />
              Hermanstad, Pretoria,<br />
              South Africa
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Contact
            </h4>
            <p className="text-gray-400 text-sm mb-4">
              <span className="block text-blue-400 font-medium mb-1 uppercase text-xs tracking-wider">Phone</span>
              +27 68 917 6294
            </p>
            <p className="text-gray-400 text-sm">
              <span className="block text-blue-400 font-medium mb-1 uppercase text-xs tracking-wider">Email</span>
              info@bathudi.co.za
            </p>
          </div>
        </div>

        {/* Second Row - Social Media and Hours */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 pt-8 border-t border-white/5">
          {/* Social Media */}
          <div className="lg:col-span-1">
            <h4 className="text-white font-bold mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Connect With Us
            </h4>
            <div className="flex space-x-4">
              <a 
                href="https://www.facebook.com/p/Bathudi-Automotive-Technical-Training-Centre-61572944273711/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center hover:bg-blue-600 transition-colors"
              >
                <span className="sr-only">Facebook</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.14h-3v4h3v12h5v-12h3.85l.42-4z"/>
                </svg>
              </a>
              
              <a 
                href="https://www.instagram.com/bathudi_training/?hl=en" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center hover:bg-pink-600 transition-colors"
              >
                <span className="sr-only">Instagram</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              
              <a 
                href="https://www.linkedin.com/in/bathudi-automotive-technical-training-centre-0a427b386/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <span className="sr-only">LinkedIn</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="lg:col-span-3">
            <h4 className="text-white font-bold mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Operational Hours
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                <span className="text-gray-400 text-sm">Mon – Fri:</span>
                <span className="text-white font-medium text-sm">08:00 – 17:00</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                <span className="text-gray-400 text-sm">Saturday:</span>
                <span className="text-white font-medium text-sm">Closed</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                <span className="text-gray-400 text-sm">Sunday:</span>
                <span className="text-white font-medium text-sm">Closed</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-white/5 text-center">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} Bathudi Automotive Technical Center. All rights reserved. Professional Automotive Training.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;