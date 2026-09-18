from django.db import models
from django.contrib.auth.models import AbstractUser

class UserRole(models.TextChoices):
    BUYER = 'buyer', 'Buyer'
    ARTISAN = 'artisan', 'Artisan / Creator'
    CREATOR = 'creator', 'Creator'
    BACKER = 'backer', 'Backer'
    SELLER = 'seller', 'Seller'
    VALIDATOR = 'validator', 'Validator'
    ADMIN = 'admin', 'Admin'

class User(AbstractUser):
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.BUYER
    )
    full_name = models.CharField(max_length=255, blank=True, null=True)
    craft_type = models.CharField(max_length=255, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    is_phone_verified = models.BooleanField(default=False)
    otp_code = models.CharField(max_length=6, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    is_suspended = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.full_name:
            if self.first_name or self.last_name:
                self.full_name = f"{self.first_name} {self.last_name}".strip()
            else:
                self.full_name = self.username
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} ({self.role})"

class TrustScore(models.Model):
    RISK_LEVEL_CHOICES = [
        ('low', 'Low Risk'),
        ('medium', 'Medium Risk'),
        ('high', 'High Risk'),
        ('blacklisted', 'Blacklisted'),
    ]
    artisan = models.OneToOneField(User, on_delete=models.CASCADE, related_name='trust_score')
    score = models.IntegerField(default=85) # 0 to 100
    risk_level = models.CharField(max_length=20, choices=RISK_LEVEL_CHOICES, default='low')
    flags_count = models.IntegerField(default=0)
    last_evaluated = models.DateTimeField(auto_now=True)

    def update_risk_status(self):
        if self.score < 30 or self.flags_count >= 3:
            self.risk_level = 'blacklisted'
            self.artisan.is_suspended = True
            self.artisan.save()
        elif self.score < 60:
            self.risk_level = 'high'
        elif self.score < 80:
            self.risk_level = 'medium'
        else:
            self.risk_level = 'low'
        self.save()

    def __str__(self):
        return f"TrustScore for {self.artisan.username}: {self.score} ({self.risk_level})"

class RiskFlag(models.Model):
    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    artisan = models.ForeignKey(User, on_delete=models.CASCADE, related_name='risk_flags')
    reason = models.TextField()
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='medium')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"RiskFlag for {self.artisan.username}: {self.severity}"
