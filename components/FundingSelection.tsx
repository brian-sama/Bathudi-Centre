import React, { useState } from 'react';

interface FundingSelectionProps {
  onSelect: (funding_type: 'self_funded' | 'funding_needed') => void;
}

const FundingSelection: React.FC<FundingSelectionProps> = ({ onSelect }) => {
  const [showFundingMessage, setShowFundingMessage] = useState(false);
  const [selectedFunding, setSelectedFunding] = useState<'self_funded' | 'funding_needed' | null>(null);

  const handleFundingSelect = (funding_type: 'self_funded' | 'funding_needed') => {
    setSelectedFunding(funding_type);
    
    if (funding_type === 'funding_needed') {
      setShowFundingMessage(true);
      setTimeout(() => {
        setShowFundingMessage(false);
      }, 3000);
    } else {
      onSelect(funding_type);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-orbitron font-bold text-white mb-4">
          How will you fund your training?
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Select whether you are self-funded or require funding support for your studies.
        </p>
      </div>

      {showFundingMessage && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[999] animate-pulse">
          <div className="bg-amber-600/90 text-white px-8 py-6 rounded-2xl shadow-2xl border border-amber-500 max-w-md">
            <div className="text-center">
              <div className="text-4xl mb-3">⏱️</div>
              <p className="text-lg font-semibold">Coming Soon!</p>
              <p className="text-sm mt-2 text-amber-100">
                Currently Funding is not available but will be available soon
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Self-Funded Option */}
        <button
          onClick={() => handleFundingSelect('self_funded')}
          className={`group relative p-8 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
            selectedFunding === 'self_funded'
              ? 'bg-emerald-600/20 border-emerald-500 shadow-lg shadow-emerald-500/30'
              : 'bg-slate-900/50 border-white/10 hover:border-emerald-500/50'
          }`}
        >
          <div className="text-5xl mb-4">💰</div>
          <h3 className="text-2xl font-bold text-white mb-3">Self-Funded</h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            I will pay for my training fees directly. Get started immediately with flexible payment options.
          </p>
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-emerald-400 font-semibold text-sm">✓ Start immediately</p>
            <p className="text-emerald-400 font-semibold text-sm mt-1">✓ Flexible payments</p>
            <p className="text-emerald-400 font-semibold text-sm mt-1">✓ Full course access</p>
          </div>
          {selectedFunding === 'self_funded' && (
            <div className="absolute top-4 right-4 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </button>

        {/* Funding Needed Option */}
        <button
          onClick={() => handleFundingSelect('funding_needed')}
          className={`group relative p-8 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
            selectedFunding === 'funding_needed'
              ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/30'
              : 'bg-slate-900/50 border-white/10 hover:border-blue-500/50 opacity-75'
          }`}
          disabled={true}
        >
          <div className="text-5xl mb-4">🎓</div>
          <h3 className="text-2xl font-bold text-white mb-3">Funding Needed</h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            I need financial assistance to complete my training. We're working on funding options for you.
          </p>
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="inline-block px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full">
              <p className="text-amber-400 font-semibold text-xs">Coming Soon</p>
            </div>
          </div>
          {selectedFunding === 'funding_needed' && (
            <div className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </button>
      </div>

      {selectedFunding === 'self_funded' && (
        <div className="flex justify-center mt-12">
          <button
            onClick={() => onSelect('self_funded')}
            className="px-12 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-full font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/30"
          >
            Continue with Self-Funding
          </button>
        </div>
      )}
    </div>
  );
};

export default FundingSelection;
