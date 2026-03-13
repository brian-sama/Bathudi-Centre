import React from 'react';

const About: React.FC = () => {
  return (
    <div className="pt-24 pb-20 bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <div className="relative">
            <div className="absolute -inset-4 bg-blue-600/20 blur-3xl rounded-full" />
            <div className="relative rounded-3xl overflow-hidden glass border border-white/10 p-2">
              <img 
                src="/images/28.jpeg" 
                alt="About us" 
                className="w-full h-full object-cover rounded-2xl"
                onError={(e) => {
                   (e.target as HTMLImageElement).src = 'https://picsum.photos/1200/800';
                }}
              />
            </div>
            <div className="absolute -bottom-10 -right-10 hidden md:block w-48 h-48 glass rounded-2xl p-6 border border-white/20 shadow-2xl">
              <span className="block text-4xl font-bold text-blue-500 mb-2">3+</span>
              <p className="text-gray-300 text-sm font-semibold uppercase tracking-widest">Years of Excellence</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-blue-500 font-bold uppercase tracking-widest text-sm mb-4">Who We Are</h2>
            <h3 className="text-3xl md:text-5xl font-orbitron font-bold text-white mb-8">Pioneers in Youth Skills</h3>
            <p className="text-gray-300 leading-relaxed mb-6">
              Founded in Hermanstad, Pretoria, Bathudi is more than a training centre—we are a bridge to opportunity. Our mission is to uplift, equip, and inspire youth by giving them the tools they need to succeed, regardless of their academic past. </p>
            <p className="text-gray-300 leading-relaxed mb-10">
              Bathudi Automotive Technical Training Centre is committed to giving South African youth a genuine second chance. In a world where lacking a matric can close countless doors, we aim to reopen them—providing accessible, practical pathways into the automotive industry.

             We empower young people to build real skills with their hands, gain confidence in their abilities, and shape sustainable futures through accredited technical training. As a QCTO–accredited institution, we offer high-quality, industry-aligned automotive skills programmes that prepare learners for employment, entrepreneurship, and lifelong growth.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-400 shrink-0">
                  🎯
                </div>
                <div>
                  <h5 className="text-white font-bold mb-1">Our Mission</h5>
                  <p className="text-gray-400 text-xs uppercase tracking-wider">To empower youth through skill-driven education.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-400 shrink-0">
                  🔭
                </div>
                <div>
                  <h5 className="text-white font-bold mb-1">Our Vision</h5>
                  <p className="text-gray-400 text-xs uppercase tracking-wider">To be the #1 automotive training centre in Gauteng.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;