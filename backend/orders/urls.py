from django.urls import path
from .views import OrderListCreateView, OrderDetailView, OrderCancelView, OrderConfirmDeliveryView

urlpatterns = [
    path('', OrderListCreateView.as_view(), name='order_list_create'),
    path('<str:pk>/', OrderDetailView.as_view(), name='order_detail'),
    path('<str:pk>/track/', OrderDetailView.as_view(), name='order_track'),
    path('<str:pk>/cancel/', OrderCancelView.as_view(), name='order_cancel'),
    path('<str:pk>/confirm-delivery/', OrderConfirmDeliveryView.as_view(), name='order_confirm_delivery'),
]
