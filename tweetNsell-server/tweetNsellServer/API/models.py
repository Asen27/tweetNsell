from django.db import models
from django.contrib.auth.models import User
from django.contrib.postgres.fields import JSONField

class ServiceIndustry(models.Model):
    name_en = models.CharField(max_length = 30, unique=True)
    name_es = models.CharField(max_length = 30, unique=True)
    
    def __str__(self):
        return "%s (%s)" % (self.name_en, self.name_es)

    class Meta:
        verbose_name = "Service Industry"
        verbose_name_plural = "Service Industries"


class Administrator(models.Model):
    user_profile = models.OneToOneField(User, on_delete = models.CASCADE, primary_key=True)

    def __str__(self):
        return self.user_profile.username


class Brand(models.Model):
    user_profile = models.OneToOneField(User, on_delete = models.CASCADE, primary_key=True)
    id = models.CharField(max_length = 30)
    name = models.CharField(max_length = 50, blank = True)
    location = models.CharField(max_length = 40, blank = True)
    description = models.TextField(blank = True)

    ENGLISH = 'en'
    SPANISH = 'es'
    language_choices = [
        (ENGLISH, 'English'),
        (SPANISH, 'Español')
    ]
    language = models.CharField(
        max_length = 2,
        choices = language_choices,
        default = ENGLISH
    )

    url = models.CharField(max_length = 60, blank = True)
    is_verified = models.BooleanField(default = False)
    social_rating = JSONField()
    are_all_opinions_evaluated = models.BooleanField(default = True)

    def default_service_industry():
        if not (ServiceIndustry.objects.filter(name_en='Unspecified').exists()):
            service_industry = ServiceIndustry(name_en='Unspecified', name_es='No especificada')
            service_industry.save()
        return ServiceIndustry.objects.get(name_en='Unspecified').pk


    service_industry = models.ForeignKey(ServiceIndustry, default=default_service_industry, on_delete=models.SET_DEFAULT)

    def __str__(self):
        return self.user_profile.username


class Customer(models.Model):
    id = models.CharField(max_length = 30, primary_key=True)
    screen_name = models.CharField(max_length = 25, unique = True)
    name = models.CharField(max_length = 50, blank = True)
    url = models.CharField(max_length = 100, blank = True)
    number_followers = models.PositiveIntegerField()

    def __str__(self):
        return self.screen_name


class Opinion(models.Model):
    id = models.CharField(max_length = 30, primary_key=True)
    text = models.TextField(blank = True)

    ENGLISH = 'en'
    SPANISH = 'es'
    language_choices = [
        (ENGLISH, 'English'),
        (SPANISH, 'Español')
    ]
    language = models.CharField(
        max_length = 2,
        choices = language_choices,
        default = ENGLISH
    )

    publication_moment = models.DateTimeField()
    number_favorites = models.PositiveIntegerField()
    number_retweets = models.PositiveIntegerField()
    is_latest = models.BooleanField(default = False)
    is_pinned = models.BooleanField(default = False)

    POSITIVE = 'pos'
    NEGATIVE = 'neg'
    NEUTRAL = 'neu'
    UNCATEGORIZED = 'unc'

    attitude_choices = [
        (POSITIVE, 'Positive'),
        (NEGATIVE, 'Negative'),
        (NEUTRAL, 'Neutral'),
        (UNCATEGORIZED, 'Uncategorized'),
    ]
    attitude = models.CharField(
        max_length = 3,
        choices = attitude_choices,
        default = UNCATEGORIZED
    )


    brand = models.ForeignKey(Brand, on_delete=models.CASCADE)

    author = models.ForeignKey(Customer, on_delete=models.CASCADE)

    def __str__(self):
        return self.id












 
