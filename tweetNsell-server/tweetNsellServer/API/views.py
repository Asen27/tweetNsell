from tweetNsellServer.API.serializers import *
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from django.http import FileResponse, HttpResponse
from rest_framework.generics import ListAPIView, DestroyAPIView, UpdateAPIView
from .models import ServiceIndustry, Administrator, Brand, Customer, Opinion
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from datetime import datetime
#from dateutil.relativedelta import relativedelta
#from django.db.models import Q, Count, StdDev, Avg, Sum, Case, When, IntegerField, Value
#from django.utils.datastructures import MultiValueDictKeyError
from django.http.response import JsonResponse
#from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
#from collections import namedtuple
from dateutil import parser
from django.contrib.auth.hashers import make_password
from urllib.parse import unquote
from urllib.error import URLError
from http.client import BadStatusLine
import re
import twitter
import os
#import json
import time
import sys




def oauth_login():
    
    CONSUMER_KEY = os.getenv('CONSUMER_KEY')
    CONSUMER_SECRET = os.getenv('CONSUMER_SECRET')
    OAUTH_TOKEN = os.getenv('OAUTH_TOKEN')
    OAUTH_TOKEN_SECRET = os.getenv('OAUTH_TOKEN_SECRET')
    
    auth = twitter.oauth.OAuth(OAUTH_TOKEN, OAUTH_TOKEN_SECRET,
                               CONSUMER_KEY, CONSUMER_SECRET)
    
    twitter_api = twitter.Twitter(auth=auth)
    return twitter_api

#THE FOLLOWING FUNCTION IS COPIED FROM THE BOOK "Mining the Social Web, 3rd Edition" by Matthew A. Russell and Mikhail Klassen
#It serves as a general-purpose API wrapper and provides abstracted logic for handling various HTTP error codes in meaningful ways
def make_twitter_request(twitter_api_func, max_errors=10, *args, **kw): 
    
    # A nested helper function that handles common HTTPErrors. Return an updated
    # value for wait_period if the problem is a 500 level error. Block until the
    # rate limit is reset if it's a rate limiting issue (429 error). Returns None
    # for 401 and 404 errors, which requires special handling by the caller.
    def handle_twitter_http_error(e, wait_period=2, sleep_when_rate_limited=True):
    
        if wait_period > 3600: # Seconds
            print('Too many retries. Quitting.', file=sys.stderr)
            raise e
    
    
        if e.e.code == 401:
            print('Encountered 401 Error (Not Authorized)', file=sys.stderr)
            return None
        elif e.e.code == 404:
            print('Encountered 404 Error (Not Found)', file=sys.stderr)
            return None
        elif e.e.code == 429: 
            print('Encountered 429 Error (Rate Limit Exceeded)', file=sys.stderr)
            if sleep_when_rate_limited:
                print("Retrying in 15 minutes...ZzZ...", file=sys.stderr)
                sys.stderr.flush()
                time.sleep(60*15 + 5)
                print('...ZzZ...Awake now and trying again.', file=sys.stderr)
                return 2
            else:
                raise e # Caller must handle the rate limiting issue
        elif e.e.code in (500, 502, 503, 504):
            print('Encountered {0} Error. Retrying in {1} seconds'\
                  .format(e.e.code, wait_period), file=sys.stderr)
            time.sleep(wait_period)
            wait_period *= 1.5
            return wait_period
        else:
            raise e

    # End of nested helper function
    
    wait_period = 2 
    error_count = 0 

    while True:
        try:
            return twitter_api_func(*args, **kw)
        except twitter.api.TwitterHTTPError as e:
            error_count = 0 
            wait_period = handle_twitter_http_error(e, wait_period)
            if wait_period is None:
                return
        except URLError as e:
            error_count += 1
            time.sleep(wait_period)
            wait_period *= 1.5
            print("URLError encountered. Continuing.", file=sys.stderr)
            if error_count > max_errors:
                print("Too many consecutive errors...bailing out.", file=sys.stderr)
                raise
        except BadStatusLine as e:
            error_count += 1
            time.sleep(wait_period)
            wait_period *= 1.5
            print("BadStatusLine encountered. Continuing.", file=sys.stderr)
            if error_count > max_errors:
                print("Too many consecutive errors...bailing out.", file=sys.stderr)
                raise



