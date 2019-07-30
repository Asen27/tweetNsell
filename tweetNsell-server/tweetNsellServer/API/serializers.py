from .models import ServiceIndustry, Administrator, Brand, Customer, Opinion, Follower
from rest_framework import serializers
from django.contrib.auth.models import User
from django.db.models import Func, F, IntegerField
from django.db.models.expressions import Value
from django.db.models.functions import Cast

class ServiceIndustrySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceIndustry
        fields = ['name_en', 'name_es']


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email', 'is_staff']


class CompetitorSerializer(serializers.ModelSerializer):

    user_profile = UserSerializer(many=False, read_only=True)

    class Meta:
        model = Brand
        fields = ['user_profile', 'name', 'is_verified', 'social_rating']



class BrandSerializer(serializers.ModelSerializer):
    user_profile = UserSerializer(many=False, read_only=True)


    service_industry = ServiceIndustrySerializer(many=False, read_only=True)
    competitors = serializers.SerializerMethodField()

    def get_competitors(self, obj):
        brand_id = obj.id
        brand_service_industry = obj.service_industry
        if brand_service_industry.name_en is not 'Unspecified':
            num_positive_opinions = Func(F('social_rating'), Value('positive'), function='jsonb_extract_path_text')
            num_positive_opinions = Cast(num_positive_opinions, IntegerField())

            num_negative_opinions = Func(F('social_rating'), Value('negative'), function='jsonb_extract_path_text')
            num_negative_opinions = Cast(num_negative_opinions, IntegerField())

            query_set = Brand.objects.filter(service_industry = brand_service_industry).exclude(id = brand_id).annotate(
                total_rating=num_positive_opinions - num_negative_opinions).order_by('-total_rating')
        else:
            query_set = Brand.objects.none()
        return CompetitorSerializer(query_set, many=True).data


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
            'number_new_opinions',
            'service_industry',
            'competitors',
            'can_load_more_followers',
            'followers_cursor',
            'number_new_followers'

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

class FollowerSerializer(serializers.ModelSerializer):

    brands = serializers.StringRelatedField(many=True)

    class Meta:
        fields = [
            'id',
            'screen_name',
            'name',
            'location',
            'description',
            'is_verified',
            'url',
            'number_followers',
            'number_friends',
            'number_tweets',
            'influence',
            'brands'
        ]

