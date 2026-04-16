import React, { useEffect, useState } from 'react';
import { TEAM } from '../constants';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface TeamMember {
  id: number;
  name: string;
  position: string;
  bio: string;
  email: string;
  phone: string;
  image: string;
  image_url: string;
  order: number;
}

const Team: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await fetch(`${API_BASE}/team/`);
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            setMembers(data);
          } else {
            useFallback();
          }
        } else {
          useFallback();
        }
      } catch (err) {
        useFallback();
      } finally {
        setLoading(false);
      }
    };

    const useFallback = () => {
      // Map static TEAM to the interface
      const fallback = TEAM.map((m, idx) => ({
        id: idx,
        name: m.name,
        position: m.role || 'Member',
        bio: 'Dedicated professional at Bathudi Training Centre with years of industry experience.',
        email: 'info@bathudi.co.za',
        phone: '',
        image: m.image,
        image_url: m.image,
        order: idx
      }));
      setMembers(fallback);
    };

    fetchTeam();
  }, []);

  if (loading) {
    return (
      <div className="pt-24 pb-20 bg-slate-950 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-500"></div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 bg-slate-950 min-h-screen relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
             <span className="text-fuchsia-500 font-bold uppercase tracking-[0.2em] text-[10px]">Excellence in Leadership</span>
          </div>
          <h3 className="text-4xl md:text-6xl font-orbitron font-bold text-white mb-6 tracking-tight">
            Meet Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-rose-500">Mentors</span>
          </h3>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            The core of <span className="text-white font-semibold">Bathudi Automotive</span>. Our professionals bring decades of field-tested engineering expertise to every training program.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12 max-w-6xl mx-auto">
          {members.map((member, idx) => (
            <div 
              key={member.id || idx} 
              className="group relative flex flex-col bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden hover:border-fuchsia-500/50 transition-all duration-500 hover:-translate-y-2 shadow-2xl hover:shadow-fuchsia-500/10"
            >
              {/* Image Section */}
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                <img 
                  src={member.image_url || member.image || '/images/5.jpg'} 
                  alt={member.name} 
                  className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://picsum.photos/600/800?random=${idx}`;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />
                
                {/* Name & Position inside image area for modern look */}
                <div className="absolute bottom-6 left-6 right-6">
                   <h4 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">{member.name}</h4>
                   <p className="text-fuchsia-400 text-sm font-bold uppercase tracking-widest drop-shadow-md">
                     {member.position}
                   </p>
                </div>
              </div>

              {/* Bio & Contact */}
              <div className="p-8 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-gray-400 text-sm leading-relaxed mb-8 line-clamp-4 italic">
                    "{member.bio || 'Providing world-class technical education to the next generation of automotive professionals at BaThUdi.'}"
                  </p>
                </div>
                
                <div className="pt-6 border-t border-white/5 space-y-4">
                  {member.email && (
                    <a 
                      href={`mailto:${member.email}`} 
                      className="flex items-center space-x-3 text-gray-400 hover:text-fuchsia-400 transition-colors group/link"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover/link:bg-fuchsia-500/20 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="text-xs font-medium truncate">{member.email}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Subtle underline glow */}
              <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-fuchsia-500 to-rose-500 group-hover:w-full transition-all duration-700" />
            </div>
          ))}
        </div>

        {/* Dynamic CTA */}
        <div className="mt-24 text-center">
           <p className="text-gray-500 text-sm mb-6">Want to join our Team ?</p>
           <button className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-white hover:bg-white/10 transition-all font-medium">
             Submit Professional Inquiry
           </button>
        </div>
      </div>
    </div>
  );
};

export default Team;
