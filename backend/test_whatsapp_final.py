# backend/test_whatsapp_final.py
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from twilio.rest import Client
import json
from datetime import datetime

# Load .env from parent directory (where your React app is)
parent_dir = Path(__file__).parent.parent
env_path = parent_dir / '.env'

print("=" * 60)
print("📱 BATHUDI WHATSAPP TEST - PARENT .ENV")
print("=" * 60)
print(f"📁 Looking for .env at: {env_path}")
print(f"📁 .env exists: {env_path.exists()}")
print("-" * 60)

if not env_path.exists():
    print("❌ ERROR: .env file not found in parent directory!")
    print(f"   Expected location: {env_path}")
    print("\n   Please create .env file in:")
    print(f"   {parent_dir}")
    sys.exit(1)

# Load the .env file
load_dotenv(env_path, override=True)
print("✅ .env file loaded successfully!")
print("-" * 60)

# Get credentials from .env
account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
from_number = os.environ.get('TWILIO_WHATSAPP_NUMBER', 'whatsapp:+14155238886')
template_sid = os.environ.get('TWILIO_ORDER_TEMPLATE_SID', 'HX350d429d32e64a552466cafece95f3c')

# Your test number - Zimbabwe
to_number = "whatsapp:+263773074487"

print(f"📋 Configuration:")
print(f"   Account SID: {account_sid[:10] if account_sid else '❌'}...{account_sid[-10:] if account_sid else 'NOT SET'}")
print(f"   Auth Token: {'✅ SET' if auth_token else '❌ NOT SET'}")
print(f"   From: {from_number}")
print(f"   To: {to_number}")
print(f"   Template SID: {template_sid}")
print("-" * 60)

# Check if credentials are set
if not account_sid or not auth_token:
    print("\n❌ ERROR: Twilio credentials not found in .env file")
    print("\n   Your .env file should contain:")
    print("   TWILIO_ACCOUNT_SID=AC216c95bd69597af4fc8a5638509ff0191")
    print("   TWILIO_AUTH_TOKEN=8363cc16d6c6bd6b98b6d2dd76c1d997")
    sys.exit(1)

try:
    # Initialize Twilio client
    client = Client(account_sid, auth_token)
    
    # Student details for the message
    student_name = "Brian Dube"
    course_name = "Automotive Engine Repairer"
    
    print(f"\n📨 SENDING WHATSAPP MESSAGE...")
    print(f"   To: {student_name}")
    print(f"   Course: {course_name}")
    print("-" * 60)
    
    # Send using the pre-approved template
    message = client.messages.create(
        content_sid=template_sid,
        content_variables=json.dumps({
            "1": student_name,
            "2": course_name
        }),
        from_=from_number,
        to=to_number
    )
    
    print(f"✅ SUCCESS! Message sent!")
    print(f"   Message SID: {message.sid}")
    print(f"   Status: {message.status}")
    print(f"   Date Created: {message.date_created}")
    print("-" * 60)
    print(f"\n📱 CHECK YOUR WHATSAPP NOW!")
    print(f"   Number: {to_number}")
    print(f"\n⏱️  You should receive it within 5-10 seconds")
    print("=" * 60)
    
except Exception as e:
    print(f"\n❌ ERROR: Failed to send message")
    print(f"   {str(e)}")
    print("\n🔧 TROUBLESHOOTING:")
    
    error_str = str(e).lower()
    
    if "not in sandbox" in error_str:
        print("   1️⃣ You haven't joined the sandbox yet!")
        print("\n   📱 On your WhatsApp +263773074487:")
        print("   → Send this EXACT message to +14155238886:")
        print("\n     👉 join sandbox-forest-34")
        print("\n   🔗 Get the exact join code from:")
        print("   https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn")
        
    elif "authenticate" in error_str or "invalid" in error_str:
        print("   1️⃣ Your Auth Token is incorrect")
        print("\n   🔑 Go to Twilio Console:")
        print("   https://console.twilio.com")
        print("   → Copy the Auth Token again (it's case-sensitive)")
        print("   → Update your .env file with the exact token")
        print(f"\n   Current token in .env: {auth_token[:5]}...{auth_token[-5:] if auth_token else 'None'}")
        
    elif "trial" in error_str or "verified" in error_str:
        print("   1️⃣ Trial account needs verified numbers")
        print("\n   📞 Go to Twilio Console:")
        print("   → Phone Numbers → Verified Caller IDs")
        print("   → Add +263773074487 as a verified number")
        print("   → Also add +27689176294 (your business number)")
        
    elif "content sid" in error_str or "template" in error_str:
        print("   1️⃣ Template SID is incorrect")
        print(f"\n   Current Template SID: {template_sid}")
        print("   → Verify this in Twilio Console → Content Template Builder")
        
    else:
        print(f"   Error: {str(e)}")
        print("\n   Please check:")
        print("   1. Your internet connection")
        print("   2. Twilio account status (trial credit: $15.50)")
        print("   3. The phone number format (+263773074487)")
        print("   4. Your .env file has no spaces around the = signs")
    
    print("=" * 60)