"""
Tests for the admin authentication and password-change flow.

Covers:
  * Successful password change and logging in with the new password.
  * Rejection of an incorrect current password.
  * Password validation failures (too short, numeric, mismatch, too similar).
  * Unauthenticated access to the protected endpoints.
  * Non-staff users cannot use the admin portal.
  * The old password no longer works after a change.
"""

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

User = get_user_model()

OLD_PASSWORD = 'Old-Secure-Pass-2024'
NEW_PASSWORD = 'Brand-New-Pass-2025'


class AdminAuthTestCase(TestCase):
    """Base class providing an admin user and an API client."""

    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            username='admin@bathudi.co.za',
            email='admin@bathudi.co.za',
            password=OLD_PASSWORD,
            is_staff=True,
            is_superuser=True,
        )

    def get_csrf_token(self):
        """
        Fetch a fresh CSRF token the same way the SPA does.

        The login/logout endpoints are CSRF protected, so every unsafe request
        needs a matching `csrftoken` cookie and `X-CSRFToken` header.

        A fresh token is fetched on every call because Django rotates the CSRF
        token when the user logs in.
        """
        self.client.get(reverse('admin-csrf'))
        return self.client.cookies['csrftoken'].value

    def login(self, email='admin@bathudi.co.za', password=OLD_PASSWORD, csrf_token=None):
        return self.client.post(
            reverse('admin-login'),
            {'email': email, 'password': password},
            format='json',
            HTTP_X_CSRFTOKEN=csrf_token if csrf_token is not None else self.get_csrf_token(),
        )

    def change_password(self, current=OLD_PASSWORD, new=NEW_PASSWORD, confirm=None, client=None):
        return (client or self.client).post(
            reverse('admin-change-password'),
            {
                'current_password': current,
                'new_password': new,
                'confirm_password': confirm if confirm is not None else new,
            },
            format='json',
        )


