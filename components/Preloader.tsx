import React, { useEffect, useState } from 'react';

const ElegantPreloader: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsVisible(false), 300);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-slate-900 via-gray-900 to-slate-950 flex items-center justify-center">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.1),transparent_50%)]"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center p-8">
        <div className="relative mb-12">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl shadow-blue-500/20">
            {!imageError ? (
              <img 
                src="/images/logo1.jpg" 
                alt="Bathudi Logo" 
                className="w-full h-full object-cover"
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  const img = e.currentTarget;
                  console.error("❌ Preloader logo failed to load. Attempted path:", img.src);
                  console.log("Current window location:", window.location.href);
                  console.log("Base URL:", document.baseURI);
                  setImageError(true);
                }}
                onLoad={() => console.log("✅ Preloader logo loaded successfully from:", "/images/logo1.jpg")}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-2xl">BTC</span>
              </div>
            )}
          </div>
          
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute w-4 h-4 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 z-10"
              style={{
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) rotate(${i * 120 + (progress / 100) * 360}deg) translateX(100px)`,
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
                animation: `orbit 4s linear infinite ${i * 0.5}s`
              }}
            ></div>
          ))}
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 font-orbitron">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500">
              Bathudi Training
            </span>
          </h1>
          <p className="text-gray-400 text-lg">Loading your experience...</p>
        </div>

        <div className="w-80 max-w-full mb-6">
          <div className="relative">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 rounded-full transition-all duration-300 relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>
            </div>
            
            <div className="absolute inset-0 flex justify-between items-center px-2 -top-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full border-2 ${
                    progress >= i * 25 ? 'bg-blue-400 border-blue-400' : 'bg-transparent border-white/20'
                  }`}
                ></div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between mt-3">
            <span className="text-sm text-gray-400">0%</span>
            <span className="text-blue-400 font-bold">{progress}%</span>
            <span className="text-sm text-gray-400">100%</span>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center space-x-3 text-gray-400">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm">
              {progress < 30 && 'Initializing system...'}
              {progress >= 30 && progress < 60 && 'Loading course materials...'}
              {progress >= 60 && progress < 90 && 'Preparing interface...'}
              {progress >= 90 && 'Almost ready...'}
            </span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Bathudi Training Center. All rights reserved.</p>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes orbit {
          0% {
            transform: translate(-50%, -50%) rotate(0deg) translateX(100px) rotate(0deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg) translateX(100px) rotate(-360deg);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ElegantPreloader;