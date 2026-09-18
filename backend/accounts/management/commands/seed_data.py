from django.core.management.base import BaseCommand
from accounts.models import User, TrustScore
from campaigns.models import Campaign, RewardTier, Pledge, CampaignStatus
from products.models import Product, ProductReview
from orders.models import Order, OrderItem, OrderStatusHistory, OrderStatus

class Command(BaseCommand):
    help = 'Seed initial Craftify database with full mock data for campaigns & products'

    def handle(self, *args, **options):
        self.stdout.write("Seeding full Craftify database records...")

        # 1. Users
        admin_user, _ = User.objects.get_or_create(
            username='admin_aisha',
            defaults={
                'email': 'aisha.admin@craftify.gov.in',
                'first_name': 'Aisha',
                'last_name': 'Rao',
                'full_name': 'Aisha Rao (Admin)',
                'role': 'admin',
                'bio': 'Principal Curator & Governance Lead',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        admin_user.set_password('CraftifyPass123!')
        admin_user.save()

        artisan_user, _ = User.objects.get_or_create(
            username='artisan_creator',
            defaults={
                'email': 'marcus@ateliermonolith.design',
                'first_name': 'Marcus',
                'last_name': 'Thorne',
                'full_name': 'Radha Devi & Master Artisans Guild',
                'role': 'artisan',
                'craft_type': 'Handloom, Pottery & Fine Crafts',
                'bio': 'National Award-winning master artisan collective promoting GI-tagged traditional Indian handicrafts.',
                'city': 'Jaipur',
                'state': 'Rajasthan',
                'is_phone_verified': True,
            }
        )
        artisan_user.set_password('CraftifyPass123!')
        artisan_user.save()
        TrustScore.objects.get_or_create(artisan=artisan_user, defaults={'score': 96, 'risk_level': 'low'})

        buyer_user, _ = User.objects.get_or_create(
            username='eleanor_buyer',
            defaults={
                'email': 'e.vance@archivalstudio.io',
                'first_name': 'Eleanor',
                'last_name': 'Vance',
                'full_name': 'Eleanor Vance (Patron)',
                'role': 'buyer',
                'bio': 'Passionate collector of traditional Indian crafts',
            }
        )
        buyer_user.set_password('CraftifyPass123!')
        buyer_user.save()

        # 2. Campaigns Data
        campaigns_data = [
            {
                'id': 1,
                'slug': 'revive-chanderi-handloom-weaving',
                'title': 'Revive Chanderi Handloom Weaving — New Loom + Natural Dyes',
                'craft_type': 'Handloom & Textiles',
                'region_state': 'Madhya Pradesh',
                'description': 'Empowering 12 rural women weavers with heavy teakwood pit-looms, zero-chemical natural indigo vats, and direct patron-to-loom pre-orders.',
                'funding_goal': 250000.00,
                'amount_raised': 315000.00,
                'backers_count': 340,
                'days_left': 14,
                'status': CampaignStatus.IN_PROGRESS,
                'image': '/images/products/chanderi-silk-zari-saree.jpg',
                'tiers': [
                    {
                        'title': 'Natural Indigo Silk Pocket Squares (Set of 2)',
                        'amount': 999.00,
                        'description': 'Set of two gossamer cotton-silk pocket squares hand-dyed in organic forest indigo.',
                        'estimated_delivery': 'Oct 2026',
                        'items_included': ['2x Hand-dyed Chanderi Silk Pocket Squares', 'Artisan Story Card', 'Eco-friendly Muslin Pouch'],
                        'backers_count': 92
                    },
                    {
                        'title': 'Pure Chanderi Cotton-Silk Scarf with Zari Border',
                        'amount': 2499.00,
                        'description': 'Handwoven 2-meter stoles featuring traditional "Ashrafi" butis and gold-toned zari edging.',
                        'estimated_delivery': 'Nov 2026',
                        'items_included': ['1x Handwoven Chanderi Scarf', 'GI Authentication Certificate', 'Handmade Paper Gift Box'],
                        'backers_count': 198
                    },
                    {
                        'title': 'Heirloom Chanderi Handloom Saree with Pure Zari Pallu',
                        'amount': 5800.00,
                        'description': 'Masterwork 6.5m handloom saree taking 24 days to weave.',
                        'estimated_delivery': 'Nov 2026',
                        'items_included': ['1x Heirloom Handloom Saree with Blouse Piece', 'Personalized Calligraphy Dedication'],
                        'backers_count': 50
                    }
                ]
            },
            {
                'id': 2,
                'slug': 'blue-pottery-studio-expansion-jaipur',
                'title': 'Blue Pottery Studio Expansion, Jaipur',
                'craft_type': 'Ceramics & Pottery',
                'region_state': 'Rajasthan',
                'description': 'Constructing energy-efficient gas kilns to train 18 youth artisans and create lead-free, food-safe cobalt blue tableware.',
                'funding_goal': 200000.00,
                'amount_raised': 170000.00,
                'backers_count': 195,
                'days_left': 12,
                'status': CampaignStatus.IN_PROGRESS,
                'image': '/images/products/jaipur-blue-pottery-tea-set.jpg',
                'tiers': [
                    {
                        'title': 'Hand-Painted Blue Pottery Coasters & Incense Holder',
                        'amount': 599.00,
                        'description': 'Set of 4 hand-painted quartz pottery coasters with lotus incense holder.',
                        'estimated_delivery': 'Nov 2026',
                        'items_included': ['4x Floral Blue Pottery Coasters', '1x Lotus Incense Burner'],
                        'backers_count': 88
                    },
                    {
                        'title': 'Set of 2 Cobalt Blue Glazed Decorative Platters',
                        'amount': 1499.00,
                        'description': 'Pair of 8-inch hand-painted dessert platters with floral arabesque motifs.',
                        'estimated_delivery': 'Dec 2026',
                        'items_included': ['2x 8-inch Wall Platters', '2x Wall Brackets'],
                        'backers_count': 85
                    }
                ]
            },
            {
                'id': 3,
                'slug': 'bamboo-furniture-workshop-assam',
                'title': 'Bamboo Furniture Workshop, Assam',
                'craft_type': 'Wood & Bamboo',
                'region_state': 'Assam',
                'description': 'Modernizing a village bamboo treatment kiln in Barpeta to transform sustainable Bhaluka bamboo into contemporary heirloom living furniture.',
                'funding_goal': 320000.00,
                'amount_raised': 385000.00,
                'backers_count': 245,
                'days_left': 0,
                'status': CampaignStatus.FUNDED,
                'image': '/images/products/assam-bamboo-pendant-light.jpg',
                'tiers': [
                    {
                        'title': 'Woven Bamboo Desk Organizer & Pen Stand',
                        'amount': 799.00,
                        'description': 'Multi-compartment desk organizer meticulously woven from fine bamboo Trat strips.',
                        'estimated_delivery': 'Oct 2026',
                        'items_included': ['1x Woven Bamboo Desk Organizer', '1x Bamboo Pen'],
                        'backers_count': 110
                    },
                    {
                        'title': 'Handwoven Cylindrical Bamboo Floor Lamp',
                        'amount': 1999.00,
                        'description': 'Geometric lattice-weave floor lamp that casts warm ambient shadows.',
                        'estimated_delivery': 'Nov 2026',
                        'items_included': ['1x Bamboo Floor Lamp', 'Brass Socket & Cord'],
                        'backers_count': 105
                    }
                ]
            },
            {
                'id': 4,
                'slug': 'bastar-dhokra-brass-casting-guild',
                'title': 'Bastar Dhokra Brass Lost-Wax Casting Guild, Chhattisgarh',
                'craft_type': 'Metal & Dhokra',
                'region_state': 'Chhattisgarh',
                'description': 'Constructing community smelting hearths and clay-slurry facilities for 14 tribal metalsmiths in rural Kondagaon.',
                'funding_goal': 200000.00,
                'amount_raised': 164000.00,
                'backers_count': 156,
                'days_left': 14,
                'status': CampaignStatus.IN_PROGRESS,
                'image': '/images/products/dhokra-royal-elephant.jpg',
                'tiers': [
                    {
                        'title': 'Dhokra Tribal Dancing Figurine Miniature',
                        'amount': 850.00,
                        'description': 'Authentic 4-inch lost-wax brass tribal figurine holding a grain sickle.',
                        'estimated_delivery': 'Nov 2026',
                        'items_included': ['1x Bastar Dhokra Figurine', 'Tribal Lore Card'],
                        'backers_count': 65
                    },
                    {
                        'title': 'Lost-Wax Cast Brass Nandi Bull Sculpture',
                        'amount': 2200.00,
                        'description': 'Traditional 7-inch ornamental Nandi bull in solid bell metal.',
                        'estimated_delivery': 'Dec 2026',
                        'items_included': ['1x Bastar Nandi Bull Sculpture', 'Solid Sheesham Wood Base'],
                        'backers_count': 72
                    }
                ]
            },
            {
                'id': 5,
                'slug': 'kutch-rogan-castor-oil-fabric-art',
                'title': 'Kutch Rogan Castor Oil Fabric Art Guild, Nirona',
                'craft_type': 'Handloom & Textiles',
                'region_state': 'Gujarat',
                'description': 'Establishing communal castor-oil heating vats and iron stylus tools for 8 apprentice artisans in Nirona, Kutch.',
                'funding_goal': 200000.00,
                'amount_raised': 135000.00,
                'backers_count': 112,
                'days_left': 0,
                'status': CampaignStatus.FAILED,
                'image': '/images/products/kalamkari-tree-of-life-tapestry.jpg',
                'tiers': [
                    {
                        'title': 'Hand-painted Rogan Silk Bookmark & Pouch',
                        'amount': 650.00,
                        'description': 'Silk bookmark with traditional Tree of Life floral motif hand-drawn with colored castor oil paste.',
                        'estimated_delivery': 'Nov 2026',
                        'items_included': ['1x Hand-painted Silk Bookmark', '1x Artisan Bio Booklet'],
                        'backers_count': 50
                    }
                ]
            },
            {
                'id': 6,
                'slug': 'kalamkari-natural-dye-textile-workshop',
                'title': 'Kalamkari Natural Dye Textile Workshop, Machilipatnam',
                'craft_type': 'Handloom & Textiles',
                'region_state': 'Andhra Pradesh',
                'description': 'Constructing organic river-washing stone troughs and pen-painting workshops for 16 women artisans in Pedana.',
                'funding_goal': 200000.00,
                'amount_raised': 96000.00,
                'backers_count': 64,
                'days_left': 16,
                'status': CampaignStatus.IN_PROGRESS,
                'image': '/images/products/kalamkari-tree-of-life-tapestry.jpg',
                'tiers': [
                    {
                        'title': 'Hand-Drawn Kalamkari Table Runner (1.5m)',
                        'amount': 650.00,
                        'description': 'Authentic hand-painted 100% cotton table runner with floral border in natural indigo.',
                        'estimated_delivery': 'Nov 2026',
                        'items_included': ['1x Hand-painted Table Runner', 'Kalamkari Heritage Certificate'],
                        'backers_count': 38
                    }
                ]
            }
        ]

        created_campaigns = {}
        for cdata in campaigns_data:
            tiers = cdata.pop('tiers')
            c, _ = Campaign.objects.get_or_create(
                slug=cdata['slug'],
                defaults={
                    'title': cdata['title'],
                    'artisan': artisan_user,
                    'craft_type': cdata['craft_type'],
                    'region_state': cdata['region_state'],
                    'description': cdata['description'],
                    'funding_goal': cdata['funding_goal'],
                    'amount_raised': cdata['amount_raised'],
                    'backers_count': cdata['backers_count'],
                    'days_left': cdata['days_left'],
                    'status': cdata['status'],
                    'image': cdata['image'],
                    'gallery_images': [cdata['image']],
                    'is_approved': True,
                }
            )
            created_campaigns[c.slug] = c

            for tdata in tiers:
                RewardTier.objects.get_or_create(
                    campaign=c,
                    title=tdata['title'],
                    defaults={
                        'amount': tdata['amount'],
                        'description': tdata['description'],
                        'estimated_delivery': tdata['estimated_delivery'],
                        'items_included': tdata['items_included'],
                        'backers_count': tdata['backers_count']
                    }
                )

        # 3. Products Data
        products_data = [
            {
                'sku': 'CF-TNJ-01',
                'name': 'Kuthu Vilakku Handcrafted Brass Temple Lamp',
                'price': 2499.00,
                'category': 'Metal & Dhokra',
                'craft_heritage_note': 'Swamimalai Brass Cast',
                'region_state': 'Tamil Nadu',
                'description': 'Traditional 5-step handcrafted brass oil lamp cast using lost-wax technique with ornamental annam peacock finial.',
                'image': 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=1200&q=80',
                'in_stock': True,
                'stock_quantity': 14,
                'average_rating': 4.90,
                'reviews_count': 84
            },
            {
                'sku': 'CF-VNS-02',
                'name': 'Pure Banarasi Katan Silk Zari Brocade Saree',
                'price': 4899.00,
                'category': 'Handloom & Textiles',
                'craft_heritage_note': 'Varanasi Katan Silk',
                'region_state': 'Uttar Pradesh',
                'description': 'Regal royal blue handloom saree with intricate pure gold zari floral brocade and woven pallu.',
                'image': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
                'in_stock': False,
                'stock_quantity': 0,
                'average_rating': 4.90,
                'reviews_count': 128
            },
            {
                'sku': 'CF-GKP-03',
                'name': 'Handmade Terracotta Chai Cups & Water Matka Set',
                'price': 549.00,
                'category': 'Ceramics & Pottery',
                'craft_heritage_note': 'Bankura Terracotta',
                'region_state': 'West Bengal',
                'description': 'Wood-fired earthen clay festive set with 1.5L cooling water matka and 4 fluted chai kulhads.',
                'image': 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80',
                'in_stock': True,
                'stock_quantity': 26,
                'average_rating': 4.80,
                'reviews_count': 92
            },
            {
                'sku': 'CF-SHP-04',
                'name': 'Saharanpur Teakwood Floral Carved Jali Wall Panel',
                'price': 1850.00,
                'category': 'Woodcraft & Carving',
                'craft_heritage_note': 'Saharanpur Wood Carving',
                'region_state': 'Uttar Pradesh',
                'description': 'Hand-chiselled solid seasoned teakwood geometric and floral jali lattice panel with natural walnut polish.',
                'image': '/images/products/jaipur-blue-pottery-tea-set.jpg',
                'in_stock': True,
                'stock_quantity': 15,
                'average_rating': 5.00,
                'reviews_count': 76
            },
            {
                'sku': 'CF-BST-05',
                'name': 'Hand-Cast Brass Hanging Temple Bells Chime',
                'price': 1299.00,
                'category': 'Metal & Dhokra',
                'craft_heritage_note': 'Dhokra Lost-Wax Metalwork',
                'region_state': 'Chhattisgarh',
                'description': 'Tiered brass chain with 5 hand-cast resonant temple bells and tribal sun emblem.',
                'image': '/images/products/dhokra-royal-elephant.jpg',
                'in_stock': True,
                'stock_quantity': 6,
                'average_rating': 4.90,
                'reviews_count': 64
            },
            {
                'sku': 'CF-JPR-06',
                'name': 'Jaipur Blue Pottery Ceramic Planter',
                'price': 899.00,
                'category': 'Ceramics & Pottery',
                'craft_heritage_note': 'Jaipur Blue Pottery',
                'region_state': 'Rajasthan',
                'description': 'Authentic quartz-based hand-painted ceramic planter with turquoise arabesque vines.',
                'image': '/images/products/jaipur-blue-pottery-tea-set.jpg',
                'in_stock': True,
                'stock_quantity': 18,
                'average_rating': 4.75,
                'reviews_count': 42
            },
            {
                'sku': 'CF-ASM-07',
                'name': 'Assam Bhaluka Bamboo Desktop Acoustic Speaker',
                'price': 1150.00,
                'category': 'Home & Living',
                'craft_heritage_note': 'Assam Bamboo Craft',
                'region_state': 'Assam',
                'description': 'Zero-electricity passive acoustic sound amplifier hand-carved from seasoned Assamese Bhaluka bamboo.',
                'image': '/images/products/assam-bamboo-pendant-light.jpg',
                'in_stock': True,
                'stock_quantity': 20,
                'average_rating': 4.85,
                'reviews_count': 35
            },
            {
                'sku': 'CF-KML-08',
                'name': 'Kalamkari Tree of Life Hand-Painted Wall Tapestry',
                'price': 2750.00,
                'category': 'Handloom & Textiles',
                'craft_heritage_note': 'Pedana Kalamkari Art',
                'region_state': 'Andhra Pradesh',
                'description': 'Framed natural dye pen-painted cotton hanging featuring classic Tree of Life motif.',
                'image': '/images/products/kalamkari-tree-of-life-tapestry.jpg',
                'in_stock': True,
                'stock_quantity': 9,
                'average_rating': 4.95,
                'reviews_count': 51
            }
        ]

        for pdata in products_data:
            p, _ = Product.objects.get_or_create(
                sku=pdata['sku'],
                defaults={
                    'name': pdata['name'],
                    'artisan': artisan_user,
                    'price': pdata['price'],
                    'description': pdata['description'],
                    'category': pdata['category'],
                    'craft_heritage_note': pdata['craft_heritage_note'],
                    'region_state': pdata['region_state'],
                    'in_stock': pdata['in_stock'],
                    'stock_quantity': pdata['stock_quantity'],
                    'is_funded_on_platform': True,
                    'average_rating': pdata['average_rating'],
                    'reviews_count': pdata['reviews_count'],
                    'image': pdata['image'],
                    'gallery_images': [pdata['image']]
                }
            )

            ProductReview.objects.get_or_create(
                product=p,
                author_name='Conscious Patron',
                defaults={
                    'rating': 5,
                    'title': 'Exceptional Authentic Handicraft',
                    'comment': f'Truly remarkable quality in {p.name}. Shipped securely with authentic GI certificate.',
                    'verified_buyer': True
                }
            )

        # 4. Orders
        o1, _ = Order.objects.get_or_create(
            order_number='CF-892104',
            defaults={
                'user': buyer_user,
                'status': OrderStatus.CONFIRMED,
                'total_amount': 2499.00,
                'shipping_address_text': 'Eleanor Vance\n45 Archival Avenue\nBengaluru, Karnataka 560001, India',
                'tracking_reference': 'BLUEDART-892104',
            }
        )
        OrderStatusHistory.objects.get_or_create(
            order=o1, status=OrderStatus.CONFIRMED,
            defaults={'note': 'Payment secured in escrow. Artisan notified.'}
        )
        p_first = Product.objects.first()
        if p_first:
            OrderItem.objects.get_or_create(
                order=o1, product=p_first,
                defaults={'title': p_first.name, 'price_at_purchase': p_first.price, 'quantity': 1, 'image': p_first.image}
            )

        # 5. Pledges
        c_chanderi = created_campaigns.get('revive-chanderi-handloom-weaving')
        if c_chanderi:
            Pledge.objects.get_or_create(
                user=buyer_user, campaign=c_chanderi,
                defaults={
                    'tier_title': 'Pure Chanderi Cotton-Silk Scarf with Zari Border',
                    'amount': 2499.00,
                    'status': 'authorized',
                    'backer_name': 'Aarav Sharma',
                    'estimated_delivery': 'Nov 2026'
                }
            )

        self.stdout.write(self.style.SUCCESS(f"Full database seeding completed: {len(campaigns_data)} Campaigns & {len(products_data)} Products active."))
