import React, { useState, useEffect } from 'react';
import { Page } from '../types';
import { VALUES } from '../constants';

interface Slogan {
  id: number;
  text: string;
  highlightWord: string | string[];
}

interface HomeProps {
  onNavigate: (page: Page) => void;
  onViewNews: (id: string) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const Home: React.FC<HomeProps> = ({ onNavigate, onViewNews }) => {
  const HARDCODED_SLOGANS: Slogan[] = [
    {
      id: 1,
      text: "WELCOME HOME",
      highlightWord: "HOME"
    },
    {
      id: 2,
      text: "LEARN TODAY LEAD TOMORROW",
      highlightWord: ["LEARN", "LEAD"]
    },
    {
      id: 4,
      text: "BUILDING BRIGHTER FUTURES",
      highlightWord: "BRIGHTER"
    }
  ];

  const slogans = HARDCODED_SLOGANS;
  const [newsPosts, setNewsPosts] = useState<any[]>([]);
  const [currentSloganIdx, setCurrentSloganIdx] = useState(0);
  const [bgImageIdx, setBgImageIdx] = useState(0);
  const [directorData, setDirectorData] = useState<any>(null);
  
  const bgImages = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '13.jpeg', '14.jpeg', '7.jpg', '8.jpg', '9.jpg', '16.jpeg','17.jpeg','18.jpeg','32.jpeg'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching from:', API_BASE_URL);
        
        const [nRes, dRes] = await Promise.all([
          fetch(`${API_BASE_URL}/news-posts/`),
          fetch(`${API_BASE_URL}/director-message/active/`)
        ]);
        
        if (nRes.ok) {
          const newsData = await nRes.json();
          console.log('News data fetched:', newsData.length);
          setNewsPosts(newsData.slice(0, 3));
        } else {
          console.warn('News fetch failed:', nRes.status);
        }
        
        if (dRes.ok) {
          const directorData = await dRes.json();
          console.log('Director data fetched:', directorData);
          setDirectorData(directorData);
        }
      } catch (e) { 
        console.warn('Backend not synced:', e); 
      }
    };

    fetchData();

    const sloganTimer = setInterval(() => {
      setCurrentSloganIdx((prev) => (prev + 1) % slogans.length);
    }, 6000);
    
    const bgTimer = setInterval(() => {
      setBgImageIdx((prev) => (prev + 1) % bgImages.length);
    }, 6000);

    return () => { 
      clearInterval(sloganTimer); 
      clearInterval(bgTimer); 
    };
  }, []);

  const renderSlogan = (slogan: Slogan) => {
    if (!slogan || !slogan.text) {
      return <span className="text-white">BUILD YOUR TOMORROW</span>;
    }
    
    const { text, highlightWord } = slogan;
    
    if (Array.isArray(highlightWord)) {
      const highlightWords = highlightWord.map(word => word.trim()).filter(word => word);
      let resultText = text;
      
      highlightWords.forEach((word) => {
        if (resultText.includes(word)) {
          resultText = resultText.replace(
            word, 
            `<span class="text-blue-400 font-bold">${word}</span>`
          );
        }
      });
      
      return <span dangerouslySetInnerHTML={{ __html: resultText }} />;
    }
    
    if (highlightWord && text.includes(highlightWord)) {
      const parts = text.split(highlightWord);
      return (
        <>
          {parts.map((part: string, index: number) => (
            <React.Fragment key={index}>
              <span className="text-white">{part}</span>
              {index < parts.length - 1 && (
                <span className="text-blue-400 font-bold">{highlightWord}</span>
              )}
            </React.Fragment>
          ))}
        </>
      );
    }
    
    return <span className="text-white">{text}</span>;
  };

  const activeSlogan = slogans[currentSloganIdx];

  return (
    <div className="flex flex-col">
      {/* Hero Section - Mobile optimized */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {bgImages.map((img, idx) => (
          <div key={img} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === bgImageIdx ? 'opacity-100' : 'opacity-0'}`}>
            <img 
              src={`/images/${img}`} 
              className="w-full h-full object-cover" 
              alt="Background" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/60 to-slate-950/90" />
          </div>
        ))}

        <div className="relative z-10 text-center px-3 sm:px-4 max-w-5xl mx-auto">
          <div className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 mb-4 sm:mb-6 glass rounded-full border border-blue-500/30">
            <span className="text-[10px] sm:text-xs text-blue-400 font-bold tracking-widest uppercase">Skills Development Institute</span>
          </div>
          
          <h1 className="font-orbitron text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight animate-fadeIn px-2">
            {renderSlogan(activeSlogan)}
          </h1>
          
          <p className="text-gray-300 text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl mx-auto mb-6 sm:mb-8 md:mb-10 font-light px-4">
            Empowering South African youth with world-class automotive training. Join the masters of mechanics today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
            <button 
              onClick={() => onNavigate(Page.Apply)} 
              className="w-full sm:w-auto min-w-[200px] px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg shadow-xl transition-all
                bg-red-900/40 backdrop-blur-md border border-red-500/30
                hover:bg-red-800/50 hover:border-red-400/50 hover:shadow-red-500/20
                text-white"
            >
              Start Application
            </button>
            
            <button 
              onClick={() => onNavigate(Page.Courses)} 
              className="w-full sm:w-auto min-w-[200px] px-6 sm:px-8 py-3 sm:py-4 glass text-white rounded-full font-bold text-base sm:text-lg border border-white/20 hover:bg-white/10 transition-all"
            >
              View Courses
            </button>
          </div>
        </div>
      </section>

      {/* Values Section - Mobile optimized */}
      <section className="py-16 sm:py-20 md:py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-orbitron font-bold text-white mb-12 sm:mb-16">Our Values</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 text-left">
            {VALUES.map((val) => (
              <div 
                key={val.title} 
                className="glass p-6 sm:p-8 rounded-2xl border border-white/5 transition-all group cursor-pointer
                  hover:border-red-500/30 hover:bg-red-950/10 hover:shadow-lg hover:shadow-red-900/10"
              >
                <div className="text-3xl sm:text-4xl mb-4 sm:mb-6 transform group-hover:scale-125 transition-transform">{val.icon}</div>
                <h4 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 group-hover:text-red-300 transition-colors">{val.title}</h4>
                <p className="text-sm sm:text-base text-gray-400 group-hover:text-gray-300 transition-colors">{val.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Campus Updates & Video - Mobile optimized */}
      <section className="py-16 sm:py-20 md:py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-orbitron font-bold text-white mb-12 sm:mb-16 text-center">Campus Updates & Messages</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Campus Updates */}
            <div className="lg:col-span-2">
              <h3 className="text-xl sm:text-2xl font-orbitron font-bold text-white mb-6 sm:mb-8 flex items-center">
                <span className="mr-3">📰</span> Latest News
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {newsPosts.map(news => (
                  <div 
                    key={news.id} 
                    className="glass rounded-2xl border border-white/5 overflow-hidden group cursor-pointer transition-all duration-300
                      hover:border-red-500/30 hover:bg-gradient-to-br hover:from-red-950/20 hover:to-transparent hover:transform hover:-translate-y-1"
                    onClick={() => onViewNews(news.id.toString())}
                  >
                    <div className="relative h-40 sm:h-48 overflow-hidden">
                      <img 
                        src={news.image_url} 
                        alt={news.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-red-900/0 group-hover:bg-red-900/20 transition-all duration-300" />
                    </div>
                    
                    <div className="p-4 sm:p-6">
                      <h4 className="text-base sm:text-lg font-bold text-white mb-2 sm:mb-3 line-clamp-2 group-hover:text-red-300 transition-colors">
                        {news.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4 line-clamp-3 group-hover:text-gray-300 transition-colors">
                        {news.preview_text || news.content.substring(0, 150)}...
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] sm:text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                          {new Date(news.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        <span className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded-full flex items-center transition-all
                          bg-blue-500/20 text-blue-400 group-hover:bg-red-500/20 group-hover:text-red-300">
                          Read More
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {newsPosts.length === 0 && (
                  <div className="col-span-2 text-center py-12 glass rounded-2xl border border-white/5
                    hover:border-red-500/30 hover:bg-red-950/10 transition-all">
                    <div className="text-5xl mb-4">📰</div>
                    <h4 className="text-xl font-bold text-white mb-2">No News Yet</h4>
                    <p className="text-gray-400">Stay tuned for upcoming campus announcements and updates.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Director's Message Sidebar - Mobile optimized */}
            <div>
              <h3 className="text-xl sm:text-2xl font-orbitron font-bold text-white mb-6 sm:mb-8 flex items-center">
                <span className="mr-3">🎥</span> Director's Message
              </h3>
              <div className="space-y-6">
                <div className="aspect-video rounded-2xl overflow-hidden glass border border-white/10
                  hover:border-red-500/30 transition-all">
                  {directorData ? (
                    directorData.video_file ? (
                      <video controls className="w-full h-full object-cover">
                        <source src={directorData.video_file} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    ) : directorData.video_url ? (
                      <iframe 
                        src={directorData.video_url.replace('watch?v=', 'embed/')} 
                        className="w-full h-full" 
                        allowFullScreen
                        title="Director's Message"
                      ></iframe>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 bg-gradient-to-br from-blue-900/20 to-slate-800/20">
                        <div className="text-center">
                          <div className="text-5xl mb-4">📽️</div>
                          <p>Video coming soon</p>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 bg-gradient-to-br from-blue-900/20 to-slate-800/20">
                      <div className="text-center">
                        <div className="text-5xl mb-4 animate-pulse">⏳</div>
                        <p>Loading director's message...</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <blockquote className="glass p-4 sm:p-6 rounded-2xl border border-white/5
                  hover:border-red-500/30 hover:bg-red-950/10 transition-all">
                  <div className="text-3xl sm:text-4xl text-blue-400 mb-3 sm:mb-4">"</div>
                  <p className="text-sm sm:text-base text-gray-300 italic mb-3 sm:mb-4">
                    {directorData?.quote || "Join us in shaping the future of South African automotive excellence through quality education and hands-on training."}
                  </p>
                  <div className="flex items-center pt-3 sm:pt-4 border-t border-white/10">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-white font-bold text-xs sm:text-sm">D</span>
                    </div>
                    <div>
                      <p className="text-sm sm:text-base text-white font-bold">Director</p>
                      <p className="text-xs sm:text-sm text-gray-400">Bathudi Training Center</p>
                    </div>
                  </div>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;