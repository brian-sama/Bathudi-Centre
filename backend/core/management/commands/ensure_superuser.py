"""Ensure a Django superuser exists from environment variables.

Reads (all optional except password):
  DJANGO_SUPERUSER_USERNAME (default: muzidean14@gmail.com)
  DJANGO_SUPERUSER_EMAIL    (default: same as username)
  DJANGO_SUPERUSER_PASSWORD (required - no default, never commit this)

Creates the user if missing, otherwise updates email/staff flags and
resets the password. Safe to run on every deploy (idempotent).

Usage:
  DJANGO_SUPERUSER_PASSWORD='your-secret' python manage.py ensure_superuser
"""
import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Create or update the admin superuser from env vars (idempotent, safe on every deploy)'

    def handle(self, *args, **options):
        username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'muzidean14@gmail.com').strip()
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL', username).strip()
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', '')

        if not password:
            self.stdout.write(self.style.WARNING(
                'SKIP: DJANGO_SUPERUSER_PASSWORD is not set, superuser unchanged. '
                'Set it in .env.production on the server (and .env locally).'
            ))
            return

        User = get_user_model()
        user, created = User.objects.get_or_create(
            username=username,
            defaults={'email': email},
        )
        user.email = email
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.set_password(password)
        user.save()

        action = 'Created' if created else 'Updated'
        self.stdout.write(self.style.SUCCESS(
            f'{action} superuser: {username} (password set from DJANGO_SUPERUSER_PASSWORD)'
        ))
