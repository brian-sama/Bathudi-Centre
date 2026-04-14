"""
PayFast Payment Gateway Service
Secure integration with PayFast payment gateway
All credentials are stored in environment variables
"""

import os
import hashlib
import hmac
import logging
from decimal import Decimal
from typing import Dict, Any, Optional
from urllib.parse import quote_plus
from django.conf import settings
import requests

logger = logging.getLogger(__name__)


class PayFastService:
    """
    Service to handle PayFast payment gateway operations
    Uses environment variables for all credentials - NEVER hardcode credentials
    """
    
    # PayFast URLs
    PAYFAST_SANDBOX_URL = 'https://sandbox.payfast.co.za/eng/process'
    PAYFAST_LIVE_URL = 'https://www.payfast.co.za/eng/process'
    PAYFAST_VALIDATE_URL = 'https://api.payfast.co.za/validate_payment'
    PAYFAST_VALIDATE_URL_SANDBOX = 'https://sandbox.payfast.co.za/api/validate_payment'
    
    def __init__(self):
        """Initialize PayFast service with credentials from environment"""
        self.merchant_id = os.getenv('PAYFAST_MERCHANT_ID', '')
        self.merchant_key = os.getenv('PAYFAST_MERCHANT_KEY', '')
        self.security_passphrase = (
            os.getenv('PAYFAST_SECURITY_PASSPHRASE', '')
            or os.getenv('PAYFAST_PASSPHRASE', '')
        )
        self.use_sandbox = os.getenv('PAYFAST_USE_SANDBOX', 'False').lower() == 'true'
        
        if not all([self.merchant_id, self.merchant_key, self.security_passphrase]):
            logger.warning('PayFast credentials not fully configured in environment variables')
    
    def generate_signature(self, data: Dict[str, Any], include_passphrase: bool = True) -> str:
        """
        Generate PayFast signature for data validation
        
        Args:
            data: Dictionary of data to sign
            include_passphrase: Whether to include security passphrase in signature
            
        Returns:
            MD5 hash signature
        """
        # Remove empty values and sort by key. PayFast expects trimmed values.
        clean_data = {
            k: str(v).strip()
            for k, v in data.items()
            if v is not None and str(v).strip() != ''
        }

        # Sort and create query string
        sorted_items = sorted(clean_data.items())
        query_string = '&'.join(
            [f'{k}={quote_plus(v)}' for k, v in sorted_items]
        )

        # Add passphrase if required
        if include_passphrase and self.security_passphrase:
            query_string += f'&passphrase={quote_plus(self.security_passphrase.strip())}'
        
        # Generate MD5 hash
        signature = hashlib.md5(query_string.encode()).hexdigest()
        logger.debug(f'Generated signature for: {list(clean_data.keys())}')
        
        return signature
    
    def create_payment_form_data(
        self, 
        application_id: int,
        amount: Decimal,
        return_url: str,
        cancel_url: str,
        notify_url: str,
        email_address: str = '',
        payer_name: str = '',
    ) -> Dict[str, Any]:
        """
        Create payment form data for PayFast checkout
        
        Args:
            application_id: Application ID (reference for payment)
            amount: Payment amount in ZAR
            return_url: URL to redirect to after successful payment
            cancel_url: URL to redirect to if payment is cancelled
            notify_url: URL for PayFast to send payment notifications
            email_address: Customer email address
            payer_name: Customer name
            
        Returns:
            Dictionary with all PayFast form data
        """
        
        # Convert amount to string with 2 decimal places
        amount_str = f'{float(amount):.2f}'
        
        # Create base data
        data = {
            'merchant_id': self.merchant_id,
            'merchant_key': self.merchant_key,
            'return_url': return_url,
            'cancel_url': cancel_url,
            'notify_url': notify_url,
            'name_first': payer_name.split()[0] if payer_name else 'Bathudi',
            'name_last': payer_name.split()[-1] if len(payer_name.split()) > 1 else 'Student',
            'email_address': email_address,
            'reference': f'APP-{application_id}',
            'm_payment_id': f'{application_id}',
            'amount': amount_str,
            'item_name': f'Bathudi Training Centre - Registration Fee',
            'item_description': f'Application Registration Fee - Application ID: {application_id}',
        }
        
        # Generate and add signature
        data['signature'] = self.generate_signature(data)
        
        logger.info(f'Created payment form for application {application_id}, amount: {amount_str}')
        
        return data
    
    def validate_payment(self, data: Dict[str, str]) -> bool:
        """
        Validate payment notification from PayFast
        
        Args:
            data: POST data received from PayFast
            
        Returns:
            True if payment is valid, False otherwise
        """
        
        try:
            # Extract and verify signature
            received_signature = data.get('signature', '')
            
            # Recreate signature without the signature field
            verify_data = {k: v for k, v in data.items() if k != 'signature'}
            expected_signature = self.generate_signature(verify_data)
            
            if not hmac.compare_digest(received_signature, expected_signature):
                logger.error(f'Signature mismatch for payment {data.get("m_payment_id")}')
                return False

            merchant_id = str(data.get('merchant_id', '')).strip()
            if merchant_id and merchant_id != self.merchant_id:
                logger.error(f'Merchant mismatch for payment {data.get("m_payment_id")}')
                return False
            
            # Verify with PayFast servers if in production
            if not self.use_sandbox:
                if not self._verify_with_payfast(data):
                    logger.error(f'PayFast server validation failed for payment {data.get("m_payment_id")}')
                    return False
            
            logger.info(f'Payment validated successfully: {data.get("m_payment_id")}')
            return True
            
        except Exception as e:
            logger.error(f'Error validating payment: {str(e)}')
            return False
    
    def _verify_with_payfast(self, data: Dict[str, str]) -> bool:
        """
        Verify payment with PayFast servers
        
        Args:
            data: Payment data from PayFast
            
        Returns:
            True if verified successfully
        """
        
        try:
            url = self.PAYFAST_VALIDATE_URL if not self.use_sandbox else self.PAYFAST_VALIDATE_URL_SANDBOX
            
            # PayFast expects the original ITN fields posted back for validation.
            post_data = {key: value for key, value in data.items() if key != 'signature'}
            
            # Send validation request
            response = requests.post(
                url,
                data=post_data,
                timeout=10,
                verify=True  # Always verify SSL in production
            )
            
            if response.status_code == 200 and 'VALID' in response.text.upper():
                logger.info(f'PayFast verification successful for {data.get("m_payment_id")}')
                return True
            else:
                logger.error(
                    'PayFast verification failed with status %s and body %s',
                    response.status_code,
                    response.text[:200],
                )
                return False
                
        except requests.RequestException as e:
            logger.error(f'Error connecting to PayFast for verification: {str(e)}')
            # In case of connection error, we might want to handle this differently
            return False
    
    def get_payfast_url(self) -> str:
        """
        Get the appropriate PayFast URL based on environment
        
        Returns:
            PayFast submission URL
        """
        return self.PAYFAST_SANDBOX_URL if self.use_sandbox else self.PAYFAST_LIVE_URL
    
    @staticmethod
    def parse_webhook_data(post_data: Dict) -> Optional[Dict]:
        """
        Parse and validate webhook data from PayFast
        
        Args:
            post_data: POST data from PayFast webhook
            
        Returns:
            Parsed payment data or None if invalid
        """
        
        try:
            parsed_data = {
                'payment_id': post_data.get('pf_payment_id'),
                'm_payment_id': post_data.get('m_payment_id'),
                'amount': post_data.get('amount_gross'),
                'status': post_data.get('payment_status'),
                'reference': post_data.get('reference'),
                'signature': post_data.get('signature'),
            }
            
            # Verify required fields
            if not all([parsed_data['payment_id'], parsed_data['m_payment_id'], parsed_data['amount']]):
                logger.error('Missing required fields in webhook data')
                return None
            
            return parsed_data
            
        except Exception as e:
            logger.error(f'Error parsing webhook data: {str(e)}')
            return None


def get_payfast_service() -> PayFastService:
    """Factory function to get PayFast service instance"""
    return PayFastService()
