from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def api_root(request):
    return JsonResponse({
        "name": "Craftify API Service",
        "status": "online",
        "documentation": "Explore endpoints under /api/auth/, /api/campaigns/, /api/products/, /api/orders/, /api/ai/, /api/admin/",
        "version": "1.0.0"
    })

urlpatterns = [
    path('', api_root, name='api_root'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/campaigns/', include('campaigns.urls')),
    path('api/products/', include('products.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/ai/', include('ai_tools.urls')),
    path('api/admin/', include('accounts.admin_urls')),
]
