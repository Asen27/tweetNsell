from tweetNsellServer.API.serializers import *
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from django.http import FileResponse, HttpResponse
from rest_framework.generics import ListAPIView, DestroyAPIView, UpdateAPIView
from .models import ServiceIndustry, Administrator, Brand, Customer, Opinion, Follower
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from googletrans import Translator
from django.db.models import Func, F, IntegerField, Sum
from django.db.models.expressions import Value
from django.db.models.functions import Cast
from django.http.response import JsonResponse
#from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from dateutil import parser
from datetime import datetime, timezone
from scholarmetrics import hindex
from math import floor, log10, pow
from django.contrib.auth.hashers import make_password
from urllib.error import URLError
from http.client import BadStatusLine
import re
import twitter
import os
import html
import time
import sys
import emoji
import regex


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
    def handle_twitter_http_error(e, wait_period=2, sleep_when_rate_limited=False):

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

    if response['protected'] == True:
        return None


    brand_info['id'] = response['id_str']
    brand_info['username'] = username
    brand_info['name'] = html.unescape(response['name'])
    brand_info['location'] = html.unescape(response['location'])
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


    try:
        has_links_in_description = len(response['entities']['description']['urls']) > 0
    except Exception:
        brand_info['description'] = html.unescape(response['description'])
    else:
        if has_links_in_description:
            description = html.unescape(response['description'])
            for link in response['entities']['description']['urls']:
                description = description.replace(link['url'], link['display_url'])
            brand_info['description'] = description
        else:
            brand_info['description'] = html.unescape(response['description'])

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


def text_preprocessor(opinion, in_spanish):
    opinion_without_whitespaces = opinion.strip()
    opinion_without_mentions = re.sub(r'@\S+', '', opinion_without_whitespaces)
    opinion_without_hashtags = opinion_without_mentions.replace("#", "")


    emoji_list = []
    emojis = regex.findall(r'\X', opinion_without_hashtags)


    for element in emojis:
        if any(char in emoji.UNICODE_EMOJI for char in element):
            emoji_list.append(element)

    if len(emoji_list) > 0:
        acceptable_characters = "abcdefghigklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789áéíóúÁÉÍÓÚñÑ.,¿?¡!;:-()+='$%&<>€/"
        opinion_without_emojis = ''.join([char if char in acceptable_characters else " " for char in list(opinion_without_hashtags)])
    else:
        opinion_without_emojis = opinion_without_hashtags

    if in_spanish:
        opinion_to_lowercase = opinion_without_emojis.lower()
        return opinion_to_lowercase, emoji_list
    else:
        return opinion_without_emojis, emoji_list


def translate_opinion(opinion, emoji_list, in_spanish):
    if in_spanish:
        translator = Translator()
        try:
            translated_opinion = translator.translate(opinion, src='es', dest='en')
        except Exception:
            return None
        else:
            opinion = translated_opinion.text

    if len(emoji_list) > 0:
            for elem in emoji_list:
                opinion += " " + elem

    return opinion



def sentiment_analyzer(opinion):

    analyzer = SentimentIntensityAnalyzer()
    score = analyzer.polarity_scores(opinion)
    compound = float(score['compound'])
    if compound > 0.3:
        attitude = 'pos'
    elif compound < -0.3:
        attitude = 'neg'
    else:
        attitude = 'neu'
    return attitude



def calculate_influence(k, k_tweet_publication_moment, k_retweets, number_followers):
        if k == 0:
            return 0.00
        else:
            now = datetime.now(timezone.utc)
            delta = now - k_tweet_publication_moment
            days_since_k_tweet = delta.days
            if days_since_k_tweet == 0:
                days_since_k_tweet += 1
            tweets_creation_rate = k / days_since_k_tweet
            h_index = hindex(k_retweets)
            if number_followers > 0:
                oom_number_followers = floor(log10(number_followers))
            else:
                oom_number_followers = 0

            return tweets_creation_rate  * pow(h_index, 2) * oom_number_followers


