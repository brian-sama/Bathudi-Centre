import CryptoJS from 'crypto-js';

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
 * Generate PayFast signature
 * All parameters should be sent to PayFast exactly as they are used in the signature
 */
export const generatePayFastSignature = (data: PayFastData, passphrase: string): string => {
  const paramStrings: string[] = [];
  
  // Get all keys and sort them alphabetically
  const sortedKeys = Object.keys(data).sort() as Array<keyof PayFastData>;
  
  for (const key of sortedKeys) {
    const value = data[key];
    if (value === undefined || value === null || value === '') {
      continue;
    }
    
    // Convert to string and trim, then URL encode
    const stringValue = encodeURIComponent(value.toString().trim()).replace(/%20/g, '+');
    paramStrings.push(`${key}=${stringValue}`);
  }
  
  // Add the passphrase if it exists
  if (passphrase) {
    paramStrings.push(`passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`);
  }
  
  const signatureString = paramStrings.join('&');
  return CryptoJS.MD5(signatureString).toString();
};

export const PAYFAST_URLS = {
  sandbox: 'https://sandbox.payfast.co.za/eng/process',
  live: 'https://www.payfast.co.za/eng/process'
};

export const generatePaymentId = (): string => {
  return `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
};

/**
 * Helper to initiate a PayFast payment by creating and submitting a form
 */
export const initiatePayFastPayment = (paymentData: PayFastData, passphrase: string, isSandbox: boolean = true) => {
  const signature = generatePayFastSignature(paymentData, passphrase);
  
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = isSandbox ? PAYFAST_URLS.sandbox : PAYFAST_URLS.live;
  
  // Add all data fields
  Object.entries(paymentData).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value.toString();
      form.appendChild(input);
    }
  });
  
  // Add signature
  const signatureInput = document.createElement('input');
  signatureInput.type = 'hidden';
  signatureInput.name = 'signature';
  signatureInput.value = signature;
  form.appendChild(signatureInput);
  
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};