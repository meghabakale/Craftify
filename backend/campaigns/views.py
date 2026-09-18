from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone

from .models import Campaign, RewardTier, Pledge, ProofSubmission, CampaignStatus
from .serializers import CampaignSerializer, PledgeSerializer, ProofSubmissionSerializer
from accounts.models import User

class CampaignListCreateView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        campaigns = Campaign.objects.filter(is_approved=True).order_by('-created_at')
        serializer = CampaignSerializer(campaigns, many=True)
        return Response({
            'count': len(serializer.data),
            'next': None,
            'previous': None,
            'results': serializer.data
        })

    def post(self, request):
        data = request.data or {}
        user = request.user if request.user.is_authenticated else User.objects.filter(role__in=['artisan', 'admin']).first()
        if not user:
            user = User.objects.first()

        title = data.get('title') or 'New Artisan Campaign'
        goal = float(data.get('funding_goal') or data.get('goal_amount') or 100000)
        desc = data.get('description') or data.get('short_description') or 'Artisan campaign'
        image = data.get('image') or data.get('imageUrl') or '/images/products/jaipur-blue-pottery-tea-set.jpg'
        craft = data.get('craft_type') or data.get('category') or 'Traditional Craft'
        region = data.get('region_state') or 'India'

        campaign = Campaign.objects.create(
            title=title,
            artisan=user,
            description=desc,
            funding_goal=goal,
            craft_type=craft,
            region_state=region,
            image=image,
            gallery_images=[image],
            is_approved=False,
            status=CampaignStatus.PENDING_REVIEW
        )

        # Create default reward tiers
        RewardTier.objects.create(
            campaign=campaign,
            title='Early Patron Supporter',
            amount=round(goal * 0.01) or 1000,
            description='Includes a signed thank-you note from the artisan cluster and digital workshop access.',
            estimated_delivery='Nov 2026',
            items_included=['Artisan Letter', 'Digital Workshop Archives']
        )
        RewardTier.objects.create(
            campaign=campaign,
            title='Collector Masterpiece Tier',
            amount=round(goal * 0.035) or 3500,
            description='Receive an original museum-grade handcrafted piece with GI seal of provenance.',
            estimated_delivery='Dec 2026',
            items_included=['Certified Craft Piece', 'Handmade Packaging', 'Artisan Guild Document']
        )

        serializer = CampaignSerializer(campaign)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class MyPledgesView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if request.user.is_authenticated:
            pledges = Pledge.objects.filter(user=request.user).order_by('-created_at')
        else:
            pledges = Pledge.objects.all().order_by('-created_at')
        serializer = PledgeSerializer(pledges, many=True)
        return Response(serializer.data)

class CampaignDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug_or_id):
        campaign = Campaign.objects.filter(Q(id=slug_or_id) | Q(slug=slug_or_id)).first()
        if not campaign:
            return Response({'detail': 'Campaign not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = CampaignSerializer(campaign)
        data = serializer.data

        # Attach recent pledges, updates, comments
        recent_pledges = Pledge.objects.filter(campaign=campaign).order_by('-created_at')[:10]
        pledge_list = []
        for p in recent_pledges:
            pledge_list.append({
                'id': str(p.id),
                'backer_name': p.backer_name,
                'tier_title': p.tier_title,
                'amount': float(p.amount),
                'created_at': p.created_at.isoformat(),
            })

        data['recent_pledges'] = pledge_list
        data['updates'] = [
            {
                'id': f'up-{campaign.id}-1',
                'title': 'Raw Material Sourcing & Loom Assembly Underway',
                'body': 'We have finalized procurement of all natural organic fibers and timber components directly with our local regional cluster.',
                'created_at': timezone.now().isoformat(),
            }
        ]
        data['comments'] = [
            {
                'id': f'cm-{campaign.id}-1',
                'body': 'Thrilled to support this generational craft cluster. Proud to stand with indigenous Indian artisans.',
                'created_at': timezone.now().isoformat(),
                'user': {'id': 3, 'full_name': 'Eleanor Vance', 'username': 'eleanor_buyer'}
            }
        ]
        return Response(data)

class CampaignPledgeView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk):
        campaign = Campaign.objects.filter(Q(id=pk) | Q(slug=pk)).first()
        if not campaign:
            return Response({'detail': 'Campaign not found'}, status=status.HTTP_404_NOT_FOUND)

        amount = float(request.data.get('amount') or 1200)
        backer_name = request.data.get('backer_name') or (request.user.full_name if request.user.is_authenticated else 'Conscious Patron')
        tier_title = request.data.get('tier_title') or 'Heritage Patron Supporter'

        # Update campaign totals
        campaign.amount_raised = float(campaign.amount_raised) + amount
        campaign.backers_count += 1
        if campaign.amount_raised >= campaign.funding_goal:
            campaign.status = CampaignStatus.FUNDED
        campaign.save()

        user = request.user if request.user.is_authenticated else None

        pledge = Pledge.objects.create(
            user=user,
            campaign=campaign,
            tier_title=tier_title,
            amount=amount,
            status='authorized',
            backer_name=backer_name
        )

        pledge_serializer = PledgeSerializer(pledge)
        campaign_serializer = CampaignSerializer(campaign)

        return Response({
            'status': 'success',
            'message': 'Pledge successfully pre-authorized in escrow.',
            'pledge': pledge_serializer.data,
            'campaign': campaign_serializer.data
        }, status=status.HTTP_201_CREATED)

class CampaignSettleView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk):
        campaign = Campaign.objects.filter(Q(id=pk) | Q(slug=pk)).first()
        if not campaign:
            return Response({'detail': 'Campaign not found'}, status=status.HTTP_404_NOT_FOUND)

        outcome = request.data.get('outcome') or 'funded'
        campaign.settle_pledges(outcome)

        return Response({
            'status': 'success',
            'campaignStatus': campaign.status,
            'daysLeft': campaign.days_left
        })

