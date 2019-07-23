# Generated by Django 2.2.3 on 2019-07-23 21:10

from django.conf import settings
import django.contrib.postgres.fields.jsonb
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0011_update_proxy_permissions'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('API', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Brand',
            fields=[
                ('user_profile', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, serialize=False, to=settings.AUTH_USER_MODEL)),
                ('id', models.CharField(max_length=30)),
                ('name', models.CharField(blank=True, max_length=50)),
                ('location', models.CharField(blank=True, max_length=40)),
                ('description', models.TextField(blank=True)),
                ('language', models.CharField(choices=[('en', 'English'), ('es', 'Español')], default='en', max_length=2)),
                ('url', models.CharField(blank=True, max_length=60)),
                ('is_verified', models.BooleanField(default=False)),
                ('social_rating', django.contrib.postgres.fields.jsonb.JSONField()),
                ('are_all_opinions_evaluated', models.BooleanField(default=True)),
                ('service_industry', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='API.ServiceIndustry')),
            ],
        ),
        migrations.CreateModel(
            name='Opinion',
            fields=[
                ('id', models.CharField(max_length=30, primary_key=True, serialize=False)),
                ('text', models.TextField(blank=True)),
                ('language', models.CharField(choices=[('en', 'English'), ('es', 'Español')], default='en', max_length=2)),
                ('publication_moment', models.DateTimeField()),
                ('number_favorites', models.PositiveIntegerField()),
                ('number_retweets', models.PositiveIntegerField()),
                ('is_latest', models.BooleanField(default=False)),
                ('is_pinned', models.BooleanField(default=False)),
                ('attitude', models.CharField(choices=[('pos', 'Positive'), ('nwg', 'Negative'), ('neu', 'Neutral'), ('unc', 'Uncategorized')], default='unc', max_length=3)),
                ('brand', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='API.Brand')),
            ],
        ),
        migrations.CreateModel(
            name='Administrator',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user_profile', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
