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
 * Generate PayFast signature - URLs should NOT be encoded in the signature string
 * PayFast expects raw URLs in the signature calculation
 */
export const generatePayFastSignature = (data: PayFastData, passphrase: string): string => {
  // Create an array to hold all parameter strings
  const paramStrings: string[] = [];
  
  // Get all keys and sort them alphabetically (THIS IS CRITICAL)
  const sortedKeys = Object.keys(data).sort() as Array<keyof PayFastData>;
  
  // Build each parameter string - DO NOT ENCODE URLS FOR SIGNATURE
  for (const key of sortedKeys) {
    const value = data[key];
    // Skip undefined, null, or empty values
    if (value === undefined || value === null || value === '') {
      continue;
    }
    
    // Convert to string and trim
    const stringValue = value.toString().trim();
    
    // For signature: DO NOT encode URLs - use raw values
    // PayFast's documentation is clear: signature uses raw values
    paramStrings.push(`${key}=${stringValue}`);
  }
  
  // Add the passphrase (DO NOT ENCODE THE PASSPHRASE)
  paramStrings.push(`passphrase=${passphrase}`);
  
  // Join with & to create the final string
  const signatureString = paramStrings.join('&');
  
  // Log for debugging
  console.log('📝 Signature String (RAW):', signatureString);
  
  // Generate MD5 hash
  const signature = CryptoJS.MD5(signatureString).toString();
  console.log('✅ Signature:', signature);
  
  return signature;
};

export const PAYFAST_URLS = {
  sandbox: 'https://sandbox.payfast.co.za/eng/process',
  live: 'https://www.payfast.co.za/eng/process'
};

export const generatePaymentId = (): string => {
  return `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
};