def backendWakeUp(request):
    return JsonResponse({'message':'Waking up backend'}, status=200)


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
            return JsonResponse({'error':'Missing credentials!'}, status=400)


        length_error = len(password) < 8
        digit_error = re.search(r"\d", password) is None
        uppercase_error = re.search(r"[A-Z]", password) is None
        lowercase_error = re.search(r"[a-z]", password) is None
        symbol_error = re.search(r"[ !#$%&'()*+,-./[\\\]^_`{|}~<>"+r'"]', password) is None
        is_password_invalid = length_error or digit_error or uppercase_error or lowercase_error or symbol_error
        if is_password_invalid:
            return JsonResponse({'error':'Invalid password!'}, status=452)

        if password != confirm_password:
            return JsonResponse({'error': 'Passwords do not match!'}, status=453)


        twitter_api = oauth_login()
        brand_info = get_brand_profile(twitter_api, username)

        if brand_info is None:
            return JsonResponse({'error': 'Invalid Twitter account!'}, status=512)


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
            return JsonResponse({'error': 'This brand already exists!'}, status=409)

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
            number_new_opinions = 0,
            service_industry = service_industry_object,
            number_new_followers = 0,
            followers_cursor = '0'
        )

        brand.save()

        return JsonResponse({'message':'Sign up performed successfuly'}, status=201)


class ServiceIndustriesList(ListAPIView):

    serializer_class = ServiceIndustrySerializer

    def get_queryset(self):
        return ServiceIndustry.objects.all().order_by('name_en')


class CreateServiceIndustry(APIView):
    permission_classes = (IsAdminUser, )
    authentication_classes = (TokenAuthentication, SessionAuthentication)

    def post(self, request):

        name_en = request.data.get('name_en')
        name_es = request.data.get('name_es')

        if ServiceIndustry.objects.count() == 15:
            return JsonResponse({'error': "There can't be more than 15 service industries!"}, status=412)


        try:
            service_industry = ServiceIndustry(name_en = name_en, name_es = name_es)
            service_industry.save()

        except Exception:
            return JsonResponse({'error': 'This service industry already exists!'}, status=409)

        else:
            return JsonResponse({'message':'Service industry created successfuly'}, status=201)


class DeleteServiceIndustry(DestroyAPIView):
    permission_classes = (IsAdminUser, )
    authentication_classes = (TokenAuthentication, SessionAuthentication)

    serializer_class = ServiceIndustrySerializer
    lookup_field = 'name_en'


    def get_queryset(self):
        queryset = ServiceIndustry.objects.all()
        return queryset

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
        except Exception:
            return JsonResponse({'error': "This service industry doesn't exists!"}, status=404)
        else:
            if instance.name_en == 'Unspecified':
                return JsonResponse({'error': "The default service industry can't be deleted!"}, status=412)
            else:
                self.perform_destroy(instance)
                return JsonResponse({'message':'The service industry has been deleted successfuly'}, status=200)


class BrandsList(ListAPIView):

    permission_classes = (IsAdminUser, )
    authentication_classes = (TokenAuthentication, SessionAuthentication)

    serializer_class = BrandSerializer

    def get_queryset(self):
        return Brand.objects.order_by('user_profile__username')


class DeleteBrand(DestroyAPIView):
    permission_classes = (IsAdminUser, )
    authentication_classes = (TokenAuthentication, SessionAuthentication)

    serializer_class = UserSerializer
    lookup_field = 'username'

    def get_queryset(self):
            return User.objects.all()

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
        except Exception:
            return JsonResponse({'error': "This brand doesn't exists!"}, status=404)
        else:
            brand = Brand.objects.get(pk=instance)
            Opinion.objects.filter(brand = brand).delete()
            Customer.objects.filter(opinion__isnull = True).distinct().delete()
            brand.delete()
            Follower.objects.filter(brands = None).delete()
            self.perform_destroy(instance)
            return JsonResponse({'message':'The brand has been deleted successfuly'}, status=202)



