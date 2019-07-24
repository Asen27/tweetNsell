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
#from django.contrib.auth.hashers import make_password
#import re
#import os
#import json
#import time



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
    def post(self, request):
        user = get_user_by_token(request)
        if (isinstance(user, Brand)):
            return Response(BrandSerializer(user, many=False).data)
        else:
            return Response(AdministratorSerializer(user, many=False).data)

