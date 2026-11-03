from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import SimpleTestCase

from .serializers import ApplicationSerializer


class ApplicationPaymentRequirementTests(SimpleTestCase):
    def setUp(self):
        self.application_data = {
            'name': 'Alex',
            'surname': 'Student',
            'age': 20,
            'mobile': '0831234567',
            'email': 'alex@example.com',
        }

    def test_application_without_proof_or_payfast_is_rejected(self):
        serializer = ApplicationSerializer(data=self.application_data)

        self.assertFalse(serializer.is_valid())
        self.assertIn('proof_of_payment', serializer.errors)

    def test_application_with_proof_of_payment_is_accepted(self):
        data = {
            **self.application_data,
            'proof_of_payment': SimpleUploadedFile(
                'receipt.pdf',
                b'payment receipt',
                content_type='application/pdf',
            ),
        }
        serializer = ApplicationSerializer(data=data)

        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_application_without_proof_is_accepted_for_payfast_checkout(self):
        data = {**self.application_data, 'payment_method': 'payfast'}
        serializer = ApplicationSerializer(data=data)

        self.assertTrue(serializer.is_valid(), serializer.errors)