class LoadOpinions(APIView):
    permission_classes = (IsAuthenticated, )
    authentication_classes = (TokenAuthentication, SessionAuthentication)

    def search_for_opinions(self, twitter_api, username, language, last_tweet_id, max_id):

        q = '@%s -filter:retweets AND filter:safe' % username

        update_latest_tweet = False
        if max_id is '0':
            print("Update since_id")
            try:
                search_request = make_twitter_request(twitter_api.search.tweets, q=q, lang=language, count=50, tweet_mode='extended', include_entities=True, since_id=last_tweet_id)
            except Exception:
                return None, None, None
            else:
                if search_request is None:
                    return None, None, None
                else:
                    opinions = search_request['statuses']
                    if len(opinions) > 0:
                        update_latest_tweet = True

        else:
            try:
                search_request = make_twitter_request(twitter_api.search.tweets, q=q, lang=language, count=51, tweet_mode='extended', include_entities=True, max_id=max_id)
            except Exception:
                return None, None, None
            else:
                if search_request is None:
                    return None, None, None
                else:
                    opinions = search_request['statuses'][1:]



        if len(opinions) == 50:
            max_id = opinions[-1]['id_str']
            print("From:" + opinions[0]['full_text'])
            print("To:" + opinions[-1]['full_text'])

        else:
            print('The one week limit has been reached!')

            print(len(opinions))
            max_id = '0'


        return opinions, update_latest_tweet, max_id

    def post(self, request):

        brand = get_user_by_token(request)

        if not (isinstance(brand, Brand)):
            return JsonResponse({'error':'Only brands can search for opinions!'}, status=403)

        twitter_api = oauth_login()

        language = brand.language

        try:
            last_tweet = Opinion.objects.filter(brand = brand, is_latest = True)[:1].get()
            last_tweet_id = last_tweet.id
        except Opinion.DoesNotExist:
            last_tweet = None
            last_tweet_id = None


        cursor = brand.opinions_cursor

        opinions, update_latest_tweet, max_id = self.search_for_opinions(twitter_api, brand.user_profile.username, language, last_tweet_id=last_tweet_id, max_id=cursor)

        if opinions is None or max_id is None:
            return JsonResponse({'error':'A problem occurred while searching the opinions!'}, status=429)

        count = 0
        num_results = 0
        is_first = update_latest_tweet
        for opinion in opinions:
            if (opinion['lang'] == brand.language and len(opinion['entities']['user_mentions']) == 1 and len(opinion['entities']['urls']) == 0):
                count += 1
                id = opinion['id_str']
                text = html.unescape(opinion['full_text'])
                text = re.sub(r'https?:\/\/.*[\r\n]*', ' ', text, flags=re.MULTILINE)
                language = opinion['lang']
                attitude = 'unc'
                if language == 'en':
                    preprocessed_text, emoji_list = text_preprocessor(text, False)
                    preprocessed_text = translate_opinion(preprocessed_text, emoji_list, False)
                else:
                    preprocessed_text, emoji_list = text_preprocessor(text, True)
                    preprocessed_text = translate_opinion(preprocessed_text, emoji_list, True)
                    if preprocessed_text is None:
                        brand.opinions_cursor = max_id
                        brand.number_new_opinions += num_results
                        brand.save()
                        return JsonResponse({'error':'A problem occurred while searching the opinions!'}, status=430)

                publication_moment = parser.parse(opinion['created_at'])
                number_favorites = opinion['favorite_count']
                number_retweets = opinion['retweet_count']
                author_id = opinion['user']['id_str']
                author_name = html.unescape(opinion['user']['name'])
                author_screen_name = opinion['user']['screen_name']
                try:
                    author_url = opinion['user']['entities']['url']['urls'][0]['display_url']
                except Exception:
                    author_url = ''
                author_number_followers = opinion['user']['followers_count']
                if is_first:
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
                        print('ERROR!')
                        author = Customer(
                        id = '7857353745384753875',
                        screen_name = "fictitiousCustomer",
                        name = "Fictitious Customer",
                        url = '',
                        number_followers = 0)
                        author.save()

                try:
                    new_opinion = Opinion.objects.create(
                    id = id,
                    text = text,
                    language = language,
                    preprocessed_text = preprocessed_text,
                    publication_moment = publication_moment,
                    number_favorites = number_favorites,
                    number_retweets = number_retweets,
                    is_latest = is_latest,
                    is_pinned = False,
                    attitude = 'unc',
                    brand = brand,
                    author = author
                    )

                except Exception as e:
                    print("Already exists!")
                    max_id = '0'
                    continue

                else:
                    num_results += 1
                    if is_latest is True and last_tweet is not None:
                        last_tweet.is_latest = False
                        last_tweet.save()

        print("Count" + str(count))
        brand.opinions_cursor = max_id
        brand.save()
        if num_results == 0:
            return JsonResponse({'message':'There are no new tweets', 'status': 200}, status=200)
        else:
            brand.number_new_opinions += num_results
            brand.save()
            return JsonResponse({'message':'Tweets loaded successfuly', 'status': 201, 'number_results': num_results}, status=201)



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
        return Opinion.objects.filter(brand__user_profile = self.request.user, is_pinned = True).order_by('-publication_moment')

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
            return JsonResponse({'error': "This opinion doesn't exists!"}, status=404)
        else:
            if instance.is_pinned:
                return JsonResponse({'error': "This opinion is already pinned!"}, status=409)
            else:
                instance.is_pinned = True
                instance.save()
                return JsonResponse({'message':'The opinion has been pinned successfuly'}, status=202)


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
            return JsonResponse({'error': "This opinion doesn't exists!"}, status=404)
        else:
            if not instance.is_pinned:
                return JsonResponse({'error': "This opinion is not pinned!"}, status=409)
            else:
                instance.is_pinned = False
                instance.save()
                return JsonResponse({'message':'The opinion has been unpinned successfuly'}, status=202)


