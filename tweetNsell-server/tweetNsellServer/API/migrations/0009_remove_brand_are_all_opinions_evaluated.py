# Generated by Django 2.2.3 on 2019-07-28 08:48

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('API', '0008_brand_number_new_opinions'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='brand',
            name='are_all_opinions_evaluated',
        ),
    ]