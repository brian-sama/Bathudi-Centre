import React from 'react';
import { Page } from '../../types';  // Go up two levels: pages/ -> src/ -> root

interface PaymentCancelProps {
  onNavigate: (page: Page) => void;
}

const PaymentCancel: React.FC<PaymentCancelProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-gray-900 pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-amber-500/20 rounded-full flex items-center justify-center mb-6">
            <span className="text-5xl">⏸️</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 font-orbitron">
            Payment Cancelled
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            Your payment was cancelled. No charges were made.
          </p>
        </div>

        <div className="glass p-8 rounded-3xl border border-amber-500/20 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">What would you like to do?</h2>
          <p className="text-gray-300 mb-6">
            You can try the payment again or complete your application by uploading proof of payment.
          </p>
          
          <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20">
            <p className="text-amber-400 text-sm">
              💡 Tip: You can always complete your payment later by uploading proof of EFT payment
            </p>
          </div>

          {/* Banking Details for EFT */}
          <div className="mt-6 p-4 bg-white/5 rounded-xl text-left">
            <h3 className="text-white font-bold mb-2 text-sm">Banking Details for EFT:</h3>
            <div className="space-y-1 text-xs text-gray-400">
              <p><span className="text-gray-500">Bank:</span> First National Bank</p>
              <p><span className="text-gray-500">Account Holder:</span> Tucoprox (PTY) Ltd t/a Bathudi Automotive</p>
              <p><span className="text-gray-500">Account Number:</span> 63097751622</p>
              <p><span className="text-gray-500">Branch Code:</span> 250655</p>
              <p><span className="text-gray-500">Amount:</span> R661.25</p>
              <p><span className="text-gray-500">Reference:</span> Your Name + ID Number</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.history.back()}
            className="px-8 py-3 glass text-white rounded-xl font-bold hover:bg-white/10 transition-colors border border-white/10"
          >
            ← Back to Application
          </button>
          <button
            onClick={() => onNavigate(Page.Home)}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold hover:from-blue-700 hover:to-cyan-600 transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;