from django.urls import path
from .views import (
    CampaignListCreateView, MyPledgesView, CampaignDetailView,
    CampaignPledgeView, CampaignSettleView, ProofSubmissionView,
    AdminPendingCampaignsView, AdminRejectedCampaignsView,
    AdminApproveCampaignView, AdminRejectCampaignView
)

urlpatterns = [
    path('', CampaignListCreateView.as_view(), name='campaign_list_create'),
    path('my-pledges/', MyPledgesView.as_view(), name='my_pledges'),
    path('<str:slug_or_id>/', CampaignDetailView.as_view(), name='campaign_detail'),
    path('<str:pk>/pledge/', CampaignPledgeView.as_view(), name='campaign_pledge'),
    path('<str:pk>/settle/', CampaignSettleView.as_view(), name='campaign_settle'),
    path('<str:pk>/proof/', ProofSubmissionView.as_view(), name='proof_submission'),
]
