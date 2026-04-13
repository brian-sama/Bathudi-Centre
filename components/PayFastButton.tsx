import React, { useState } from 'react';

interface PayFastButtonProps {
  applicationId: number | null;
  customerName?: string;
  customerEmail?: string;
  onPaymentInitiated?: () => void;
  onError?: (error: string) => void;
  className?: string;
  buttonText?: string;
  disabled?: boolean;
}

const PayFastButton: React.FC<PayFastButtonProps> = ({
  applicationId,
  customerName = '',
  customerEmail = '',
  onPaymentInitiated,
  onError,
  className = '',
  buttonText = 'Pay with PayFast',
  disabled = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  void customerName;
  void customerEmail;

  const handlePayment = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!applicationId) {
      const errorMsg = 'Application ID is required';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
      const currentUrl = window.location.origin;
      const returnUrl = `${currentUrl}/payment-success`;
      const cancelUrl = `${currentUrl}/payment-cancel`;

      const response = await fetch(`${API_BASE_URL}/payfast/initiate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          application_id: applicationId,
          return_url: returnUrl,
          cancel_url: cancelUrl,
        }),
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok || !data?.payfast_url || !data?.form_data) {
        throw new Error(data?.error || 'Payment initiation failed');
      }

      onPaymentInitiated?.();

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = data.payfast_url;
      form.style.display = 'none';

      Object.entries(data.form_data).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred while processing payment';
      console.error('PayFast Error:', errorMsg);
      setError(errorMsg);
      onError?.(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      <button
        onClick={handlePayment}
        disabled={disabled || loading || !applicationId}
        type="button"
        className={`
          w-full px-6 py-3 sm:py-4
          bg-gradient-to-r from-blue-600 to-blue-500
          hover:from-blue-700 hover:to-blue-600
          disabled:from-gray-500 disabled:to-gray-400
          disabled:cursor-not-allowed
          text-white font-bold rounded-xl
          transition-all duration-200
          shadow-lg shadow-blue-500/20
          flex items-center justify-center gap-3
          text-sm sm:text-base
          ${className}
        `}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5 sm:h-6 sm:w-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm0 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 10 15.5 10 14 10.67 14 11.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 10 8.5 10 7 10.67 7 11.5 7.67 13 8.5 13zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
            </svg>
            <span>{buttonText}</span>
          </>
        )}
      </button>

      {error && (
        <div className="p-3 sm:p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-xs sm:text-sm text-red-400">
            <span className="font-semibold">Error: </span>
            {error}
          </p>
        </div>
      )}

      {!applicationId && (
        <div className="p-3 sm:p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p className="text-xs sm:text-sm text-amber-400">
            <span className="font-semibold">Note: </span>
            Application information is needed to process payment
          </p>
        </div>
      )}

      <p className="text-[10px] sm:text-xs text-gray-500 text-center">
        Secure payment powered by PayFast
        <br />
        Your payment information is handled securely by PayFast
      </p>
    </div>
  );
};

export default PayFastButton;