class ProofSubmissionView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk):
        campaign = Campaign.objects.filter(Q(id=pk) | Q(slug=pk)).first()
        if not campaign:
            return Response({'detail': 'Campaign not found'}, status=status.HTTP_404_NOT_FOUND)

        phase_title = request.data.get('phase_title') or 'Production Milestone'
        description = request.data.get('description') or 'Artisan proof photo submission'
        photo = request.data.get('photo')
        has_exif = request.data.get('has_exif_gps', False)
        lat = request.data.get('gps_latitude')
        lng = request.data.get('gps_longitude')

        proof = ProofSubmission.objects.create(
            campaign=campaign,
            phase_title=phase_title,
            description=description,
            photo=photo,
            gps_latitude=lat,
            gps_longitude=lng,
            has_exif_gps=bool(has_exif and lat is not None and lng is not None)
        )

        # Mandatory GPS EXIF Check
        verified, message = proof.verify_exif()

        return Response({
            'status': 'success' if verified else 'rejected',
            'message': message,
            'proof': ProofSubmissionSerializer(proof).data
        }, status=status.HTTP_200_OK if verified else status.HTTP_400_BAD_REQUEST)

class AdminPendingCampaignsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        pending = Campaign.objects.filter(status=CampaignStatus.PENDING_REVIEW).order_by('-created_at')
        serializer = CampaignSerializer(pending, many=True)
        return Response(serializer.data)

class AdminRejectedCampaignsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        rejected = Campaign.objects.filter(status=CampaignStatus.REJECTED).order_by('-created_at')
        serializer = CampaignSerializer(rejected, many=True)
        return Response(serializer.data)

class AdminApproveCampaignView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk):
        campaign = Campaign.objects.filter(Q(id=pk) | Q(slug=pk)).first()
        if not campaign:
            return Response({'detail': 'Campaign not found'}, status=status.HTTP_404_NOT_FOUND)

        campaign.is_approved = True
        campaign.status = CampaignStatus.IN_PROGRESS
        campaign.rejection_reason = None
        campaign.rejected_at = None
        campaign.save()

        return Response({
            'status': 'success',
            'message': 'Campaign approved and listed on the live public ledger.',
            'campaign': CampaignSerializer(campaign).data
        })

class AdminRejectCampaignView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk):
        campaign = Campaign.objects.filter(Q(id=pk) | Q(slug=pk)).first()
        if not campaign:
            return Response({'detail': 'Campaign not found'}, status=status.HTTP_404_NOT_FOUND)

        reason = request.data.get('reason') or 'Does not satisfy Craftify curation and authenticity standards.'
        campaign.is_approved = False
        campaign.status = CampaignStatus.REJECTED
        campaign.rejection_reason = reason
        campaign.rejected_at = timezone.now()
        campaign.save()

        return Response({
            'status': 'success',
            'message': 'Campaign rejected with feedback recorded.',
            'campaign': CampaignSerializer(campaign).data,
            'rejectionReason': reason
        })
