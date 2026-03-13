import React from 'react';
import { Page } from '../types';

interface PaymentCancelProps {
  onNavigate: (page: Page) => void;
}

const PaymentCancel: React.FC<PaymentCancelProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
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
      </div>
    </div>
  );
};

export default PaymentCancel;