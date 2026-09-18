from django.urls import path
from .views import GenerateDescriptionView, SuggestPriceView, RecommendationsView

urlpatterns = [
    path('generate-description/', GenerateDescriptionView.as_view(), name='generate_description'),
    path('suggest-price/', SuggestPriceView.as_view(), name='suggest_price'),
    path('recommendations/', RecommendationsView.as_view(), name='recommendations'),
]
