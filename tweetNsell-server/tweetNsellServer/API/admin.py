from django.contrib import admin
from .models import ServiceIndustry, Administrator, Brand, Opinion, Customer, Follower



admin.site.register(ServiceIndustry)
admin.site.register(Administrator)
admin.site.register(Brand)
admin.site.register(Customer)
admin.site.register(Opinion)
admin.site.register(Follower)