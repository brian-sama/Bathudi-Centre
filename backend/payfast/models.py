from django.db import models

class PayfastTransaction(models.Model):
    payment_id = models.CharField(max_length=100, unique=True)
    email = models.EmailField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    raw_response = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.payment_id} - {self.email} - {self.status}"