class EvaluateOpinion(UpdateAPIView):
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
            return JsonResponse({'error': "This opinion doesn't exists!"}, status=404)
        else:
            if not instance.attitude == 'unc':
                return JsonResponse({'error': "This opinion has been evaluated already!"}, status=409)
            else:
                opinion = instance.preprocessed_text
                attitude = sentiment_analyzer(opinion)
                brand = instance.brand
                instance.attitude = attitude
                brand.number_new_opinions -= 1
                instance.save()
                if attitude == 'pos':
                    brand.social_rating['positive'] += 1
                elif attitude == 'neu':
                    brand.social_rating['neutral'] += 1
                else:
                    brand.social_rating['negative'] += 1
                brand.save()

                return JsonResponse({'message':'The opinion has been evaluated successfuly'}, status=202)


class EvaluateAllOpinions(APIView):
    permission_classes = (IsAuthenticated, )
    authentication_classes = (TokenAuthentication, SessionAuthentication)

    def post(self, request):

        brand = get_user_by_token(request)

        if not (isinstance(brand, Brand)):
            return JsonResponse({'error':'Only brands can evaluate opinions!'}, status=403)

        opinions = Opinion.objects.filter(brand = brand, attitude = 'unc')

        if len(opinions) == 0:
            return JsonResponse({'error':'There are no unevaluated opinions!'}, status=404)
        else:
            num_evaluated_opinions = 0
            for opinion in opinions:
                try:
                    attitude = sentiment_analyzer(opinion.preprocessed_text)
                    opinion.attitude = attitude
                    opinion.save()
                except Exception:
                    continue
                else:
                    if attitude == 'pos':
                        brand.social_rating['positive'] += 1
                    elif attitude == 'neu':
                        brand.social_rating['neutral'] += 1
                    else:
                        brand.social_rating['negative'] += 1
                    num_evaluated_opinions +=1

            brand.number_new_opinions -= num_evaluated_opinions
            brand.save()

            return JsonResponse({'message':'Opinions evaluated successfuly', 'number_results': num_evaluated_opinions}, status=201)


