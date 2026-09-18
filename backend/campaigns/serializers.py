from rest_framework import serializers
from .models import Campaign, RewardTier, Pledge, ProofSubmission

class RewardTierSerializer(serializers.ModelSerializer):
    pledgeAmount = serializers.FloatField(source='amount', read_only=True)
    estimatedDelivery = serializers.CharField(source='estimated_delivery', read_only=True)
    itemsIncluded = serializers.JSONField(source='items_included', read_only=True)
    backersCount = serializers.IntegerField(source='backers_count', read_only=True)
    maxBackers = serializers.IntegerField(source='max_backers', read_only=True)

    class Meta:
        model = RewardTier
        fields = ['id', 'title', 'amount', 'pledgeAmount', 'description', 'estimated_delivery', 'estimatedDelivery', 'items_included', 'itemsIncluded', 'backers_count', 'backersCount', 'max_backers', 'maxBackers']

class CampaignSerializer(serializers.ModelSerializer):
    reward_tiers = RewardTierSerializer(many=True, read_only=True)
    artisan = serializers.SerializerMethodField()
    goalAmount = serializers.FloatField(source='funding_goal', read_only=True)
    fundingGoal = serializers.FloatField(source='funding_goal', read_only=True)
    pledgedAmount = serializers.FloatField(source='amount_raised', read_only=True)
    amountRaised = serializers.FloatField(source='amount_raised', read_only=True)
    backersCount = serializers.IntegerField(source='backers_count', read_only=True)
    daysLeft = serializers.IntegerField(source='days_left', read_only=True)
    imageUrl = serializers.CharField(source='image', read_only=True)
    galleryImages = serializers.JSONField(source='gallery_images', read_only=True)
    isApproved = serializers.BooleanField(source='is_approved', read_only=True)
    rejectionReason = serializers.CharField(source='rejection_reason', read_only=True)

    class Meta:
        model = Campaign
        fields = [
            'id', 'title', 'slug', 'artisan', 'craft_type', 'region_state', 'description',
            'funding_goal', 'goalAmount', 'fundingGoal', 'amount_raised', 'pledgedAmount',
            'amountRaised', 'backers_count', 'backersCount', 'days_left', 'daysLeft', 'status',
            'image', 'imageUrl', 'gallery_images', 'galleryImages', 'is_approved', 'isApproved',
            'rejection_reason', 'rejectionReason', 'reward_tiers', 'created_at'
        ]

    def get_artisan(self, obj):
        return {
            'id': obj.artisan.id,
            'username': obj.artisan.username,
            'full_name': obj.artisan.full_name or obj.artisan.username,
        }

class PledgeSerializer(serializers.ModelSerializer):
    campaignId = serializers.CharField(source='campaign.id', read_only=True)
    campaign_id = serializers.CharField(source='campaign.id', read_only=True)
    campaignTitle = serializers.CharField(source='campaign.title', read_only=True)
    campaign_title = serializers.CharField(source='campaign.title', read_only=True)
    campaignSlug = serializers.CharField(source='campaign.slug', read_only=True)
    campaign_slug = serializers.CharField(source='campaign.slug', read_only=True)
    campaignStatus = serializers.CharField(source='campaign.status', read_only=True)
    campaign_status = serializers.CharField(source='campaign.status', read_only=True)
    campaignImage = serializers.CharField(source='campaign.image', read_only=True)
    campaign_image = serializers.CharField(source='campaign.image', read_only=True)
    tierTitle = serializers.CharField(source='tier_title', read_only=True)
    dateAuthorized = serializers.SerializerMethodField()
    estimatedDelivery = serializers.CharField(source='estimated_delivery', read_only=True)

    class Meta:
        model = Pledge
        fields = [
            'id', 'campaign', 'campaignId', 'campaign_id', 'campaignTitle', 'campaign_title',
            'campaignSlug', 'campaign_slug', 'campaignStatus', 'campaign_status', 'campaignImage',
            'campaign_image', 'tier_title', 'tierTitle', 'amount', 'status', 'backer_name',
            'created_at', 'dateAuthorized', 'estimated_delivery', 'estimatedDelivery', 'settlement_date'
        ]

    def get_dateAuthorized(self, obj):
        return obj.created_at.strftime("%b %d, %Y") if obj.created_at else "Recent"

class ProofSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProofSubmission
        fields = ['id', 'campaign', 'phase_title', 'description', 'photo', 'gps_latitude', 'gps_longitude', 'has_exif_gps', 'status', 'submitted_at']
