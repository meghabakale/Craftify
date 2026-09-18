import math
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def calculate_price_suggestion(craft_type, material_cost, hours_spent, region, complexity_level):
    num_mat = max(0.0, float(material_cost or 0.0))
    num_hours = max(0.0, float(hours_spent or 0.0))
    comp_key = str(complexity_level or 'skilled').lower().strip()

    multipliers = {
        'basic': 1.0,
        'skilled': 1.5,
        'master': 2.2,
    }
    region_factors = {
        'Karnataka': 1.0,
        'Maharashtra': 1.1,
        'Delhi': 1.1,
        'Tamil Nadu': 1.0,
    }

    base_hourly_rate = 150.0
    mult = multipliers.get(comp_key, 1.5)
    reg_factor = region_factors.get(str(region).strip(), 1.0)
    effective_rate = base_hourly_rate * mult * reg_factor

    labor_val = num_hours * effective_rate
    base_price = num_mat + labor_val

    min_price = int(round((base_price * 1.3) / 10.0) * 10)
    max_price = int(round((base_price * 1.8) / 10.0) * 10)

    rate_str = str(int(effective_rate)) if effective_rate.is_integer() else f"{effective_rate:.1f}"
    reasoning = f"Based on ₹{num_mat:.0f} in materials, {num_hours:g} hours of {comp_key}-level {craft_type} work at an estimated ₹{rate_str}/hour, plus a standard markup for handmade goods."

    craft_refs = {
        'block_printing': (300, 1500),
        'handloom_weaving': (800, 5000),
        'pottery': (150, 2000),
        'madhubani_painting': (500, 8000),
        'bamboo_craft': (200, 3000),
        'brass_jewellery': (250, 4000),
        'leatherwork': (400, 3500),
        'embroidery': (350, 6000),
    }

    norm = str(craft_type or '').lower().strip().replace('-', '_').replace(' ', '_')
    ref = craft_refs.get(norm, (200, 2000))

    return {
        'price_range_min': min_price,
        'price_range_max': max_price,
        'reasoning': reasoning,
        'market_reference_min': ref[0],
        'market_reference_max': ref[1],
        'market_reference_note': 'Typical retail range for similar handmade items in this category'
    }

def get_tfidf_recommendations(viewed_categories, limit=4):
    """
    TF-IDF Recommendation Engine based on user viewed categories.
    Uses scikit-learn TfidfVectorizer and cosine_similarity.
    """
    from products.models import Product
    from campaigns.models import Campaign

    products = list(Product.objects.all())
    campaigns = list(Campaign.objects.filter(is_approved=True))

    catalog = []
    for p in products:
        catalog.append({
            'id': str(p.id),
            'type': 'product',
            'title': p.name,
            'category': p.category or 'Home & Living',
            'craft': p.craft_heritage_note or '',
            'description': f"{p.name} {p.category} {p.craft_heritage_note} {p.region_state}"
        })
    for c in campaigns:
        catalog.append({
            'id': str(c.id),
            'type': 'campaign',
            'title': c.title,
            'category': c.craft_type or 'Traditional Craft',
            'craft': c.craft_type or '',
            'description': f"{c.title} {c.craft_type} {c.region_state} {c.description}"
        })

    if not catalog:
        return []

    # If no viewed categories provided, return first items
    if not viewed_categories:
        results = []
        for item in catalog[:limit]:
            results.append({
                'id': item['id'],
                'type': item['type'],
                'reason': f"Curated highlight in {item['category']}"
            })
        return results

    query_str = " ".join([str(cat) for cat in viewed_categories])
    corpus = [item['description'] for item in catalog] + [query_str]

    try:
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = vectorizer.fit_transform(corpus)
        query_vec = tfidf_matrix[-1]
        doc_vectors = tfidf_matrix[:-1]

        similarities = cosine_similarity(query_vec, doc_vectors).flatten()
        top_indices = similarities.argsort()[::-1][:limit]

        results = []
        for idx in top_indices:
            item = catalog[idx]
            match_score = float(similarities[idx])
            reason = f"Matches your interest in {item['category']}" if match_score > 0.1 else f"Top trending {item['type']} in {item['category']}"
            results.append({
                'id': item['id'],
                'type': item['type'],
                'reason': reason
            })
        return results
    except Exception:
        # Fallback if corpus text processing is simple
        results = []
        for item in catalog[:limit]:
            results.append({
                'id': item['id'],
                'type': item['type'],
                'reason': f"Recommended for you in {item['category']}"
            })
        return results
