# bathuditraining2center/settings.py
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-bathudi-training-center-key')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'False') == 'True'

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'bathudi.co.za,www.bathudi.co.za,localhost,127.0.0.1,89.116.26.24,0.0.0.0').split(',')

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
    'rest_framework',
    'corsheaders',

    # Local apps
    'core',
    'payfast',
]

# PayFast Settings
PAYFAST_MERCHANT_ID = os.getenv("PAYFAST_MERCHANT_ID")
PAYFAST_MERCHANT_KEY = os.getenv("PAYFAST_MERCHANT_KEY")
PAYFAST_PASSPHRASE = os.getenv("PAYFAST_PASSPHRASE")
PAYFAST_SANDBOX = os.getenv("PAYFAST_SANDBOX", "True") == "True"
REGISTRATION_FEE_AMOUNT = os.getenv("REGISTRATION_FEE_AMOUNT", "661.25")

PAYFAST_RETURN_URL = os.getenv("PAYFAST_RETURN_URL", "https://bathudi.co.za/payment-success")
PAYFAST_CANCEL_URL = os.getenv("PAYFAST_CANCEL_URL", "https://bathudi.co.za/payment-cancel")
PAYFAST_NOTIFY_URL = os.getenv("PAYFAST_NOTIFY_URL", "https://bathudi.co.za/payments/notify/")

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'bathuditraining2center.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'bathuditraining2center.wsgi.application'

# Database
import dj_database_url

DATABASES = {
    'default': dj_database_url.config(
        default=os.getenv('DATABASE_URL', 'sqlite:///' + str(BASE_DIR / 'db.sqlite3')),
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# Password validation
AUTH_PASSWORD_VALIDATORS = []

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Africa/Johannesburg'  # Changed to SA time
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Add this for serving static files during development
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
    os.path.join(BASE_DIR, 'pdfs'),  # Your PDFs folder
    os.path.join(BASE_DIR, 'modules'),  # Your modules folder
]

# ========== MEDIA FILES (User Uploads) ==========
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Create necessary directories
os.makedirs(os.path.join(BASE_DIR, 'static'), exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, 'pdfs'), exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, 'modules'), exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, 'templates'), exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, 'templates/admin/core/application'), exist_ok=True)

# Keep local media directory for development (won't affect Railway)
os.makedirs(os.path.join(BASE_DIR, 'media'), exist_ok=True)

# ========== DJANGO REST FRAMEWORK ==========
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',
    ],
}

# ========== CORS SETTINGS ==========
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

CORS_ALLOWED_ORIGINS = [
    'https://bathudi.co.za',
    'https://www.bathudi.co.za',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
]

# CSRF
CSRF_TRUSTED_ORIGINS = [
    'https://bathudi.co.za',
    'https://www.bathudi.co.za',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
]

CSRF_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = False
CSRF_USE_SESSIONS = False
CSRF_COOKIE_SAMESITE = 'Lax'

SESSION_COOKIE_SECURE = True
SESSION_COOKIE_SAMESITE = 'Lax'

# Production Security
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = os.getenv('SECURE_SSL_REDIRECT', 'False') == 'True'

# ========== FILE UPLOAD SETTINGS ==========
FILE_UPLOAD_PERMISSIONS = 0o644
FILE_UPLOAD_MAX_MEMORY_SIZE = 104857600  # 100MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 104857600 # 100MB

# ========== TWILIO WHATSAPP SETTINGS ==========
TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID', '')
TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN', '')
TWILIO_WHATSAPP_NUMBER = os.environ.get('TWILIO_WHATSAPP_NUMBER', 'whatsapp:+14155238886')

# ========== WHATSAPP CLOUD API SETTINGS ==========
WHATSAPP_CLOUD_API_TOKEN = os.environ.get('WHATSAPP_CLOUD_API_TOKEN', '')
WHATSAPP_CLOUD_PHONE_ID = os.environ.get('WHATSAPP_CLOUD_PHONE_ID', '')
WHATSAPP_CLOUD_NUMBER = os.environ.get('WHATSAPP_CLOUD_NUMBER', '+27689176294')

