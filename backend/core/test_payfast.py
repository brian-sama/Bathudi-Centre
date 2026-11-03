import hashlib
from decimal import Decimal

from django.test import SimpleTestCase, override_settings

from .services.payfast import PayFastService
from .views import _get_application_payment_amount


class PayFastSignatureTests(SimpleTestCase):
    def setUp(self):
        self.payfast = PayFastService()
        self.payfast.merchant_id = '10000100'
        self.payfast.merchant_key = 'merchant-key'
        self.payfast.security_passphrase = 'pay fast&+~'
        self.payfast.use_sandbox = True

    def test_signature_uses_field_order_and_urlencodes_values_and_passphrase(self):
        fields = {
            'merchant_id': '10000100',
            'item_name': 'Course / fee',
            'email_address': 'student+test@example.com',
        }
        signature_string = (
            'merchant_id=10000100'
            '&item_name=Course+%2F+fee'
            '&email_address=student%2Btest%40example.com'
            '&passphrase=pay+fast%26%2B%7E'
        )

        self.assertEqual(
            self.payfast.generate_signature(fields),
            hashlib.md5(signature_string.encode()).hexdigest(),
        )

    def test_form_fields_use_payfast_order_and_signature(self):
        form_data = self.payfast.create_payment_form_data(
            application_id=123,
            amount=Decimal('1520.00'),
            return_url='https://example.com/payment-success',
            cancel_url='https://example.com/payment-cancel',
            notify_url='https://example.com/api/payfast/notify/',
            email_address='student@example.com',
            payer_name='Alex Student',
        )
        expected_fields = [
            'merchant_id',
            'merchant_key',
            'return_url',
            'cancel_url',
            'notify_url',
            'name_first',
            'name_last',
            'email_address',
            'm_payment_id',
            'amount',
            'item_name',
            'item_description',
            'signature',
        ]
        signature_string = (
            'merchant_id=10000100'
            '&merchant_key=merchant-key'
            '&return_url=https%3A%2F%2Fexample.com%2Fpayment-success'
            '&cancel_url=https%3A%2F%2Fexample.com%2Fpayment-cancel'
            '&notify_url=https%3A%2F%2Fexample.com%2Fapi%2Fpayfast%2Fnotify%2F'
            '&name_first=Alex'
            '&name_last=Student'
            '&email_address=student%40example.com'
            '&m_payment_id=123'
            '&amount=1520.00'
            '&item_name=Bathudi+Training+Centre+-+Registration+and+Assessment+Fees'
            '&item_description=Application+Registration+and+Assessment+Fees+-+Application+ID%3A+123'
            '&passphrase=pay+fast%26%2B%7E'
        )

        self.assertEqual(list(form_data), expected_fields)
        self.assertNotIn('reference', form_data)
        self.assertEqual(
            form_data['signature'],
            hashlib.md5(signature_string.encode()).hexdigest(),
        )
        self.assertTrue(self.payfast.validate_payment(form_data))


class ApplicationPaymentAmountTests(SimpleTestCase):
    @override_settings(REGISTRATION_FEE_AMOUNT='1520.00')
    def test_application_payment_amount_includes_registration_and_assessment(self):
        self.assertEqual(_get_application_payment_amount(), Decimal('1520.00'))
