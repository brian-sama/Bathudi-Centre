import React, { useEffect } from 'react';
import { Page } from '../types';

interface PaymentSuccessProps {
  onNavigate: (page: Page) => void;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ onNavigate }) => {
  useEffect(() => {
    // You can add analytics here
    console.log('Payment successful');
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="glass p-8 rounded-3xl max-w-md w-full text-center">
        <div className="text-6xl mb-4 text-green-500">✅</div>
        <h1 className="text-2xl font-orbitron font-bold text-white mb-2">Payment Successful!</h1>
        <p className="text-gray-400 mb-6">
          Your registration fee payment has been processed successfully. You can now complete your application.
        </p>
        <button
          onClick={() => onNavigate(Page.Apply)}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-bold"
        >
          Return to Application
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;