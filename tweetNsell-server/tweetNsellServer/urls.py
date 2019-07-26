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
    path('service-industries/delete/<int:id>/', views.DeleteServiceIndustry.as_view(), name='delete_service_industry'),
    path('opinions/load/', views.LoadOpinions.as_view(), name='load_opinions')
]
