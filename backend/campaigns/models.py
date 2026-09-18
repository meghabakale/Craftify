from django.db import models
from django.conf import settings
from django.utils.text import slugify

class CampaignStatus(models.TextChoices):
    IN_PROGRESS = 'in_progress', 'In Progress'
    FUNDED = 'funded', 'Funded'
    FAILED = 'failed', 'Failed'
    PENDING_REVIEW = 'pending_review', 'Pending Review'
    REJECTED = 'rejected', 'Rejected'

class Campaign(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    artisan = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='campaigns')
    craft_type = models.CharField(max_length=255, default='Traditional Craft')
    region_state = models.CharField(max_length=255, default='India')
    description = models.TextField()
    funding_goal = models.DecimalField(max_digits=12, decimal_places=2, default=100000.00)
    amount_raised = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    backers_count = models.IntegerField(default=0)
    days_left = models.IntegerField(default=30)
    status = models.CharField(max_length=30, choices=CampaignStatus.choices, default=CampaignStatus.IN_PROGRESS)
    image = models.CharField(max_length=500, default='/images/products/jaipur-blue-pottery-tea-set.jpg')
    gallery_images = models.JSONField(default=list, blank=True)
    is_approved = models.BooleanField(default=True)
    rejection_reason = models.TextField(blank=True, null=True)
    rejected_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title) or 'campaign'
            slug = base_slug
            counter = 1
            while Campaign.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def settle_pledges(self, outcome):
        """Delayed-charge model for campaign pledges: charge only on goal met"""
        if outcome == 'funded':
            self.status = CampaignStatus.FUNDED
            self.pledges.filter(status='authorized').update(status='captured')
        elif outcome == 'failed':
            self.status = CampaignStatus.FAILED
            self.pledges.filter(status='authorized').update(status='released')
        elif outcome == 'reset':
            self.status = CampaignStatus.IN_PROGRESS
            self.pledges.filter(status__in=['captured', 'released']).update(status='authorized')
        self.save()

    def __str__(self):
        return self.title

class RewardTier(models.Model):
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='reward_tiers')
    title = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=1200.00)
    description = models.TextField()
    estimated_delivery = models.CharField(max_length=100, default='Nov 2026')
    items_included = models.JSONField(default=list, blank=True)
    backers_count = models.IntegerField(default=0)
    max_backers = models.IntegerField(blank=True, null=True)

    def __str__(self):
        return f"{self.title} - ₹{self.amount} ({self.campaign.title})"

class PledgeStatus(models.TextChoices):
    AUTHORIZED = 'authorized', 'Authorized (Pre-auth Escrow)'
    AUTHORIZED_PENDING = 'authorized_pending', 'Authorized Pending'
    CAPTURED = 'captured', 'Captured (Goal Met)'
    RELEASED = 'released', 'Released (Goal Failed)'
    CANCELLED = 'cancelled', 'Cancelled'

class Pledge(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='pledges')
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='pledges')
    tier_title = models.CharField(max_length=255, default='Heritage Patron Supporter')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=30, choices=PledgeStatus.choices, default=PledgeStatus.AUTHORIZED)
    backer_name = models.CharField(max_length=255, default='Conscious Patron')
    created_at = models.DateTimeField(auto_now_add=True)
    estimated_delivery = models.CharField(max_length=100, default='Dec 2026')
    settlement_date = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Pledge ₹{self.amount} by {self.backer_name} for {self.campaign.title}"

class ProofSubmission(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Verification'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
    ]
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='proof_submissions')
    phase_title = models.CharField(max_length=255)
    description = models.TextField()
    photo = models.CharField(max_length=500, blank=True, null=True)
    gps_latitude = models.FloatField(blank=True, null=True)
    gps_longitude = models.FloatField(blank=True, null=True)
    has_exif_gps = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    submitted_at = models.DateTimeField(auto_now_add=True)

    def verify_exif(self):
        """Mandatory GPS EXIF check on proof submissions (reject if missing)"""
        if not self.has_exif_gps or self.gps_latitude is None or self.gps_longitude is None:
            self.status = 'rejected'
            self.save()
            return False, "Proof submission rejected: Mandatory GPS EXIF metadata missing."
        self.status = 'verified'
        self.save()
        return True, "Proof submission verified with GPS EXIF metadata."

    def __str__(self):
        return f"Proof for {self.campaign.title}: {self.phase_title} ({self.status})"
