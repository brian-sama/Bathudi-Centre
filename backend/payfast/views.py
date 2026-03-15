import hashlib
import logging
import urllib.parse
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import PayfastTransaction
from core.models import Application

logger = logging.getLogger(__name__)

def generate_pf_signature(data, passphrase=None):
    """Generate PayFast signature securely on the server"""
    # Create parameter string
    pf_params = []
    # Sort keys alphabetically as per PayFast requirement
    # We must EXCLUDE the signature if it exists in the data
    sorted_keys = sorted([k for k in data.keys() if k != 'signature'])
    
    for key in sorted_keys:
        value = data[key]
        if value is not None and value != '':
            # URL encode values, matching PHP's urlencode() / Javascript's encodeURIComponent(v).replace(/%20/g, '+')
            # quote_plus is the standard for form-encoded data (spaces to +)
            encoded_value = urllib.parse.quote_plus(str(value).strip())
            pf_params.append(f"{key}={encoded_value}")
    
    pf_string = "&".join(pf_params)
    
    # Add passphrase if provided
    if passphrase:
        pf_string += f"&passphrase={urllib.parse.quote_plus(passphrase.strip())}"
        
    return hashlib.md5(pf_string.encode('utf-8')).hexdigest()

@api_view(['POST'])
@permission_classes([AllowAny])
def create_payfast_payment(request):
    """
    Securely generate PayFast payment payload and signature.
    Exposes no sensitive credentials to the frontend.
    """
    try:
        data = request.data
        amount = data.get('amount', settings.REGISTRATION_FEE_AMOUNT)
        item_name = data.get('item_name', 'Bathudi Course Application Fee')
        email = data.get('email_address')
        
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Generate unique payment ID
        m_payment_id = f"PAY-{int(timezone.now().timestamp())}"
        
        # Build payload
        payload = {
            'merchant_id': settings.PAYFAST_MERCHANT_ID,
            'merchant_key': settings.PAYFAST_MERCHANT_KEY,
            'return_url': settings.PAYFAST_RETURN_URL,
            'cancel_url': settings.PAYFAST_CANCEL_URL,
            'notify_url': settings.PAYFAST_NOTIFY_URL,
            'email_address': email,
            'm_payment_id': m_payment_id,
            'amount': amount,
            'item_name': item_name,
        }
        
        # Add optional items if provided
        if data.get('name_first'): payload['name_first'] = data.get('name_first')
        if data.get('name_last'): payload['name_last'] = data.get('name_last')
        if data.get('cell_number'): payload['cell_number'] = data.get('cell_number')
        
        # Generate signature using server-side passphrase
        payload['signature'] = generate_pf_signature(payload, settings.PAYFAST_PASSPHRASE)
        
        # Log the initiation
        PayfastTransaction.objects.create(
            payment_id=m_payment_id,
            email=email,
            amount=amount,
            status='initiated'
        )
        
        is_sandbox = getattr(settings, 'PAYFAST_SANDBOX', True)
        return Response({
            'payload': payload,
            'url': 'https://sandbox.payfast.co.za/eng/process' if is_sandbox else 'https://www.payfast.co.za/eng/process'
        })
        
    except Exception as e:
        logger.error(f"Error creating PayFast payment: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def generate_signature(data, passphrase):
    # This remains for the ITN handler legacy support or can be replaced by generate_pf_signature
    return generate_pf_signature(data, passphrase)

@csrf_exempt
def notify_payment(request):
    if request.method != 'POST':
        return HttpResponse("Method not allowed", status=405)

    # Get data from POST
    data = request.POST.dict()
    signature_received = data.get('signature')
    
    # 1. Validate Signature
    passphrase = getattr(settings, 'PAYFAST_PASSPHRASE', '')
    signature_calculated = generate_signature(data, passphrase)
    
    if signature_received != signature_calculated:
        logger.error(f"PayFast ITN Validation Failed: Signature mismatch. Received: {signature_received}, Calculated: {signature_calculated}")
        return HttpResponse("Invalid Signature", status=400)

    # 2. Check Payment Status
    payment_status = data.get('payment_status')
    payment_id = data.get('m_payment_id')
    amount = data.get('amount_gross')
    email = data.get('email_address')

    # 3. Store Transaction
    transaction, created = PayfastTransaction.objects.update_or_create(
        payment_id=payment_id,
        defaults={
            'email': email,
            'amount': amount,
            'status': payment_status,
            'raw_response': str(data)
        }
    )

    # 4. Process Successful Payment
    if payment_status == 'COMPLETE':
        # Mark related course application as paid
        # Assuming the payment_id links to an application (e.g., encoded in m_payment_id)
        # For now, we'll try to find the application by email and link it
        # In a real scenario, you'd probably pass the application ID in a custom field
        try:
            # Try to find the latest pending application for this email
            application = Application.objects.filter(email=email).order_by('-applied_date').first()
            if application:
                application.fee_verified = True
                application.save()
                logger.info(f"Application {application.id} marked as PAID for {email}")
            else:
                logger.warning(f"No application found for email {email} to mark as PAID")
        except Exception as e:
            logger.error(f"Error updating application status: {str(e)}")

    return HttpResponse("OK")

def payment_success(request):
    return JsonResponse({"status": "success", "message": "Payment processed successfully"})

def payment_cancel(request):
    return JsonResponse({"status": "cancelled", "message": "Payment was cancelled by the user"})
