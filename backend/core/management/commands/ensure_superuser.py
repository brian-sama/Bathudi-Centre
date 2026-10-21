"""Ensure a Django superuser exists from environment variables.

Reads (all optional except password):
  DJANGO_SUPERUSER_USERNAME (default: muzidean14@gmail.com)
  DJANGO_SUPERUSER_EMAIL    (default: same as username)
  DJANGO_SUPERUSER_PASSWORD (required - no default, never commit this)

Creates the user if missing, otherwise updates email/staff flags.
Safe to run on every deploy (idempotent).

IMPORTANT: the password is ONLY applied when the user is first created, or when
`DJANGO_SUPERUSER_FORCE_PASSWORD_RESET` is explicitly set to 'True'. This is so
that a password an admin changed through the admin portal (Change Password) is
NOT silently reverted on the next deploy.

Usage:
  DJANGO_SUPERUSER_PASSWORD='your-secret' python manage.py ensure_superuser
  DJANGO_SUPERUSER_FORCE_PASSWORD_RESET='True' DJANGO_SUPERUSER_PASSWORD='your-secret' \
      python manage.py ensure_superuser
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
        force_reset = os.environ.get('DJANGO_SUPERUSER_FORCE_PASSWORD_RESET', 'False') == 'True'

        if not password:
            self.stdout.write(self.style.WARNING(
                'SKIP: DJANGO_SUPERUSER_PASSWORD is not set, superuser unchanged. '
                'Set it in .env.production on the server (and .env locally).'
            ))
            return

        try:
            User = get_user_model()
            user = User.objects.filter(username=username).first()
            if not user and email:
                # Fall back to the email so an existing admin is matched even if
                # the username was changed at some point.
                user = User.objects.filter(email=email).first()

            if not user:
                user = User.objects.create_superuser(
                    username=username,
                    email=email,
                    password=password,
                )
                self.stdout.write(self.style.SUCCESS(
                    f'Created superuser: {username} (password set from DJANGO_SUPERUSER_PASSWORD)'
                ))
            else:
                user.email = email
                user.is_staff = True
                user.is_superuser = True
                user.is_active = True

                if force_reset:
                    user.set_password(password)
                    user.save()
                    self.stdout.write(self.style.SUCCESS(
                        f'Updated superuser: {user.username} (password set from DJANGO_SUPERUSER_PASSWORD)'
                    ))
                else:
                    # Keep the existing (possibly admin-changed) password intact.
                    user.save()
                    self.stdout.write(self.style.SUCCESS(
                        f'Superuser exists: {user.username} - existing password left unchanged. '
                        'Set DJANGO_SUPERUSER_FORCE_PASSWORD_RESET=True to force a reset.'
                    ))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error ensuring superuser: {e}'))
