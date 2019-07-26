from .models import ServiceIndustry, Administrator, Brand, Customer, Opinion
from rest_framework import serializers
from django.contrib.auth.models import User

class ServiceIndustrySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceIndustry
        fields = ['name_en', 'name_es']


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email', 'is_staff']

class BrandSerializer(serializers.ModelSerializer):
    user_profile = UserSerializer(many=False, read_only=True)


    service_industry = ServiceIndustrySerializer(many=False, read_only=True)

    class Meta:
        model = Brand
        fields = [
            'user_profile',
            'id',
            'name',
            'location',
            'description',
            'language',
            'url',
            'is_verified',
            'social_rating',
            'are_all_opinions_evaluated',
            'service_industry'
        ]


class AdministratorSerializer(serializers.ModelSerializer):
    user_profile = UserSerializer()

    class Meta:
        model = Administrator
        fields = [
            'user_profile'
        ]


class CustomerSerializer(serializers.ModelSerializer):

    class Meta:
        model = Customer
        fields = [
            'name',
            'screen_name',
            'url',
            'number_followers'
        ]

class OpinionSerializer(serializers.ModelSerializer):

    author = CustomerSerializer(many=False, read_only=True)
    brand = serializers.StringRelatedField(many=False)

    class Meta:
        model = Opinion
        fields = [
            'id',
            'text',
            'language',
            'publication_moment',
            'number_favorites',
            'number_retweets',
            'is_latest',
            'is_pinned',
            'attitude',
            'brand',
            'author'
        ]