# ========== PRE-APPROVED TEMPLATE SIDS ==========
TWILIO_ORDER_TEMPLATE_SID = os.environ.get('TWILIO_ORDER_TEMPLATE_SID', 'HX350d429d32e64a552466cafece95f3c')
TWILIO_APPROVAL_TEMPLATE_SID = os.environ.get('TWILIO_APPROVAL_TEMPLATE_SID', '')
TWILIO_REJECTION_TEMPLATE_SID = os.environ.get('TWILIO_REJECTION_TEMPLATE_SID', '')

# ========== BATHUDI CONTACT INFORMATION ==========
BATHUDI_PHONE_NUMBER = os.environ.get('BATHUDI_PHONE_NUMBER', '+27 68 917 6294')
BATHUDI_WHATSAPP_NUMBER = os.environ.get('BATHUDI_WHATSAPP_NUMBER', '+27689176294')
BATHUDI_EMAIL = os.environ.get('BATHUDI_EMAIL', 'info@bathudi.co.za')
BATHUDI_ADDRESS = os.environ.get('BATHUDI_ADDRESS', '123 Training Street, Johannesburg, South Africa')
BATHUDI_WEBSITE = os.environ.get('BATHUDI_WEBSITE', 'https://bathudi.co.za')

# ========== WHATSAPP NOTIFICATION SETTINGS ==========
WHATSAPP_PROVIDER = os.environ.get('WHATSAPP_PROVIDER', 'twilio')
WHATSAPP_NOTIFICATIONS_ENABLED = os.environ.get('WHATSAPP_NOTIFICATIONS_ENABLED', 'True') == 'True'
WHATSAPP_SEND_APPROVAL = os.environ.get('WHATSAPP_SEND_APPROVAL', 'True') == 'True'
WHATSAPP_SEND_REJECTION = os.environ.get('WHATSAPP_SEND_REJECTION', 'True') == 'True'
WHATSAPP_SANDBOX_MODE = os.environ.get('WHATSAPP_SANDBOX_MODE', 'True') == 'True'
WHATSAPP_TEST_NUMBERS = os.environ.get('WHATSAPP_TEST_NUMBERS', '+263773074487,+27681234567').split(',')

# ========== LOGGING CONFIGURATION ==========
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {asctime} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
        'file': {
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'logs', 'whatsapp.log'),
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'core.services.whatsapp': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG' if DEBUG else 'INFO',
            'propagate': False,
        },
        'core.views': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# Create logs directory
os.makedirs(os.path.join(BASE_DIR, 'logs'), exist_ok=True)

# ========== REGISTRATION FEE ==========
REGISTRATION_FEE_AMOUNT = os.environ.get('REGISTRATION_FEE_AMOUNT', '661.25')
REGISTRATION_FEE_CURRENCY = os.environ.get('REGISTRATION_FEE_CURRENCY', 'ZAR')

# ========== COURSE MAPPING ==========
COURSE_ID_MAPPING = {
    'automotive_engine_repairer': 'Occupational Certificate: Automotive Engine Repairer',
    'automotive_clutch_brake_repairer': 'Occupational Certificate: Automotive Clutch and Brake Repairer',
    'automotive_suspension_fitter': 'Occupational Certificate: Automotive Suspension Fitter',
    'automotive_workshop_assistant': 'Occupational Certificate: Automotive Workshop Assistant',
}

# ========== APPLICATION STATUS MESSAGES ==========
WHATSAPP_APPROVAL_MESSAGE = """
Good day this is an automated message from Bathudi Automotive Training Center 🇿🇦

It is with great pleasure that we congratulate you on your acceptance to our Training Center for the {course_name}!

We are delighted to welcome you to our family. Please kindly visit our offices for your full registration.

📌 Please bring:
• Certified ID copy
• Matric certificate
• Proof of payment (R{registration_fee})

📍 Physical Address:
{address}

📞 Contact: {phone}
📧 Email: {email}
🌐 Website: {website}

Kind regards,
Bathudi Management
""".strip()

WHATSAPP_REJECTION_MESSAGE = """
Good day this is an automated message from Bathudi Automotive Training Center

Thank you for your interest in our {course_name} programme.

After careful review of your application, we regret to inform you that your application has been unsuccessful at this time.
{reason_text}

We encourage you to apply again in the future when you meet the minimum requirements.

Kind regards,
Bathudi Management
""".strip()

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'