class DeleteOpinion(DestroyAPIView):
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

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
        except Exception:
            return JsonResponse({'error': "This opinion doesn't exists!"}, status=404)
        else:
            brand = instance.brand
            if instance.attitude != 'unc':
                if instance.attitude == 'pos':
                    brand.social_rating['positive'] -= 1
                elif instance.attitude == 'neu':
                    brand.social_rating['neutral'] -= 1
                else:
                    brand.social_rating['negative'] -= 1
                brand.save()

            else:
                brand.number_new_opinions -= 1
                brand.save()

            if instance.is_latest:
                try:
                    new_latest_tweet = Opinion.objects.filter(brand = brand, is_latest = False).order_by('-publication_moment')[:1].get()
                except Opinion.DoesNotExist:
                    pass
                else:
                    new_latest_tweet.is_latest = True
                    new_latest_tweet.save()

            author_id = instance.author.id
            self.perform_destroy(instance)
            are_there_other_opinions_same_author = Opinion.objects.filter(author__id = author_id).exists()
            if not are_there_other_opinions_same_author:
                Customer.objects.filter(pk = author_id).delete()

            return JsonResponse({'message':'The opinion has been deleted successfuly'}, status=202)




class LoadFollowers(APIView):
    permission_classes = (IsAuthenticated, )
    authentication_classes = (TokenAuthentication, SessionAuthentication)


    def get_followers(self, twitter_api, user_id, cursor = None, limit = 500):

        assert (user_id != None), \
        "user_id argument is obligatory!"

        if cursor is None or cursor == '0':
            cursor = -1

        try:
            followers_ids = make_twitter_request(twitter_api.followers.ids, user_id = user_id, count = limit, cursor = cursor, stringify_ids = True)
        except Exception:
            return None, None

        else:
            if followers_ids is None:
                return None, None
            else:
                followers_ids_as_list = followers_ids['ids']
                print(len(followers_ids_as_list))
                print(followers_ids['next_cursor_str'])
                followers = []
                followers_ids_grouped = [followers_ids_as_list[x:x+100] for x in range(0, len(followers_ids_as_list), 100)]

                for element in followers_ids_grouped:
                    users_ids = ','.join(element)
                    try:
                        follower = make_twitter_request(twitter_api.users.lookup, user_id = users_ids, include_entities = True)
                    except Exception as e:
                        print(str(e))
                        continue
                    else:
                        if follower is None:
                            continue
                        else:
                            followers.extend(follower)

                print(len(followers))
                followers.sort(key=lambda k: k['followers_count'], reverse=True)

                if len(followers) > 50:
                    return followers_ids['next_cursor_str'] ,followers[:50]
                else:
                    return followers_ids['next_cursor_str'], followers




    def check_latest_activity(self, twitter_api, user_id):

        assert (user_id != None), \
        "user_id argument is obligatory!"

        kw = {
            'user_id': user_id,
            'count': 200,
            'trim_user': 'true',
            'exclude_replies': 'true',
            'include_rts' : 'false',
            }

        try:
            tweets = make_twitter_request(twitter_api.statuses.user_timeline, **kw)

        except Exception:
            return None, None, None

        else:
            if tweets is None:
                return None, None, None
            else:
                number_tweets = len(tweets)

                number_retweets = []

                for tweet in tweets:
                    number_retweets.append(tweet['retweet_count'])

                if number_tweets == 0:
                    publication_moment = "Wed Oct 10 20:19:24 +0000 2018"
                else:
                    publication_moment = tweets[-1]['created_at']


                return number_tweets, number_retweets, publication_moment

    def post(self, request):

        brand = get_user_by_token(request)

        if not (isinstance(brand, Brand)):
            return JsonResponse({'error':'Only brands can search for influencers!'}, status=403)

        twitter_api = oauth_login()


        if brand.followers_cursor is '0':
            cursor = None
        else:
            cursor = brand.followers_cursor


        next_cursor, followers = self.get_followers(twitter_api, brand.id, cursor)


        if followers is None or next_cursor is None:
            return JsonResponse({'error':'A problem occurred while loading the followers!'}, status=512)

        number_results = 0
        followers_to_evaluate = 0;
        for follower in followers:
            if follower['protected'] == False :
                id = follower['id_str']
                create_new = False
                try:
                    existing_follower = Follower.objects.get(pk = id)

                except Follower.DoesNotExist:
                    create_new = True

                else:
                    if brand.follower_set.filter(pk=existing_follower.pk).exists():
                        continue

                    else:

                        existing_follower.brands.add(brand)
                        #existing_follower.save()
                        number_results += 1
                        if (existing_follower.influence is None):
                            followers_to_evaluate += 1
                        continue


                if create_new is True:

                    screen_name = follower['screen_name']
                    name = html.unescape(follower['name'])
                    location = html.unescape(follower['location'])
                    is_verified = follower['verified']
                    number_followers = follower['followers_count']
                    number_tweets = follower['statuses_count']

                    try:
                        url = follower['entities']['url']['urls'][0]['display_url']

                    except Exception:
                        url = ''


                    try:
                        has_links_in_description = len(follower['entities']['description']['urls']) > 0

                    except Exception:
                        description = html.unescape(follower['description'])

                    else:
                        description = html.unescape(follower['description'])
                        if has_links_in_description:
                            for link in follower['entities']['description']['urls']:
                                description = description.replace(link['url'], link['display_url'])


                    k, k_retweets, k_tweet_publication_moment = self.check_latest_activity(twitter_api, id)

                    if (k is None or k_retweets is None or k_tweet_publication_moment is None):
                        print("Error!")
                        continue
                    else:

                        try:

                            new_follower = Follower(
                            id = id,
                            screen_name = screen_name,
                            name = name,
                            url = url,
                            location = location,
                            description = description,
                            is_verified = is_verified,
                            number_followers = number_followers,
                            number_tweets = number_tweets,
                            k = k,
                            k_retweets = k_retweets,
                            k_tweet_publication_moment = parser.parse(k_tweet_publication_moment)
                            )
                            new_follower.save()



                        except Exception as e:
                            print(str(e))
                            continue


                        else:
                            number_results += 1
                            followers_to_evaluate += 1
                            new_follower.brands.add(brand)


        print(number_results)
        brand.followers_cursor = next_cursor
        brand.number_new_followers += followers_to_evaluate
        brand.save()
        if number_results == 0:
            return JsonResponse({'message':'There are no new followers', 'status':200}, status=200)
        else:
            return JsonResponse({'message':'Followers loaded successfuly', 'status':201, 'number_results' : number_results}, status=201)



