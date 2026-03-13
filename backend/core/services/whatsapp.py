# core/services/whatsapp.py
import os
from django.conf import settings
from twilio.rest import Client
import logging

logger = logging.getLogger(__name__)

class WhatsAppService:
    """WhatsApp messaging service using Twilio"""
    
    def __init__(self):
        self.account_sid = settings.TWILIO_ACCOUNT_SID
        self.auth_token = settings.TWILIO_AUTH_TOKEN
        self.from_number = settings.TWILIO_WHATSAPP_NUMBER
        self.client = Client(self.account_sid, self.auth_token) if self.account_sid else None
    
    def _format_phone_number(self, phone_number):
        """Format ANY phone number for WhatsApp"""
        cleaned = ''.join(filter(str.isdigit, phone_number))
        
        if cleaned.startswith('263'):
            formatted = '+' + cleaned
        elif cleaned.startswith('0'):
            formatted = '+27' + cleaned[1:]
        elif cleaned.startswith('27'):
            formatted = '+' + cleaned
        else:
            formatted = '+' + cleaned
        
        return f"whatsapp:{formatted}"
    
    def send_approval_message(self, to_number, student_name, course_name):
        """Send application approval notification using pre-approved template"""
        if not self.client:
            logger.error("Twilio client not initialized")
            return False
        
        try:
            to_whatsapp = self._format_phone_number(to_number)
            
            # IMPORTANT: Using Twilio's pre-approved "order_notification" template
            # Content ID: HX350d429d32e64a552466cafece95f3c
            # This template has variables: {{1}} and {{2}}
            
            # Map our message to fit the template
            current_time = "now"  # Placeholder
            delivery_time = "today"  # Placeholder
            
            message = self.client.messages.create(
                content_sid='HX350d429d32e64a552466cafece95f3c',  # Pre-approved template
                content_variables={
                    '1': f"{student_name}",  # Name
                    '2': f"{course_name}"    # Course
                },
                from_=self.from_number,
                to=to_whatsapp
            )
            
            logger.info(f"WhatsApp template sent to {to_number}. SID: {message.sid}")
            
            # AFTER they reply, you can send free-form messages for 24 hours
            # So we'll send a follow-up with the actual message if we want
            if message.sid:
                self._send_followup_message(to_whatsapp, student_name, course_name)
            
            return True
            
        except Exception as e:
            logger.error(f"WhatsApp error: {str(e)}")
            return False
    
    def _send_followup_message(self, to_whatsapp, student_name, course_name):
        """Send the actual message after user has replied (free form)"""
        try:
            # This only works if the user has replied to the template message
            message_body = f"""
🎉 CONGRATULATIONS {student_name.upper()}!

You have been ACCEPTED into the {course_name} programme at Bathudi Automotive Training Center 🇿🇦

📋 NEXT STEPS:
1. Visit our offices for registration
2. Bring your ID document
3. Bring your Matric certificate
4. Bring proof of payment (R661.25)

📍 Address: 123 Training Street, Johannesburg
📞 Contact: +27 68 917 6294

We look forward to welcoming you! 🚗🔧

- Bathudi Management
            """.strip()
            
            followup = self.client.messages.create(
                body=message_body,
                from_=self.from_number,
                to=to_whatsapp
            )
            
            logger.info(f"Follow-up message sent. SID: {followup.sid}")
            
        except Exception as e:
            logger.error(f"Follow-up error: {str(e)}")
    
    def send_rejection_message(self, to_number, student_name, course_name, reason=None):
        """Send rejection notification"""
        try:
            to_whatsapp = self._format_phone_number(to_number)
            
            # Also use template for first message
            message = self.client.messages.create(
                content_sid='HX350d429d32e64a552466cafece95f3c',  # Same template
                content_variables={
                    '1': f"{student_name}",
                    '2': f"application status update"
                },
                from_=self.from_number,
                to=to_whatsapp
            )
            
            # Follow up with rejection message after they reply
            if message.sid:
                self._send_rejection_followup(to_whatsapp, student_name, course_name, reason)
            
            return True
            
        except Exception as e:
            logger.error(f"WhatsApp rejection error: {str(e)}")
            return False
    
    def _send_rejection_followup(self, to_whatsapp, student_name, course_name, reason=None):
        """Send rejection message after user replies"""
        try:
            message_body = f"""
Thank you for your interest in {course_name} at Bathudi Automotive Training Center.

After careful review, we regret to inform you that your application has been unsuccessful at this time.
            """.strip()
            
            if reason:
                message_body += f"\n\nReason: {reason}"
            
            message_body += """

You are welcome to reapply in the future when you meet the minimum requirements.

Kind regards,
Bathudi Management
            """.strip()
            
            followup = self.client.messages.create(
                body=message_body,
                from_=self.from_number,
                to=to_whatsapp
            )
            
        except Exception as e:
            logger.error(f"Rejection follow-up error: {str(e)}")