"""
Admin authentication endpoints.

These endpoints are session-authenticated so the admin portal never has to
store credentials or tokens in the browser:

    POST /api/auth/login/           -> validates credentials, starts a session
    POST /api/auth/logout/          -> ends the session
    GET  /api/auth/me/              -> returns the currently logged-in admin
    POST /api/auth/change-password/ -> changes the admin's own password

Security notes:
  * Passwords are verified with Django's constant-time `check_password`.
  * Failed logins are rate limited per IP address (see `LOGIN_MAX_ATTEMPTS`).
  * Passwords are stored hashed (PBKDF2) by Django's `set_password`.
  * Changing a password re-keys the session so a stolen session cookie
    cannot be reused after the change.
"""

import logging
import time

from django.contrib.auth import login, logout, update_session_auth_hash
from django.middleware.csrf import get_token
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.authentication import CSRFCheck

from .serializers import (
    AdminLoginSerializer,
    AdminUserSerializer,
    ChangePasswordSerializer,
)

logger = logging.getLogger(__name__)

# Simple in-memory brute force protection.
# key -> (failure_count, first_failure_timestamp)
FAILED_LOGIN_ATTEMPTS = {}
LOGIN_MAX_ATTEMPTS = 8
LOGIN_LOCKOUT_SECONDS = 15 * 60


class LoginRateThrottle(ScopedRateThrottle):
    """Rate limit for the admin login endpoint (scope: 'login')."""

    scope = 'login'


class PasswordChangeRateThrottle(ScopedRateThrottle):
    """Rate limit for the admin password change endpoint (scope: 'password_change')."""

    scope = 'password_change'


def _client_ip(request):
    forwarded = request.META.get('HTTP_X_FORWARDED_FOR', '')
    if forwarded:
        return forwarded.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', 'unknown')


def _is_locked_out(key):
    record = FAILED_LOGIN_ATTEMPTS.get(key)
    if not record:
        return False
    count, first_attempt = record
    if count < LOGIN_MAX_ATTEMPTS:
        return False
    if (time.time() - first_attempt) > LOGIN_LOCKOUT_SECONDS:
        # Window expired, allow another round of attempts.
        FAILED_LOGIN_ATTEMPTS.pop(key, None)
        return False
    return True


def _register_failure(key):
    count, first_attempt = FAILED_LOGIN_ATTEMPTS.get(key, (0, time.time()))
    if (time.time() - first_attempt) > LOGIN_LOCKOUT_SECONDS:
        count, first_attempt = 0, time.time()
    FAILED_LOGIN_ATTEMPTS[key] = (count + 1, first_attempt)


def _clear_failures(key):
    FAILED_LOGIN_ATTEMPTS.pop(key, None)


def _enforce_csrf(request):
    """
    Enforce Django's CSRF validation on an unsafe request.

    DRF builds every view with `csrf_exempt`, so Django's `CsrfViewMiddleware`
    skips API endpoints entirely. DRF's own `SessionAuthentication` only runs
    its CSRF check for *already authenticated* sessions, which means the
    anonymous endpoints (login / logout) were never protected against
    cross-site request forgery -- a "login CSRF" attack, where a malicious
    site logs a victim into an account the attacker controls.

    This helper reuses DRF's own `CSRFCheck` middleware so the behaviour
    (token source, Origin/Referer checks, error wording) stays identical to
    the rest of the framework.
    """
    def dummy_get_response(request):  # pragma: no cover
        return None

    # Django's test client sets `_dont_enforce_csrf_checks` on the request so
    # that tests do not have to deal with CSRF tokens. That flag must not
    # disable the check here, otherwise the tests would never exercise it.
    # Clear it on the underlying HttpRequest (DRF wraps it) so the check
    # behaves exactly like it does in production.
    underlying = getattr(request, '_request', request)
    underlying._dont_enforce_csrf_checks = False

    # For an already authenticated session, DRF's `SessionAuthentication` has
    # already run its own CSRF check and flagged the request as processed.
    # Reset the flag so this check is performed for real.
    request.csrf_processing_done = False
    underlying.csrf_processing_done = False

    check = CSRFCheck(dummy_get_response)
    # Populates request.META['CSRF_COOKIE'], used by process_view().
    check.process_request(request)
    reason = check.process_view(request, None, (), {})
    if reason:
        raise PermissionDenied('CSRF Failed: %s' % reason)


@api_view(['GET'])
@permission_classes([AllowAny])
def admin_csrf(request):
    """
    Issue a CSRF token (and the matching `csrftoken` cookie).

    Django's CSRF middleware protects every unsafe request, including the
    login POST, so the SPA has to fetch a token before it can sign in.
    """
    token = get_token(request)
    return Response({'csrf_token': token}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([LoginRateThrottle])
def admin_login(request):
    """Authenticate an admin and start a Django session."""
    # Validate the CSRF token before doing anything else so that the login
    # endpoint cannot be abused for cross-site request forgery.
    _enforce_csrf(request)

    ip_key = _client_ip(request)

    if _is_locked_out(ip_key):
        logger.warning('Admin login temporarily blocked for %s', ip_key)
        return Response(
            {'detail': 'Too many failed login attempts. Please try again in 15 minutes.'},
            status=status.HTTP_429_TOO_MANY_REQUESTS,
        )

    serializer = AdminLoginSerializer(data=request.data, context={'request': request})
    if not serializer.is_valid():
        _register_failure(ip_key)
        logger.warning('Failed admin login attempt from %s', ip_key)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user = serializer.validated_data['user']

    # Rotate the session id on login to prevent session fixation.
    login(request, user)
    request.session.set_expiry(0)  # Session expires when the browser closes.

    _clear_failures(ip_key)
    logger.info('Admin login succeeded for %s', user.username)

    response = Response({'user': AdminUserSerializer(user).data}, status=status.HTTP_200_OK)
    # Ensure the CSRF cookie is issued so the SPA can make unsafe requests.
    response['X-CSRFToken'] = get_token(request)
    return response


@api_view(['POST'])
@permission_classes([AllowAny])
def admin_logout(request):
    """End the current admin session."""
    # Logging out is also an unsafe, state-changing request.
    _enforce_csrf(request)

    logout(request)
    return Response({'message': 'Signed out successfully.'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_me(request):
    """Return details of the currently authenticated admin."""
    user = request.user
    return Response({
        'user': AdminUserSerializer(user).data,
        'server_time': timezone.now().isoformat(),
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAdminUser])
@throttle_classes([PasswordChangeRateThrottle])
def admin_change_password(request):
    """Change the authenticated admin's own password."""
    serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user = serializer.save()

    # Keep the current session valid, but rotate the session key so any
    # previously captured session cookie becomes useless.
    update_session_auth_hash(request, user)

    logger.info('Password changed for admin %s', user.username)

    return Response(
        {'message': 'Your password has been updated successfully.'},
        status=status.HTTP_200_OK,
    )