class AdminLoginTests(AdminAuthTestCase):
    def test_login_with_valid_credentials_succeeds(self):
        response = self.login()
        self.assertEqual(response.status_code, 200)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['email'], 'admin@bathudi.co.za')
        # The password hash must never be exposed.
        self.assertNotIn('password', response.data['user'])

    def test_login_with_wrong_password_is_rejected(self):
        response = self.login(password='totally-wrong')
        self.assertEqual(response.status_code, 400)
        self.assertIn('detail', response.data)

    def test_login_with_unknown_email_is_rejected(self):
        response = self.login(email='nobody@bathudi.co.za')
        self.assertEqual(response.status_code, 400)

    def test_login_is_case_insensitive_for_email(self):
        response = self.login(email='ADMIN@BATHUDI.CO.ZA')
        self.assertEqual(response.status_code, 200)

    def test_non_staff_user_cannot_log_in(self):
        User.objects.create_user(
            username='student@bathudi.co.za',
            email='student@bathudi.co.za',
            password=OLD_PASSWORD,
            is_staff=False,
        )
        response = self.login(email='student@bathudi.co.za')
        self.assertEqual(response.status_code, 400)

    def test_inactive_user_cannot_log_in(self):
        self.admin.is_active = False
        self.admin.save()
        response = self.login()
        self.assertEqual(response.status_code, 400)

    def test_login_sets_an_authenticated_session(self):
        self.login()
        response = self.client.get(reverse('admin-me'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['user']['email'], 'admin@bathudi.co.za')

    def test_logout_ends_the_session(self):
        self.login()
        response = self.client.post(
            reverse('admin-logout'),
            format='json',
            HTTP_X_CSRFTOKEN=self.get_csrf_token(),
        )
        self.assertEqual(response.status_code, 200)
        response = self.client.get(reverse('admin-me'))
        self.assertEqual(response.status_code, 403)


class AdminMeTests(AdminAuthTestCase):
    def test_me_requires_authentication(self):
        response = self.client.get(reverse('admin-me'))
        self.assertIn(response.status_code, (401, 403))

    def test_me_returns_the_current_user(self):
        self.login()
        response = self.client.get(reverse('admin-me'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['user']['username'], 'admin@bathudi.co.za')


class ChangePasswordTests(AdminAuthTestCase):
    def test_change_password_requires_authentication(self):
        response = self.change_password()
        self.assertIn(response.status_code, (401, 403))

    def test_change_password_requires_staff(self):
        # A regular (non-staff) authenticated user must not be able to change
        # a password through the admin portal.
        staff_only = User.objects.create_user(
            username='regular@bathudi.co.za',
            email='regular@bathudi.co.za',
            password=OLD_PASSWORD,
            is_staff=False,
        )
        self.client.force_authenticate(user=staff_only)
        response = self.change_password()
        self.assertEqual(response.status_code, 403)

    def test_successful_password_change(self):
        self.login()
        response = self.change_password()
        self.assertEqual(response.status_code, 200)
        self.assertIn('message', response.data)

    def test_password_is_stored_hashed_not_in_plaintext(self):
        self.login()
        self.change_password()
        self.admin.refresh_from_db()
        self.assertNotEqual(self.admin.password, NEW_PASSWORD)
        self.assertTrue(self.admin.check_password(NEW_PASSWORD))
        # Django's default hasher (PBKDF2) produces a salted, prefixed hash.
        self.assertTrue(self.admin.password.startswith('pbkdf2_'))

    def test_can_log_in_with_the_new_password_after_change(self):
        self.login()
        self.change_password()

        # New client so we are not reusing the old session.
        fresh_client = APIClient()
        fresh_client.get(reverse('admin-csrf'))
        response = fresh_client.post(
            reverse('admin-login'),
            {'email': 'admin@bathudi.co.za', 'password': NEW_PASSWORD},
            format='json',
            HTTP_X_CSRFTOKEN=fresh_client.cookies['csrftoken'].value,
        )
        self.assertEqual(response.status_code, 200)

    def test_old_password_no_longer_works_after_change(self):
        self.login()
        self.change_password()

        fresh_client = APIClient()
        fresh_client.get(reverse('admin-csrf'))
        response = fresh_client.post(
            reverse('admin-login'),
            {'email': 'admin@bathudi.co.za', 'password': OLD_PASSWORD},
            format='json',
            HTTP_X_CSRFTOKEN=fresh_client.cookies['csrftoken'].value,
        )
        self.assertEqual(response.status_code, 400)

    def test_incorrect_current_password_is_rejected(self):
        self.login()
        response = self.change_password(current='not-my-password')
        self.assertEqual(response.status_code, 400)
        self.assertIn('current_password', response.data)

        self.admin.refresh_from_db()
        self.assertTrue(self.admin.check_password(OLD_PASSWORD))

    def test_password_confirmation_must_match(self):
        self.login()
        response = self.change_password(new=NEW_PASSWORD, confirm='something-else')
        self.assertEqual(response.status_code, 400)
        self.assertIn('confirm_password', response.data)

    def test_short_password_is_rejected(self):
        self.login()
        response = self.change_password(new='Ab1!', confirm='Ab1!')
        self.assertEqual(response.status_code, 400)
        self.assertIn('new_password', response.data)

    def test_entirely_numeric_password_is_rejected(self):
        self.login()
        response = self.change_password(new='9182736455', confirm='9182736455')
        self.assertEqual(response.status_code, 400)
        self.assertIn('new_password', response.data)

    def test_common_password_is_rejected(self):
        self.login()
        response = self.change_password(new='password', confirm='password')
        self.assertEqual(response.status_code, 400)
        self.assertIn('new_password', response.data)

    def test_password_too_similar_to_current_is_rejected(self):
        self.login()
        similar = OLD_PASSWORD + 'x'
        response = self.change_password(new=similar, confirm=similar)
        self.assertEqual(response.status_code, 400)
        self.assertIn('new_password', response.data)

    def test_new_password_must_differ_from_current(self):
        self.login()
        response = self.change_password(new=OLD_PASSWORD, confirm=OLD_PASSWORD)
        self.assertEqual(response.status_code, 400)
        self.assertIn('new_password', response.data)

    def test_session_remains_valid_after_password_change(self):
        self.login()
        self.change_password()
        response = self.client.get(reverse('admin-me'))
        self.assertEqual(response.status_code, 200)

    def test_password_change_requires_all_fields(self):
        self.login()
        response = self.client.post(
            reverse('admin-change-password'),
            {'current_password': OLD_PASSWORD},
            format='json',
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn('new_password', response.data)
        self.assertIn('confirm_password', response.data)


class AdminCsrfTests(AdminAuthTestCase):
    """The SPA needs a CSRF token before it can make any unsafe request."""

    def test_csrf_endpoint_returns_a_token(self):
        response = self.client.get(reverse('admin-csrf'))
        self.assertEqual(response.status_code, 200)
        self.assertIn('csrf_token', response.data)
        self.assertTrue(response.data['csrf_token'])

    def test_csrf_endpoint_sets_the_csrftoken_cookie(self):
        response = self.client.get(reverse('admin-csrf'))
        self.assertIn('csrftoken', response.cookies)

    def test_csrf_endpoint_does_not_require_authentication(self):
        # An anonymous client must still be able to obtain a token.
        anonymous = APIClient()
        response = anonymous.get(reverse('admin-csrf'))
        self.assertEqual(response.status_code, 200)


class AdminCsrfEnforcementTests(AdminAuthTestCase):
    """
    The login and logout endpoints must be protected against CSRF.

    DRF marks every view as `csrf_exempt`, so Django's `CsrfViewMiddleware`
    skips API endpoints. DRF's `SessionAuthentication` only checks CSRF for
    *already authenticated* sessions, so the anonymous login endpoint would
    otherwise be exposed to "login CSRF" attacks, where a malicious site logs
    a victim into an account the attacker controls.
    """

    def setUp(self):
        super().setUp()
        # Fetch a CSRF token so the client holds a valid cookie/header pair.
        self.client.get(reverse('admin-csrf'))
        self.csrf_token = self.client.cookies['csrftoken'].value

    def test_login_without_csrf_token_is_rejected(self):
        response = self.client.post(
            reverse('admin-login'),
            {'email': 'admin@bathudi.co.za', 'password': OLD_PASSWORD},
            format='json',
        )
        self.assertEqual(response.status_code, 403)
        self.assertIn('CSRF', response.data['detail'])
        # The session must not have been created.
        self.assertNotIn('_auth_user_id', self.client.session)

    def test_login_with_invalid_csrf_token_is_rejected(self):
        response = self.client.post(
            reverse('admin-login'),
            {'email': 'admin@bathudi.co.za', 'password': OLD_PASSWORD},
            format='json',
            HTTP_X_CSRFTOKEN='this-is-not-a-valid-token',
        )
        self.assertEqual(response.status_code, 403)
        self.assertIn('CSRF', response.data['detail'])
        self.assertNotIn('_auth_user_id', self.client.session)

    def test_login_with_mismatched_csrf_token_is_rejected(self):
        # A syntactically valid token that does not match the cookie.
        other_client = APIClient()
        other_client.get(reverse('admin-csrf'))
        other_token = other_client.cookies['csrftoken'].value

        response = self.client.post(
            reverse('admin-login'),
            {'email': 'admin@bathudi.co.za', 'password': OLD_PASSWORD},
            format='json',
            HTTP_X_CSRFTOKEN=other_token,
        )
        self.assertEqual(response.status_code, 403)
        self.assertIn('CSRF', response.data['detail'])

    def test_login_with_valid_csrf_token_succeeds(self):
        response = self.client.post(
            reverse('admin-login'),
            {'email': 'admin@bathudi.co.za', 'password': OLD_PASSWORD},
            format='json',
            HTTP_X_CSRFTOKEN=self.csrf_token,
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('_auth_user_id', self.client.session)

    def test_login_from_untrusted_origin_is_rejected(self):
        response = self.client.post(
            reverse('admin-login'),
            {'email': 'admin@bathudi.co.za', 'password': OLD_PASSWORD},
            format='json',
            HTTP_X_CSRFTOKEN=self.csrf_token,
            HTTP_ORIGIN='http://evil.example.com',
        )
        self.assertEqual(response.status_code, 403)
        self.assertIn('CSRF', response.data['detail'])
        self.assertNotIn('_auth_user_id', self.client.session)

    def test_logout_without_csrf_token_is_rejected(self):
        # Log in first, then try to log out without a CSRF token.
        self.login(csrf_token=self.csrf_token)
        response = self.client.post(reverse('admin-logout'), format='json')
        self.assertEqual(response.status_code, 403)
        # The session must still be active.
        self.assertEqual(self.client.get(reverse('admin-me')).status_code, 200)

    def test_logout_with_valid_csrf_token_succeeds(self):
        self.login(csrf_token=self.csrf_token)
        response = self.client.post(
            reverse('admin-logout'),
            format='json',
            HTTP_X_CSRFTOKEN=self.get_csrf_token(),
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.client.get(reverse('admin-me')).status_code, 403)


class EnsureSuperuserCommandTests(TestCase):
    """The deploy command must not revert an admin-changed password."""

    def test_existing_password_is_not_reset_on_redeploy(self):
        import os

        from django.core.management import call_command

        user = User.objects.create_user(
            username='admin@bathudi.co.za',
            email='admin@bathudi.co.za',
            password=OLD_PASSWORD,
            is_staff=True,
            is_superuser=True,
        )

        os.environ['DJANGO_SUPERUSER_PASSWORD'] = 'Some-Env-Password-9999'
        os.environ.pop('DJANGO_SUPERUSER_FORCE_PASSWORD_RESET', None)
        try:
            call_command('ensure_superuser', verbosity=0)
        finally:
            os.environ.pop('DJANGO_SUPERUSER_PASSWORD', None)

        user.refresh_from_db()
        self.assertTrue(user.check_password(OLD_PASSWORD))
        self.assertFalse(user.check_password('Some-Env-Password-9999'))
