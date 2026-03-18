import React, { useEffect, useState } from 'react';
import { Page } from '../../types';  // Go up two levels: pages/ -> src/ -> root

interface PaymentSuccessProps {
  onNavigate: (page: Page) => void;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ onNavigate }) => {
  const [paymentId, setPaymentId] = useState<string | null>(null);

  useEffect(() => {
    // Get payment ID from URL if available
    const urlParams = new URLSearchParams(window.location.search);
    const mPaymentId = urlParams.get('m_payment_id');
    if (mPaymentId) {
      setPaymentId(mPaymentId);
    }

    // You can also send a confirmation to your backend here
    console.log('Payment successful', { mPaymentId });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-gray-900 pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <span className="text-5xl">✅</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 font-orbitron">
            Payment Successful!
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            Thank you for your payment. Your registration fee has been received successfully.
          </p>
          {paymentId && (
            <div className="bg-white/5 p-3 rounded-lg inline-block mb-4">
              <p className="text-gray-400 text-sm">Payment Reference:</p>
              <p className="text-blue-400 font-mono text-sm">{paymentId}</p>
            </div>
          )}
        </div>

        <div className="glass p-8 rounded-3xl border border-green-500/20 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">What happens next?</h2>
          <ul className="text-left text-gray-300 space-y-3">
            <li className="flex items-start">
              <span className="text-green-400 mr-3 font-bold">1.</span>
              <span>Your application has been submitted for review</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-3 font-bold">2.</span>
              <span>We will verify your documents within 3-5 working days</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-3 font-bold">3.</span>
              <span>You will receive an email confirmation with next steps</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-3 font-bold">4.</span>
              <span>Our admissions team will contact you via phone</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => onNavigate(Page.Home)}
            className="px-8 py-3 glass text-white rounded-xl font-bold hover:bg-white/10 transition-colors border border-white/10"
          >
            Go to Homepage
          </button>
          <button
            onClick={() => onNavigate(Page.Courses)}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold hover:from-blue-700 hover:to-cyan-600 transition-colors"
          >
            View Courses
          </button>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-sm text-gray-500">
          <p>If you have any questions, contact us at:</p>
          <p className="text-blue-400">info@bathudi.co.za | +27 68 917 6294</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;