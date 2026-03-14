

export interface PayFastData {
  merchant_id: string;
  merchant_key: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  name_first?: string;
  name_last?: string;
  email_address?: string;
  cell_number?: string;
  m_payment_id?: string;
  amount: string;
  item_name: string;
  item_description?: string;
  email_confirmation?: '1' | '0';
  confirmation_address?: string;
  payment_method?: string;
}

/**
 * Securely initiate a PayFast payment by fetching a signed payload from the backend.
 * No merchant credentials or passphrases are stored in the frontend.
 */
export const initiatePayFastPayment = async (data: {
  amount: string;
  item_name: string;
  email_address: string;
  name_first?: string;
  name_last?: string;
  cell_number?: string;
}) => {
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'https://bathudi.co.za/api';
    // The payments endpoint is usually relative to the base URL, not the /api/ prefix
    const BASE_URL = API_URL.endsWith('/api') ? API_URL.slice(0, -4) : API_URL;
    
    // 1. Request signed payload from Django backend
    const response = await fetch(`${BASE_URL}/payments/create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create secure payment session');
    }

    const { payload, url } = await response.json();

    // 2. Create and submit the PayFast form
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = url;

    Object.entries(payload).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value as string;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  } catch (error) {
    console.error('PayFast redirection error:', error);
    alert('Could not initiate payment. Please try again later.');
  }
};