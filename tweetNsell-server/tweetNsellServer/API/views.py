from tweetNsellServer.API.serializers import *
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from django.http import FileResponse, HttpResponse
from rest_framework import generics
from .models import ServiceIndustry, Administrator, Brand, Opinion
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

    
    response = make_twitter_request(twitter_api.users.show, screen_name=username, include_entities=True)

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
            service_industry_object = ServiceIndustry.objects.filter(name_en='Unspecified').first()
        else:
            if (ServiceIndustry.objects.filter(name_en=service_industry).exists()):
                service_industry_object = ServiceIndustry.objects.filter(name_en=service_industry).first()
            else:
                service_industry_object = ServiceIndustry.objects.filter(name_en='Unspecified').first()

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
