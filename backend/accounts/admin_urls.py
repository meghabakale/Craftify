from django.urls import path
from .views import AdminUserListView, AdminUserSuspendView, AdminUserActivateView, AdminStatsView
from campaigns.views import AdminPendingCampaignsView, AdminRejectedCampaignsView, AdminApproveCampaignView, AdminRejectCampaignView

urlpatterns = [
    path('stats/', AdminStatsView.as_view(), name='admin_stats'),
    path('users/', AdminUserListView.as_view(), name='admin_users'),
    path('users/<int:pk>/suspend/', AdminUserSuspendView.as_view(), name='admin_user_suspend'),
    path('users/<int:pk>/activate/', AdminUserActivateView.as_view(), name='admin_user_activate'),
    path('campaigns/pending/', AdminPendingCampaignsView.as_view(), name='admin_pending_campaigns'),
    path('campaigns/rejected/', AdminRejectedCampaignsView.as_view(), name='admin_rejected_campaigns'),
    path('campaigns/<str:pk>/approve/', AdminApproveCampaignView.as_view(), name='admin_approve_campaign'),
    path('campaigns/<str:pk>/reject/', AdminRejectCampaignView.as_view(), name='admin_reject_campaign'),
]