class AllFollowersList(ListAPIView):

    permission_classes = (IsAuthenticated, )
    authentication_classes = (TokenAuthentication, SessionAuthentication)

    serializer_class = FollowerSerializer

    def check_permissions(self, request):

        for permission in self.get_permissions():
            if not permission.has_permission(request, self):
                self.permission_denied(request)

        if self.request.user.is_staff:
            self.permission_denied(request)

    def get_queryset(self):
        brand = Brand.objects.get(pk = self.request.user)
        return  brand.follower_set.all().order_by('screen_name')


class NewFollowersList(ListAPIView):

    permission_classes = (IsAuthenticated, )
    authentication_classes = (TokenAuthentication, SessionAuthentication)

    serializer_class = FollowerSerializer

    def check_permissions(self, request):

        for permission in self.get_permissions():
            if not permission.has_permission(request, self):
                self.permission_denied(request)

        if self.request.user.is_staff:
            self.permission_denied(request)

    def get_queryset(self):
        brand = Brand.objects.get(pk = self.request.user)
        return  brand.follower_set.all().exclude(influence__isnull = False).order_by('screen_name')

class EvaluatedFollowersList(ListAPIView):

    permission_classes = (IsAuthenticated, )
    authentication_classes = (TokenAuthentication, SessionAuthentication)

    serializer_class = FollowerSerializer

    def check_permissions(self, request):

        for permission in self.get_permissions():
            if not permission.has_permission(request, self):
                self.permission_denied(request)

        if self.request.user.is_staff:
            self.permission_denied(request)

    def get_queryset(self):
        brand = Brand.objects.get(pk = self.request.user)
        return  brand.follower_set.all().exclude(influence__isnull = True).order_by('screen_name')


