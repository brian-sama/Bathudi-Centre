import React, { useEffect } from 'react';
import { Page } from '../types';

interface PaymentSuccessProps {
  onNavigate: (page: Page) => void;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="glass p-8 sm:p-12 rounded-3xl max-w-lg w-full text-center border-green-500/20">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl text-green-500">✓</span>
        </div>
        <h1 className="text-3xl font-orbitron font-bold text-white mb-4">Payment Successful!</h1>
        <p className="text-gray-300 mb-8 leading-relaxed">
          Thank you for your payment. Your registration fee has been processed successfully. 
          Our admissions team will review your application and contact you shortly.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => onNavigate(Page.Apply)}
            className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10"
          >
            Review Application
          </button>
          <button
            onClick={() => onNavigate(Page.Home)}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20"
          >
            Return Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;