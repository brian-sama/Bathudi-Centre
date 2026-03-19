import React from 'react';
import { TEAM } from '../constants';

const Team: React.FC = () => {
  return (
    <div className="pt-24 pb-20 bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-blue-500 font-bold uppercase tracking-widest text-sm mb-4">Our Experts</h2>
          <h3 className="text-3xl md:text-5xl font-orbitron font-bold text-white mb-6">Meet the Mentors</h3>
          <p className="text-gray-400 max-w-2xl mx-auto">
            The backbone of Bathudi Training Center. Our team comprises industry veterans dedicated to your success.
          </p>
        </div>

        {/* FIXED: Auto-centering grid for 3 cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {TEAM.map((member, idx) => (
            <div key={idx} className="group relative glass rounded-2xl overflow-hidden border border-white/5 p-4 text-center">
              <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-6">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://picsum.photos/400/400?random=${idx}`;
                  }}
                />
                <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h4 className="text-xl font-bold text-white mb-1">{member.name}</h4>
              <p className="text-blue-400 text-xs uppercase tracking-widest font-bold mb-4">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Team;