def get_brand_profile(twitter_api, username):
   
    # Must have either screen_name or user_id (logical xor)
    assert (username != None), \
    "username is obligatory"
    
    brand_info = {}

    try:
        response = make_twitter_request(twitter_api.users.show, screen_name=username, include_entities=True)
    except Exception:
        response = None

    if response is None:
        return None

    if response['protected'] == 'true':
        return None

    brand_info['id'] = response['id_str']
    brand_info['username'] = username
    brand_info['name'] = unquote(response['name'])
    brand_info['location'] = unquote(response['location'])
    brand_info['description'] = unquote(response['description'])
    brand_info['is_verified'] = response['verified']

    
    try:
        brand_info['language'] = response['status']['lang']

    except Exception:
        return None

    else:
        if not (brand_info['language'] == 'en' or brand_info['language'] == 'es'):
            return None

    try:
        brand_info['url'] = response['entities']['url']['urls'][0]['display_url']

    except Exception:
        brand_info['url'] =''

    return brand_info



def get_user_by_token(request):
    name, key = request.META['HTTP_AUTHORIZATION'].split(' ', 1)
    tk = get_object_or_404(Token, key=key)
    user_profile = tk.user

    if (user_profile.is_staff):
        user = Administrator.objects.get(user_profile=user_profile)
        
    else:
        user = Brand.objects.get(user_profile=user_profile)
    
    return user

class GetUserView(APIView):
    permission_classes = (IsAuthenticated, )
    authentication_classes = (TokenAuthentication, SessionAuthentication)

    def post(self, request):
        user = get_user_by_token(request)
        if (isinstance(user, Brand)):
            return Response(BrandSerializer(user, many=False).data)
        else:
            return Response(AdministratorSerializer(user, many=False).data)


class RegisterBrand(APIView):
    def post(self, request):
        username = request.data.get('username', '')
        password = request.data.get('password', '')
        confirm_password = request.data.get('confirm_password', '')
        email = request.data.get('email', '')
        service_industry = request.data.get('service_industry')

        if username == '' or password == '':
            return JsonResponse({'error':'Missing credentials!'}, status=500)


        length_error = len(password) < 8
        digit_error = re.search(r"\d", password) is None
        uppercase_error = re.search(r"[A-Z]", password) is None
        lowercase_error = re.search(r"[a-z]", password) is None
        symbol_error = re.search(r"[ !#$%&'()*+,-./[\\\]^_`{|}~"+r'"]', password) is None
        is_password_invalid = length_error or digit_error or uppercase_error or lowercase_error or symbol_error
        if is_password_invalid:
            return JsonResponse({'error':'Invalid password!'}, status=500)

        if password != confirm_password:
            return JsonResponse({'error': 'Passwords do not match!'}, status=500)


        twitter_api = oauth_login()
        brand_info = get_brand_profile(twitter_api, username)

        if brand_info is None:
            return JsonResponse({'error': 'Invalid Twitter account!'}, status=500)


        encrypted_password = make_password(password)

    
        social_rating = {}
        social_rating['positive'] = 0
        social_rating['negative'] = 0 
        social_rating['neutral'] = 0

        if (service_industry == ''):
            service_industry_object = ServiceIndustry.objects.filter(name_en='Unspecified')[:1].get()
        else:
            if (ServiceIndustry.objects.filter(name_en=service_industry).exists()):
                service_industry_object = ServiceIndustry.objects.filter(name_en=service_industry)[:1].get()
            else:
                service_industry_object = ServiceIndustry.objects.filter(name_en='Unspecified')[:1].get()

        try:
            user_profile = User(username=username, password=encrypted_password, email=email)
            user_profile.save()

        except Exception:
            return JsonResponse({'error': 'This brand already exists!'}, status=500)

        brand = Brand(
            user_profile = user_profile, 
            id = brand_info['id'], 
            name = brand_info['name'],
            location = brand_info['location'],
            description = brand_info['description'],
            language = brand_info['language'],
            url = brand_info['url'],
            is_verified = brand_info['is_verified'],
            social_rating = social_rating,
            are_all_opinions_evaluated = True,
            service_industry = service_industry_object
        )

        brand.save()

        return JsonResponse({'message':'Sign up performed successfuly'}, status=201)