class InfluencersList(ListAPIView):

    permission_classes = (IsAuthenticated, )
    authentication_classes = (TokenAuthentication, SessionAuthentication)

    serializer_class = FollowerSerializer

    def check_permissions(self, request):

        for permission in self.get_permissions():
            if not permission.has_permission(request, self):
                self.permission_denied(request)

        if self.request.user.is_staff:
            self.permission_denied(request)

    def get_queryset(self):
        brand = Brand.objects.get(pk = self.request.user)
        return  brand.follower_set.all().exclude(influence__isnull = True).order_by('-influence')[:10]



class EvaluateFollower(UpdateAPIView):
    permission_classes = (IsAuthenticated, )
    authentication_classes = (TokenAuthentication, SessionAuthentication)

    serializer_class = FollowerSerializer
    lookup_field = 'id'

    def check_permissions(self, request):

        for permission in self.get_permissions():
            if not permission.has_permission(request, self):
                self.permission_denied(request)

        if self.request.user.is_staff:
            self.permission_denied(request)

    def get_queryset(self):
        brand = Brand.objects.get(pk = self.request.user)
        return  brand.follower_set.all()

    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
        except Exception:
            return JsonResponse({'error': "This follower doesn't exists!"}, status=404)
        else:
            if not instance.influence is None:
                return JsonResponse({'error': "This follower already has influence!"}, status=409)
            else:
                try:
                    influence = calculate_influence(instance.k, instance.k_tweet_publication_moment, instance.k_retweets, instance.number_followers)

                except Exception as e:
                    print(str(e))
                    return JsonResponse({'error': "An unexpected error occurred while calculating the influence!"}, status=512)

                else:
                    instance.influence = influence
                    instance.save()
                    for brand in instance.brands.all():
                        brand.number_new_followers -= 1
                        brand.save()

                    return JsonResponse({'message':'The influence of the follower has been calculated successfuly'}, status=200)

class EvaluateAllFollowers(APIView):
    permission_classes = (IsAuthenticated, )
    authentication_classes = (TokenAuthentication, SessionAuthentication)

    def post(self, request):

        brand = get_user_by_token(request)

        if not (isinstance(brand, Brand)):
            return JsonResponse({'error':'Only brands can calculate the influence of their followers!'}, status=403)

        followers = brand.follower_set.all().exclude(influence__isnull = False)


        if len(followers) == 0:
            return JsonResponse({'error':'There are not any unevaluated followers!'}, status=404)
        else:
            for follower in followers:
                if (follower.influence is not None):
                        continue
                else:
                    try:
                        influence = calculate_influence(follower.k, follower.k_tweet_publication_moment, follower.k_retweets, follower.number_followers)
                    except Exception as e:
                        print(str(e))
                        return JsonResponse({'error': "An unexpected error occurred while calculating the influence!"}, status=512)

                    else:
                        follower.influence = influence
                        follower.save()

                        for elem in follower.brands.all():
                            elem.number_new_followers -= 1
                            elem.save()


            return JsonResponse({'message':'Influence calculated successfuly', 'number_results': len(followers)}, status=200)


