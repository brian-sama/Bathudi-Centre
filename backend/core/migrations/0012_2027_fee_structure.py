# Generated - 2027 fee structure update: R760 reg + R760 assessment = R1,520

from django.db import migrations, models


def set_2027_fees(apps, schema_editor):
    Course = apps.get_model('core', 'Course')
    Course.objects.all().update(registration_fee=760.00, assessment_fee=760.00)


def reverse_fees(apps, schema_editor):
    Course = apps.get_model('core', 'Course')
    Course.objects.filter(registration_fee=760.00, assessment_fee=760.00).update(
        registration_fee=665.00, assessment_fee=665.00
    )


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0011_alter_course_registration_fee'),
    ]

    operations = [
        migrations.AlterField(
            model_name='course',
            name='registration_fee',
            field=models.DecimalField(decimal_places=2, default=760.00, help_text='Non-refundable registration fee', max_digits=10),
        ),
        migrations.AlterField(
            model_name='course',
            name='assessment_fee',
            field=models.DecimalField(decimal_places=2, default=760.00, help_text='Assessment fee', max_digits=10),
        ),
        migrations.RunPython(set_2027_fees, reverse_fees),
    ]