class ServiceIndustriesList(ListAPIView):
    
    permission_classes = (IsAdminUser, )
    authentication_classes = (TokenAuthentication, SessionAuthentication)

    serializer_class = ServiceIndustrySerializer

    def get_queryset(self):
        return ServiceIndustry.objects.all().order_by('name_en')


class CreateServiceIndustry(APIView):
    permission_classes = (IsAdminUser, )
    authentication_classes = (TokenAuthentication, SessionAuthentication)

    def post(self, request):

        name_en = request.data.get('name_en')
        name_es = request.data.get('name_es')


        try:
            service_industry = ServiceIndustry(name_en = name_en, name_es = name_es)
            service_industry.save()

        except Exception:
            return JsonResponse({'error': 'This service industry already exists!'}, status=500)

        else:
            return JsonResponse({'message':'Service industry created successfuly'}, status=201)
        

class DeleteServiceIndustry(DestroyAPIView):
    permission_classes = (IsAdminUser, )
    authentication_classes = (TokenAuthentication, SessionAuthentication)

    serializer_class = ServiceIndustrySerializer
    lookup_field = 'id'


    def get_queryset(self):
        queryset = ServiceIndustry.objects.all()
        return queryset

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
        except Exception:
            return JsonResponse({'error': "This service industry doesn't exists!"}, status=500)
        else:
            if instance.name_en == 'Unspecified':
                return JsonResponse({'error': "The default service industry can't be deleted!"}, status=500)
            else:
                self.perform_destroy(instance)
                return JsonResponse({'message':'The service industry has been deleted successfuly'}, status=201)
        


