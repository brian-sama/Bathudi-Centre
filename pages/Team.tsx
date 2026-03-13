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
              <div className="flex justify-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button className="text-gray-400 hover:text-white transition-colors">
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                 </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Team;