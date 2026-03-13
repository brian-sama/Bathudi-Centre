"""
WSGI config for bathuditraining2center project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application
from django.contrib.auth import get_user_model
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bathuditraining2center.settings')

application = get_wsgi_application()

try:
    django.setup()
    User = get_user_model()
    if not User.objects.filter(username=os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')).exists():
        User.objects.create_superuser(
            username=os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin'),
            email=os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@example.com'),
            password=os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'admin123')
        )
        print("Superuser created successfully!")
    else:
        print("Superuser already exists.")
except Exception as e:
    print(f"Error creating superuser: {e}")

application = get_wsgi_application()