class LoadOpinions(APIView):
    permission_classes = (IsAuthenticated, )
    authentication_classes = (TokenAuthentication, SessionAuthentication)


    def search_for_opinions(self, twitter_api, username, language, last_tweet_id=None, max_results=200):

        q = '@%s -filter:retweets AND filter:safe' % username
        
        try:
            search_results = make_twitter_request(twitter_api.search.tweets, q=q, lang=language, count=100, tweet_mode='extended', include_entities=True, since_id=last_tweet_id)
        
        except Exception as e:
            print(str(e))
            return None  
        
        opinions = search_results['statuses']

        max_results = min(500, max_results)
        stop = False
        for _ in range(5): 
            if len(search_results['statuses']) < 100:
                stop = True
            
            if stop is False:
                max_id = search_results['statuses'][-1]['id_str']
                try:
                    search_results = make_twitter_request(twitter_api.search.tweets, q=q, lang=language, count=100, tweet_mode='extended', include_entities=True, max_id=max_id, since_id=last_tweet_id)
                except Exception:
                    return None
               
                opinions += search_results['statuses'][1:]
            else:
                break
            
            if len(opinions) > max_results: 
                break
                
        return opinions



    def post(self, request):

        brand = get_user_by_token(request)

        if not (isinstance(brand, Brand)):
            return JsonResponse({'error':'Only brands can search for opinions!'}, status=500)

        twitter_api = oauth_login()

        language = brand.language

        try:
            last_tweet_id = Opinion.objects.filter(brand = brand, is_latest = True)[:1].get()
        except Opinion.DoesNotExist:
            last_tweet_id = None

        opinions = self.search_for_opinions(twitter_api, brand.user_profile.username, language , last_tweet_id)

        if opinions is None:
            return JsonResponse({'error':'A problem occurred while searching the opinions!'}, status=500)


        is_first = True;
        for opinion in opinions:
            if (opinion['lang'] == brand.language and len(opinion['entities']['user_mentions']) == 1 and len(opinion['entities']['urls']) == 0):
                id = opinion['id_str']
                text = unquote(opinion['full_text'])
                text = re.sub(r'https?:\/\/.*[\r\n]*', ' ', text, flags=re.MULTILINE)
                language = opinion['lang']
                publication_moment = parser.parse(opinion['created_at'])
                number_favorites = opinion['favorite_count']
                number_retweets = opinion['retweet_count']
                author_id = opinion['user']['id_str']
                author_name = unquote(opinion['user']['name'])
                author_screen_name = opinion['user']['screen_name']
                try:
                    author_url = opinion['user']['entities']['url']['urls'][0]['expanded_url']
                except Exception:
                    author_url = ''
                author_number_followers = opinion['user']['followers_count']
                if is_first is True:
                    is_latest = True
                    is_first = False
                else:
                    is_latest = False
            
                try:
                    author = Customer(
                    id = author_id, 
                    screen_name = author_screen_name, 
                    name = author_name,
                    url =author_url,
                    number_followers = author_number_followers)
                    author.save()
                
                except Exception:
                    if Customer.objects.filter(id = author_id).exists():
                        author = Customer.objects.get(pk = author_id)
                    else:
                        print('VNIMANIEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE!!!!!!!')
                        author = Customer(
                        id = '7857353745384753875', 
                        screen_name = "senranbay", 
                        name = "Asen",
                        url = '',
                        number_followers = 3)
                        author.save()

                try:

                    new_opinion = Opinion(
                    id = id, 
                    text = text,
                    language = language, 
                    publication_moment = publication_moment,
                    number_favorites = number_favorites,
                    number_retweets = number_retweets,
                    is_latest = is_latest,
                    is_pinned = False,
                    attitude = 'unc',
                    brand = brand,
                    author = author
                    )
                    new_opinion.save()

                except Exception as e:
                    print(str(e))
                    print(text)

                    
        brand.are_all_opinions_evaluated = False
        brand.save()          
        return JsonResponse({'message':'Tweets loaded successfuly'}, status=201)

    
class AllOpinionsList(ListAPIView):
    
    permission_classes = (IsAuthenticated, )
    authentication_classes = (TokenAuthentication, SessionAuthentication)

    serializer_class = OpinionSerializer

    def check_permissions(self, request):
       
        for permission in self.get_permissions():
            if not permission.has_permission(request, self):
                self.permission_denied(request)

        if self.request.user.is_staff:
            self.permission_denied(request)

    def get_queryset(self):
        return Opinion.objects.filter(brand__user_profile = self.request.user).order_by('-publication_moment')

class NewOpinionsList(ListAPIView):
    
    permission_classes = (IsAuthenticated, )
    authentication_classes = (TokenAuthentication, SessionAuthentication)

    serializer_class = OpinionSerializer

    def check_permissions(self, request):
       
        for permission in self.get_permissions():
            if not permission.has_permission(request, self):
                self.permission_denied(request)

        if self.request.user.is_staff:
            self.permission_denied(request)

    def get_queryset(self):
        return Opinion.objects.filter(brand__user_profile = self.request.user, attitude = 'unc').order_by('-publication_moment')


class EvaluatedOpinionsList(ListAPIView):
    
    permission_classes = (IsAuthenticated, )
    authentication_classes = (TokenAuthentication, SessionAuthentication)

    serializer_class = OpinionSerializer

    def check_permissions(self, request):
       
        for permission in self.get_permissions():
            if not permission.has_permission(request, self):
                self.permission_denied(request)

        if self.request.user.is_staff:
            self.permission_denied(request)

    def get_queryset(self):
        return Opinion.objects.filter(brand__user_profile = self.request.user).exclude(attitude = 'unc').order_by('-publication_moment')


