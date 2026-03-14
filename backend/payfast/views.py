import hashlib
import logging
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from .models import PayfastTransaction
from core.models import Application  # Assuming Application model is in core

logger = logging.getLogger(__name__)

def generate_signature(data, passphrase):
    # Sort data alphabetically
    sorted_keys = sorted(data.keys())
    # Create parameter string
    param_string = ""
    for key in sorted_keys:
        if key != 'signature' and data[key]:
            param_string += f"{key}={data[key]}&"
    
    # Add passphrase
    param_string += f"passphrase={passphrase}"
    
    # Return MD5 hash
    return hashlib.md5(param_string.encode()).hexdigest()

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
