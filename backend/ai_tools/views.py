from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from .services import calculate_price_suggestion, get_tfidf_recommendations

class GenerateDescriptionView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        craft_type = request.data.get('craft_type', '').strip()
        material = request.data.get('material', '').strip()
        region = request.data.get('region', '').strip()
        keywords = request.data.get('keywords', '').strip()
        draft_text = request.data.get('draft_text', '').strip()
        mode = request.data.get('mode', 'full_story')

        if not craft_type or not material or not region:
            return Response({'detail': 'Please provide craft_type, material, and region.'}, status=status.HTTP_400_BAD_REQUEST)

        if draft_text:
            description = (
                f"Handcrafted with meticulous dedication in {region}, this {craft_type} is shaped from authentic {material}. "
                f"{draft_text}. Every single detail is shaped with ancestral reverence, bringing timeless tradition and enduring grace to your collection."
            )
        else:
            description = (
                f"Rooted in the storied heritage of {region}, this handcrafted {craft_type} is sculpted from premium {material}. "
                f"Every contour honors generational artisan wisdom, celebrating authentic Indian handicraft excellence. "
                f"Features signature highlights: {keywords if keywords else 'Pure authentic craftsmanship'}."
            )

        return Response({'description': description})

class SuggestPriceView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        craft_type = request.data.get('craft_type')
        material_cost = request.data.get('material_cost')
        hours_spent = request.data.get('hours_spent')
        region = request.data.get('region', '')
        complexity_level = request.data.get('complexity_level', 'skilled')

        if not craft_type:
            return Response({'craft_type': ['This field is required.']}, status=status.HTTP_400_BAD_REQUEST)
        if material_cost is None or material_cost == '':
            return Response({'material_cost': ['This field is required.']}, status=status.HTTP_400_BAD_REQUEST)
        if hours_spent is None or hours_spent == '':
            return Response({'hours_spent': ['This field is required.']}, status=status.HTTP_400_BAD_REQUEST)

        try:
            mat_num = float(material_cost)
            if mat_num < 0:
                return Response({'material_cost': ['Ensure this value is greater than or equal to 0.']}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError:
            return Response({'material_cost': ['A valid number is required.']}, status=status.HTTP_400_BAD_REQUEST)

        try:
            hrs_num = float(hours_spent)
            if hrs_num < 0:
                return Response({'hours_spent': ['Ensure this value is greater than or equal to 0.']}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError:
            return Response({'hours_spent': ['A valid number is required.']}, status=status.HTTP_400_BAD_REQUEST)

        if str(complexity_level).lower() not in ['basic', 'skilled', 'master']:
            return Response({'complexity_level': [f'"{complexity_level}" is not a valid choice.']}, status=status.HTTP_400_BAD_REQUEST)

        res = calculate_price_suggestion(craft_type, mat_num, hrs_num, region, complexity_level)
        return Response(res)

class RecommendationsView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        viewed_categories = request.data.get('viewed_categories', [])
        limit = int(request.data.get('limit', 4))
        recs = get_tfidf_recommendations(viewed_categories, limit=limit)
        return Response(recs)
