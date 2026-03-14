from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import hashlib
import logging
import urllib.parse

logger = logging.getLogger(__name__)

def generate_payfast_signature(data, passphrase):
    """Generate PayFast signature"""
    # Sort the keys
    keys = sorted(data.keys())
    
    # Create parameter string
    pf_output = ""
    for key in keys:
        if data[key] and data[key] != "":
            pf_output += f"{key}={urllib.parse.quote_plus(str(data[key]).strip())}&"
    
    # Add passphrase
    pf_output += f"passphrase={urllib.parse.quote_plus(passphrase.strip())}"
    
    # Generate MD5 hash
    return hashlib.md5(pf_output.encode()).hexdigest()

@csrf_exempt
@require_POST
def payfast_notify(request):
    """
    Handle PayFast Instant Transaction Notification (ITN)
    """
    # Get the POST data from PayFast
    post_data = request.POST.dict()
    logger.info(f"📨 PayFast ITN received: {post_data}")
    
    # Get passphrase from settings (you'll add this to settings.py)
    from django.conf import settings
    passphrase = settings.PAYFAST_PASSPHRASE
    
    # Remove signature for validation
    received_signature = post_data.pop('signature', None)
    
    if not received_signature:
        logger.error("❌ No signature in PayFast ITN")
        return HttpResponse("No signature", status=400)
    
    # Validate signature
    calculated_signature = generate_payfast_signature(post_data, passphrase)
    
    if calculated_signature != received_signature:
        logger.error("❌ Invalid signature")
        return HttpResponse("Invalid signature", status=400)
    
    # Get payment details
    payment_status = post_data.get('payment_status')
    m_payment_id = post_data.get('m_payment_id')
    pf_payment_id = post_data.get('pf_payment_id')
    amount = post_data.get('amount')
    name_first = post_data.get('name_first')
    name_last = post_data.get('name_last')
    email = post_data.get('email_address')
    
    logger.info(f"✅ Payment {payment_status} for reference: {m_payment_id}")
    
    # Handle different payment statuses
    if payment_status == 'COMPLETE':
        # Payment successful
        logger.info(f"💰 Payment completed: {m_payment_id}, Amount: {amount}")
        
        # TODO: Update application status in database
        # You'll need to connect this to your applications app
        # Example:
        # from applications.models import Application
        # try:
        #     app = Application.objects.get(payment_reference=m_payment_id)
        #     app.fee_verified = True
        #     app.payment_date = datetime.now()
        #     app.save()
        #     logger.info(f"✅ Application {app.id} marked as paid")
        # except Application.DoesNotExist:
        #     logger.error(f"❌ Application not found for payment: {m_payment_id}")
        
    elif payment_status == 'FAILED':
        logger.error(f"❌ Payment failed: {m_payment_id}")
    elif payment_status == 'PENDING':
        logger.warning(f"⏳ Payment pending: {m_payment_id}")
    
    # Return success to PayFast
    return HttpResponse("OK", status=200)

@csrf_exempt
def payfast_success(request):
    """
    Handle successful payment return (GET redirect)
    """
    payment_id = request.GET.get('m_payment_id')
    logger.info(f"✅ Payment success redirect for: {payment_id}")
    
    # You can return JSON or redirect to frontend
    return JsonResponse({
        "status": "success", 
        "message": "Payment successful",
        "payment_id": payment_id
    })

@csrf_exempt
def payfast_cancel(request):
    """
    Handle cancelled payment return (GET redirect)
    """
    payment_id = request.GET.get('m_payment_id')
    logger.info(f"❌ Payment cancelled redirect for: {payment_id}")
    
    return JsonResponse({
        "status": "cancelled", 
        "message": "Payment cancelled",
        "payment_id": payment_id
    })