class DeleteFollower(DestroyAPIView):
    permission_classes = (IsAuthenticated, )
    authentication_classes = (TokenAuthentication, SessionAuthentication)

    serializer_class = FollowerSerializer
    lookup_field = 'id'


    def check_permissions(self, request):

        for permission in self.get_permissions():
            if not permission.has_permission(request, self):
                self.permission_denied(request)

        if self.request.user.is_staff:
            self.permission_denied(request)


    def get_queryset(self):
        brand = Brand.objects.get(pk = self.request.user)
        return  brand.follower_set.all()


    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
        except Exception:
            return JsonResponse({'error': "This follower doesn't exists!"}, status=404)
        else:
            brand = Brand.objects.get(pk = self.request.user)
            if instance.influence is None:
                brand.number_new_followers -= 1
                brand.save()
            instance.brands.remove(brand)
            if instance.brands.all().count() == 0:
                self.perform_destroy(instance)

            return JsonResponse({'message':'The follower has been deleted successfuly'}, status=202)


class UpdateBrand(UpdateAPIView):
    permission_classes = (IsAuthenticated, )
    authentication_classes = (TokenAuthentication, SessionAuthentication)

    serializer_class = BrandSerializer

    def check_permissions(self, request):

        for permission in self.get_permissions():
            if not permission.has_permission(request, self):
                self.permission_denied(request)

        if self.request.user.is_staff:
            self.permission_denied(request)

    def get_queryset(self):
        return Brand.objects.filter(user_profile = self.request.user)

    def get_object(self):

        queryset = self.filter_queryset(self.get_queryset())

        obj = get_object_or_404(queryset)

        self.check_object_permissions(self.request, obj)

        return obj


    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
        except Exception:
            return JsonResponse({'error': "This brand doesn't exists!"}, status=404)
        else:

            twitter_api = oauth_login()
            brand_info = get_brand_profile(twitter_api, instance.user_profile.username)

            if brand_info is None:
                return JsonResponse({'error': 'Invalid Twitter account!'}, status=512)

            else:
                instance.name = brand_info['name']
                instance.location = brand_info['location']
                instance.description = brand_info['description']
                instance.language = brand_info['language']
                instance.url = brand_info['url']
                instance.is_verified = brand_info['is_verified']
                instance.save()

                return JsonResponse({'message':'The brand has been updated successfuly'}, status=201)


class DashboardData(APIView):

    permission_classes = (IsAdminUser, )
    authentication_classes = (TokenAuthentication, SessionAuthentication)

    def post(self, request):
        stats = {}
        positive_opinions = []
        negative_opinions = []
        neutral_opinions = []
        labels = []

        num_positive_opinions = Func(F('social_rating'), Value('positive'), function='jsonb_extract_path_text')
        num_positive_opinions = Cast(num_positive_opinions, IntegerField())

        num_negative_opinions = Func(F('social_rating'), Value('negative'), function='jsonb_extract_path_text')
        num_negative_opinions = Cast(num_negative_opinions, IntegerField())

        best_brands = list(Brand.objects.annotate(total_rating=num_positive_opinions - num_negative_opinions).order_by('-total_rating')[:5])

        for brand in best_brands:
            positive_opinions.append(brand.social_rating['positive'])
            negative_opinions.append(brand.social_rating['negative'])
            neutral_opinions.append(brand.social_rating['neutral'])
            labels.append(brand.user_profile.username)



        stats['positive_opinions'] = positive_opinions
        stats['neutral_opinions'] = neutral_opinions
        stats['negative_opinions'] = negative_opinions

        stats['labels'] = labels


        query_set = Follower.objects.exclude(influence__isnull = True).order_by('-influence')[:10]
        stats['top_influencers'] = FollowerSerializer(query_set, many=True).data

        stats['number_brands'] = Brand.objects.all().count()

        number_opinions = Opinion.objects.all().count()
        if stats['number_brands'] == 0:
            stats['opinions_per_brand'] = 0
        else:
            stats['opinions_per_brand'] = number_opinions / stats['number_brands']

        total_rating = Brand.objects.annotate(total_rating=num_positive_opinions - num_negative_opinions).aggregate(Sum('total_rating')).get('total_rating__sum')
        if stats['number_brands'] == 0:
            stats['total_rating_per_brand'] = 0
        else:
            stats['total_rating_per_brand'] = total_rating / stats['number_brands']

        return JsonResponse(stats, status = 200)