class PinnedOpinionsList(ListAPIView):
    
    permission_classes = (IsAuthenticated, )
    authentication_classes = (TokenAuthentication, SessionAuthentication)

    serializer_class = OpinionSerializer

    def check_permissions(self, request):
       
        for permission in self.get_permissions():
            if not permission.has_permission(request, self):
                self.permission_denied(request)

        if self.request.user.is_staff:
            self.permission_denied(request)

    def get_queryset(self):
        return Opinion.objects.filter(brand__user_profile = self.request.user, is_Pinned = True).order_by('-publication_moment')

class PositiveOpinionsList(ListAPIView):
    
    permission_classes = (IsAuthenticated, )
    authentication_classes = (TokenAuthentication, SessionAuthentication)

    serializer_class = OpinionSerializer

    def check_permissions(self, request):
       
        for permission in self.get_permissions():
            if not permission.has_permission(request, self):
                self.permission_denied(request)

        if self.request.user.is_staff:
            self.permission_denied(request)

    def get_queryset(self):
        return Opinion.objects.filter(brand__user_profile = self.request.user, attitude = 'pos').order_by('-publication_moment')

class NegativeOpinionsList(ListAPIView):
    
    permission_classes = (IsAuthenticated, )
    authentication_classes = (TokenAuthentication, SessionAuthentication)

    serializer_class = OpinionSerializer

    def check_permissions(self, request):
       
        for permission in self.get_permissions():
            if not permission.has_permission(request, self):
                self.permission_denied(request)

        if self.request.user.is_staff:
            self.permission_denied(request)

    def get_queryset(self):
        return Opinion.objects.filter(brand__user_profile = self.request.user, attitude = 'neg').order_by('-publication_moment')

class NeutralOpinionsList(ListAPIView):
    
    permission_classes = (IsAuthenticated, )
    authentication_classes = (TokenAuthentication, SessionAuthentication)

    serializer_class = OpinionSerializer
    
    def check_permissions(self, request):
       
        for permission in self.get_permissions():
            if not permission.has_permission(request, self):
                self.permission_denied(request)

        if self.request.user.is_staff:
            self.permission_denied(request)

    def get_queryset(self):
        return Opinion.objects.filter(brand__user_profile = self.request.user, attitude = 'neu').order_by('-publication_moment')

    
class PinOpinion(UpdateAPIView):
    permission_classes = (IsAuthenticated, )
    authentication_classes = (TokenAuthentication, SessionAuthentication)

    serializer_class = OpinionSerializer
    lookup_field = 'id'

    def check_permissions(self, request):
       
        for permission in self.get_permissions():
            if not permission.has_permission(request, self):
                self.permission_denied(request)

        if self.request.user.is_staff:
            self.permission_denied(request)


    def get_queryset(self):
        return Opinion.objects.filter(brand__user_profile = self.request.user)

    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
        except Exception:
            return JsonResponse({'error': "This opinion doesn't exists!"}, status=500)
        else:
            if instance.is_pinned:
                return JsonResponse({'error': "This opinion is already pinned!"}, status=500)
            else:
                instance.is_pinned = True
                instance.save()
                return JsonResponse({'message':'The opinion has been pinned successfuly'}, status=201)


class UnpinOpinion(UpdateAPIView):
    permission_classes = (IsAuthenticated, )
    authentication_classes = (TokenAuthentication, SessionAuthentication)

    serializer_class = OpinionSerializer
    lookup_field = 'id'

    def check_permissions(self, request):
       
        for permission in self.get_permissions():
            if not permission.has_permission(request, self):
                self.permission_denied(request)

        if self.request.user.is_staff:
            self.permission_denied(request)

            
    def get_queryset(self):
        return Opinion.objects.filter(brand__user_profile = self.request.user)

    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
        except Exception:
            return JsonResponse({'error': "This opinion doesn't exists!"}, status=500)
        else:
            if not instance.is_pinned:
                return JsonResponse({'error': "This opinion is not pinned!"}, status=500)
            else:
                instance.is_pinned = False
                instance.save()
                return JsonResponse({'message':'The opinion has been unpinned successfuly'}, status=201)
    

    

