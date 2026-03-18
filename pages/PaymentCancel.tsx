import React from 'react';
import { Page } from '../types';

interface PaymentCancelProps {
  onNavigate: (page: Page) => void;
}

const PaymentCancel: React.FC<PaymentCancelProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
<<<<<<< HEAD
      <div className="glass p-8 sm:p-12 rounded-3xl max-w-lg w-full text-center border-amber-500/20">
        <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl text-amber-500">!</span>
        </div>
        <h1 className="text-3xl font-orbitron font-bold text-white mb-4">Payment Cancelled</h1>
        <p className="text-gray-400 mb-8 leading-relaxed">
          The payment process was cancelled. No charges were made. You can try again or return to the home page.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => onNavigate(Page.Apply)}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20"
          >
            Retry Payment
          </button>
          <button
            onClick={() => onNavigate(Page.Home)}
            className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10"
          >
            Return Home
          </button>
        </div>
=======
      <div className="glass p-8 rounded-3xl max-w-md w-full text-center">
        <div className="text-6xl mb-4 text-amber-500">❌</div>
        <h1 className="text-2xl font-orbitron font-bold text-white mb-2">Payment Cancelled</h1>
        <p className="text-gray-400 mb-6">
          Your payment was cancelled. You can try again or contact support if you need assistance.
        </p>
        <button
          onClick={() => onNavigate(Page.Apply)}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-bold"
        >
          Try Again
        </button>
>>>>>>> upstream/main
      </div>
    </div>
  );
};

export default PaymentCancel;