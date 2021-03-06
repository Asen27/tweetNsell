"""tweetNsellServer URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from tweetNsellServer.API import views
from rest_framework.authtoken.views import obtain_auth_token

router = routers.DefaultRouter()

urlpatterns = [
    path('', include(router.urls)),
    path('admin/', admin.site.urls),
    path('login/', obtain_auth_token),
    path('getUserByToken/', views.GetUserView.as_view(),  name='get_user'),
    path('register/', views.RegisterBrand.as_view(), name='register_brand'),
    path('service-industries/create/', views.CreateServiceIndustry.as_view(), name='create_service_industry'),
    path('service-industries/', views.ServiceIndustriesList.as_view(), name='service_industries_list'),
    path('service-industries/delete/<str:name_en>/', views.DeleteServiceIndustry.as_view(), name='delete_service_industry'),
    path('opinions/load/', views.LoadOpinions.as_view(), name='load_opinions'),
    path('opinions/all/', views.AllOpinionsList.as_view(), name='opinions_list_all'),
    path('opinions/new/', views.NewOpinionsList.as_view(), name='opinions_list_new'),
    path('opinions/evaluated/', views.EvaluatedOpinionsList.as_view(), name='opinions_list_evaluated'),
    path('opinions/pinned/', views.PinnedOpinionsList.as_view(), name='opinions_list_pinned'),
    path('opinions/positive/', views.PositiveOpinionsList.as_view(), name='opinions_list_positive'),
    path('opinions/negative/', views.NegativeOpinionsList.as_view(), name='opinions_list_negative'),
    path('opinions/neutral/', views.NeutralOpinionsList.as_view(), name='opinions_list_neutral'),
    path('opinions/pin/<int:id>/', views.PinOpinion.as_view(), name='pin_opinion'),
    path('opinions/unpin/<int:id>/', views.UnpinOpinion.as_view(), name='unpin_opinion'),
    path('opinions/evaluate/<int:id>/', views.EvaluateOpinion.as_view(), name='evaluate_opinion'),
    path('opinions/delete/<int:id>/', views.DeleteOpinion.as_view(), name='delete_opinion'),
    path('opinions/evaluate/all/', views.EvaluateAllOpinions.as_view(), name='evaluate_all_opinions'),
    path('followers/load/', views.LoadFollowers.as_view(), name='load_followers'),
    path('followers/all/', views.AllFollowersList.as_view(), name='followers_list_all'),
    path('followers/new/', views.NewFollowersList.as_view(), name='followers_list_new'),
    path('followers/evaluated/', views.EvaluatedFollowersList.as_view(), name='followers_list_evaluated'),
    path('followers/influencers/', views.InfluencersList.as_view(), name='followers_list_influencers'),
    path('followers/evaluate/<int:id>/', views.EvaluateFollower.as_view(), name='evaluate_follower'),
    path('followers/evaluate/all/', views.EvaluateAllFollowers.as_view(), name='evaluate_all_followers'),
    path('followers/delete/<int:id>/', views.DeleteFollower.as_view(), name='delete_follower'),
    path('brands/', views.BrandsList.as_view(), name='brands_list'),
    path('brands/delete/<str:username>/', views.DeleteBrand.as_view(), name='delete_brand'),
    path('brand/update/', views.UpdateBrand.as_view(), name='update_brand'),
    path('dashboard/', views.DashboardData.as_view(), name='dashboard'),
    path('backend-wakeup/', views.backendWakeUp, name='backend_wakeup')
]
