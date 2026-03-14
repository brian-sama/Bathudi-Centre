import CryptoJS from 'crypto-js';

export interface PayFastData {
  merchant_id: string;
  merchant_key: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  name_first: string;
  name_last: string;
  email_address: string;
  cell_number?: string;
  m_payment_id: string;
  amount: string;
  item_name: string;
  item_description?: string;
  email_confirmation?: string;
  confirmation_address?: string;
}

// PayFast URLs
export const PAYFAST_URLS = {
  sandbox: 'https://sandbox.payfast.co.za/eng/process',
  live: 'https://www.payfast.co.za/eng/process'
};

// Generate MD5 signature for PayFast
export const generatePayFastSignature = (data: PayFastData, passphrase: string): string => {
  // Create parameter string
  const sortedKeys = Object.keys(data).sort() as Array<keyof PayFastData>;
  
  let pfOutput = '';
  sortedKeys.forEach(key => {
    const value = data[key];
    if (value !== undefined && value !== null && value !== '') {
      pfOutput += `${key}=${encodeURIComponent(value.toString().trim()).replace(/%20/g, '+')}&`;
    }
  });
  
  // Add passphrase
  if (passphrase) {
    pfOutput += `passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
  } else {
    // Remove trailing & if no passphrase
    pfOutput = pfOutput.slice(0, -1);
  }
  
  // Generate MD5 hash
  return CryptoJS.MD5(pfOutput).toString();
};

// Generate unique payment ID
export const generatePaymentId = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  const paddedRandom = random.toString().padStart(6, '0');
  return `BATHUDI-${timestamp}-${paddedRandom}`;
};

// Validate PayFast ITN response (for backend)
export const validatePayFastITN = (data: any, passphrase: string, sandbox = false): boolean => {
  // This would be used on the backend to validate incoming ITN notifications
  const { signature, ...paymentData } = data;
  
  // Remove any fields that shouldn't be included in signature
  const fieldsToExclude = ['signature', 'action'];
  const filteredData: any = {};
  
  Object.keys(paymentData)
    .filter(key => !fieldsToExclude.includes(key))
    .sort()
    .forEach(key => {
      if (paymentData[key] !== undefined && paymentData[key] !== null && paymentData[key] !== '') {
        filteredData[key] = paymentData[key];
      }
    });
  
  const calculatedSignature = generatePayFastSignature(filteredData, passphrase);
  return calculatedSignature === signature;
};

// Payment status types
export enum PaymentStatus {
  SUCCESS = 'COMPLETE',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
  CANCELLED = 'CANCELLED'
}

// Payment response from PayFast
export interface PaymentResponse {
  m_payment_id: string;
  pf_payment_id: string;
  payment_status: PaymentStatus;
  amount: string;
  item_name: string;
  name_first: string;
  name_last: string;
  email_address: string;
  signature: string;
}