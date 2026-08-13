import random
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from categories.models import Category
from products.models import Product, ProductImage
from reviews.models import Review
from orders.models import Coupon

User = get_user_model()


class Command(BaseCommand):
    help = 'Populates the database with realistic sample categories, products, images, specs, reviews, coupons and users'

    def handle(self, *args, **options):
        self.stdout.write('[*] Seeding database with realistic e-commerce data...')

        # 1. Categories with real Unsplash imagery
        categories_data = [
            {
                'name': 'Electronics',
                'description': 'Latest smartphones, laptops, audio gear, and cutting-edge tech gadgets.',
                'image': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=800&q=80',
            },
            {
                'name': 'Fashion',
                'description': 'Trendy clothing, luxury apparel, and designer wear for men & women.',
                'image': 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80',
            },
            {
                'name': 'Shoes',
                'description': 'Athletic sneakers, running shoes, formal leather boots, and designer heels.',
                'image': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
            },
            {
                'name': 'Accessories',
                'description': 'Smartwatches, luxury timepieces, handcrafted leather bags, and designer sunglasses.',
                'image': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
            },
            {
                'name': 'Home & Kitchen',
                'description': 'Smart home appliances, modern cookware, air fryers, and aesthetic decor.',
                'image': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
            },
            {
                'name': 'Beauty',
                'description': 'Dermatologist-tested skincare formulas, makeup essentials, and luxury perfumes.',
                'image': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
            },
            {
                'name': 'Sports',
                'description': 'Fitness smart wearables, gym equipment, active training gear, and footballs.',
                'image': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
            },
            {
                'name': 'Books',
                'description': 'International bestsellers, productivity guides, personal finance, and fiction classics.',
                'image': 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=800&q=80',
            },
        ]

        categories = {}
        for cat_data in categories_data:
            cat, _ = Category.objects.update_or_create(
                name=cat_data['name'],
                defaults={
                    'description': cat_data['description'],
                    'external_image_url': cat_data['image'],
                    'is_active': True,
                }
            )
            categories[cat.name] = cat
            self.stdout.write(f'  [+] Category: {cat.name}')

        # 2. Rich Realistic Products
        products_data = [
            # Electronics
            {
                'name': 'Apple iPhone 15 Pro Max (256GB, Natural Titanium)',
                'category': 'Electronics',
                'brand': 'Apple',
                'price': Decimal('159900.00'),
                'discount_price': Decimal('149900.00'),
                'stock': 45,
                'is_featured': True,
                'rating': Decimal('4.9'),
                'review_count': 582,
                'image': 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
                'gallery': [
                    'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
                ],
                'description': 'iPhone 15 Pro Max. Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever with 5x optical zoom.',
                'highlights': [
                    'Aerospace-grade titanium design with textured matte-glass back',
                    'A17 Pro chip delivers groundbreaking graphics performance for mobile gaming',
                    '48MP Main camera with 5x Telephoto optical zoom lens',
                    'All-day battery life with up to 29 hours video playback',
                    'USB-C connector with USB 3 speeds up to 10Gb/s',
                ],
                'specifications': {
                    'Display': '6.7-inch Super Retina XDR OLED (120Hz ProMotion)',
                    'Processor': 'Apple A17 Pro (3nm architecture)',
                    'Storage': '256GB NVMe',
                    'Camera': '48MP Main + 12MP Ultra-Wide + 12MP 5x Telephoto',
                    'Battery': '4,422 mAh (Fast Charge 50% in 30 mins)',
                    'Water Resistance': 'IP68 (6 meters up to 30 mins)',
                    'Warranty': '1 Year Official Apple India Warranty',
                },
            },
            {
                'name': 'Samsung Galaxy S24 Ultra 5G (Titanium Gray, 512GB)',
                'category': 'Electronics',
                'brand': 'Samsung',
                'price': Decimal('139999.00'),
                'discount_price': Decimal('129999.00'),
                'stock': 32,
                'is_featured': True,
                'rating': Decimal('4.8'),
                'review_count': 419,
                'image': 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
                'gallery': [
                    'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80',
                ],
                'description': 'Meet Galaxy S24 Ultra, the ultimate form of Galaxy Ultra with a new titanium exterior and a 6.8-inch flat display. Powered by Galaxy AI and Snapdragon 8 Gen 3 for Galaxy.',
                'highlights': [
                    'Galaxy AI features: Circle to Search, Live Call Translation, Note Assist',
                    '200MP Quad Telephoto camera with 100x Space Zoom',
                    'Integrated S Pen stylus with low-latency writing precision',
                    'Corning Gorilla Armor anti-reflective scratch-resistant display',
                ],
                'specifications': {
                    'Display': '6.8-inch Dynamic AMOLED 2X QHD+ 2600 nits',
                    'Processor': 'Snapdragon 8 Gen 3 for Galaxy',
                    'RAM & Storage': '12GB LPDDR5X + 512GB UFS 4.0',
                    'Camera': '200MP + 50MP + 12MP + 10MP',
                    'Battery': '5000 mAh with 45W Super Fast Charging',
                    'OS': 'Android 14 with One UI 6.1 (7 Years of OS Updates)',
                },
            },
            {
                'name': 'Sony WH-1000XM5 Wireless Noise-Canceling Headphones',
                'category': 'Electronics',
                'brand': 'Sony',
                'price': Decimal('34990.00'),
                'discount_price': Decimal('26990.00'),
                'stock': 60,
                'is_featured': True,
                'rating': Decimal('4.9'),
                'review_count': 640,
                'image': 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
                'gallery': [
                    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
                ],
                'description': 'Industry-leading Active Noise Cancellation with two processors and 8 microphones for unprecedented quiet. Exceptional Hi-Res sound quality and 30-hour battery life.',
                'highlights': [
                    'Integrated Processor V1 and HD Noise Cancelling Processor QN1',
                    'Specially designed 30mm carbon-fiber driver unit',
                    'Crystal clear hands-free calling with 4 beamforming mics and AI reduction',
                    'Speak-to-Chat automatically pauses playback when you start talking',
                ],
                'specifications': {
                    'Battery Life': 'Up to 30 hours (ANC On) / 40 hours (ANC Off)',
                    'Quick Charge': '3 min charge gives 3 hours playback',
                    'Bluetooth': 'Version 5.2 with LDAC, AAC, SBC codec support',
                    'Weight': '250g ultra-comfortable lightweight design',
                },
            },
            {
                'name': 'Apple MacBook Air M3 (15.3-inch Liquid Retina, 16GB, 512GB)',
                'category': 'Electronics',
                'brand': 'Apple',
                'price': Decimal('154900.00'),
                'discount_price': Decimal('142900.00'),
                'stock': 22,
                'is_featured': True,
                'rating': Decimal('4.9'),
                'review_count': 310,
                'image': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
                'gallery': [
                    'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80',
                ],
                'description': 'Lean, mean M3 machine. Built for Apple Intelligence. Strikingly thin design with up to 18 hours of battery life and support for up to two external displays.',
                'highlights': [
                    'Apple M3 chip with 8-core CPU and 10-core GPU',
                    '15.3-inch Liquid Retina display with 500 nits brightness and P3 wide color',
                    'Completely fanless silent operation',
                    'MagSafe 3 charging port + two Thunderbolt / USB 4 ports',
                ],
                'specifications': {
                    'Display': '15.3-inch IPS LED (2880 x 1864 pixels)',
                    'Memory': '16GB Unified Memory',
                    'Storage': '512GB SSD',
                    'Battery': '66.5Wh lithium-polymer battery',
                    'Weight': '1.51 kg',
                },
            },
            {
                'name': 'Apple iPad Pro 13-inch M4 (Ultra Retina XDR OLED, 256GB)',
                'category': 'Electronics',
                'brand': 'Apple',
                'price': Decimal('129900.00'),
                'discount_price': Decimal('124900.00'),
                'stock': 18,
                'is_featured': False,
                'rating': Decimal('4.8'),
                'review_count': 175,
                'image': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80',
                'gallery': [
                    'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=800&q=80',
                ],
                'description': 'The all-new iPad Pro packs outrageous power into an impossibly thin, light, and portable design. Powered by the next-generation M4 chip with breakthrough Tandem OLED display.',
                'highlights': [
                    'Tandem OLED Ultra Retina XDR display with 1600 nits peak HDR brightness',
                    'Apple M4 chip with 10-core GPU with Hardware-accelerated ray tracing',
                    'Supports Apple Pencil Pro with squeeze gesture and barrel roll',
                    'Just 5.1mm thin — the thinnest Apple product ever',
                ],
                'specifications': {
                    'Display': '13-inch Tandem OLED (2752 x 2064 at 264 ppi)',
                    'Chip': 'Apple M4 Chip with 16-core Neural Engine',
                    'Storage': '256GB',
                    'Audio': 'Four speaker audio system with studio-quality mics',
                },
            },

            # Fashion
            {
                'name': 'Ralph Lauren Classic Oxford Button-Down Shirt',
                'category': 'Fashion',
                'brand': 'Ralph Lauren',
                'price': Decimal('8990.00'),
                'discount_price': Decimal('6490.00'),
                'stock': 120,
                'is_featured': True,
                'rating': Decimal('4.7'),
                'review_count': 230,
                'image': 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
                'gallery': [
                    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
                ],
                'description': 'An essential pillar of the preppy style, this garment-dyed Oxford shirt is tailored from breathable long-staple cotton and washed for a soft broken-in feel.',
                'highlights': [
                    '100% premium combed long-staple cotton',
                    'Button-down point collar with full buttoned placket',
                    'Signature embroidered Pony at the left chest',
                    'Machine washable and wrinkle-resistant finish',
                ],
                'specifications': {
                    'Material': '100% Organic Cotton',
                    'Fit': 'Custom Slim Fit',
                    'Pattern': 'Solid Oxford Weave',
                    'Care': 'Machine wash cold, tumble dry low',
                },
            },
            {
                'name': 'ZARA Floral Print Silk Chiffon Maxi Dress',
                'category': 'Fashion',
                'brand': 'ZARA',
                'price': Decimal('5990.00'),
                'discount_price': Decimal('4290.00'),
                'stock': 85,
                'is_featured': True,
                'rating': Decimal('4.6'),
                'review_count': 188,
                'image': 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
                'gallery': [
                    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80',
                ],
                'description': 'Flowing maxi dress featuring a V-neckline with delicate ruffle trim, long semi-sheer sleeves with elastic cuffs, and tiered tiered hemline in a botanical floral print.',
                'highlights': [
                    'Lightweight and breathable silk-chiffon blend',
                    'Lined bodice with semi-sheer romantic drape',
                    'Flattering elasticated empire waistband',
                ],
                'specifications': {
                    'Fabric': '70% Viscose, 30% Silk',
                    'Length': 'Maxi (Ankle Length)',
                    'Neckline': 'V-Neck with tie string',
                },
            },
            {
                'name': 'Levi\'s Men\'s Slim Tapered Chino Trousers',
                'category': 'Fashion',
                'brand': 'Levi\'s',
                'price': Decimal('3999.00'),
                'discount_price': Decimal('2799.00'),
                'stock': 140,
                'is_featured': False,
                'rating': Decimal('4.5'),
                'review_count': 142,
                'image': 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
                'gallery': [
                    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80',
                ],
                'description': 'Modern slim fit chinos with extra room in the thigh and a clean tapered leg opening. Crafted with Levi\'s Flex stretch technology for maximum freedom of movement.',
                'highlights': [
                    'Levi\'s Flex stretch fabric for all-day mobility',
                    'Classic 4-pocket styling with welt back pockets',
                    'Zip fly with button closure',
                ],
                'specifications': {
                    'Material': '98% Cotton, 2% Elastane',
                    'Fit': 'Slim Tapered',
                    'Rise': 'Mid Rise',
                },
            },

            # Shoes
            {
                'name': 'Nike Air Max 270 (Triple Black Edition)',
                'category': 'Shoes',
                'brand': 'Nike',
                'price': Decimal('13995.00'),
                'discount_price': Decimal('10995.00'),
                'stock': 55,
                'is_featured': True,
                'rating': Decimal('4.8'),
                'review_count': 720,
                'image': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
                'gallery': [
                    'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=800&q=80',
                ],
                'description': 'Nike\'s first lifestyle Air Max brings you style, comfort and big attitude in the Nike Air Max 270. The design draws inspiration from Air Max icons with a 270-degree Max Air unit.',
                'highlights': [
                    'Large 270 Max Air unit delivers unrivaled, all-day cushioning',
                    'Engineered mesh upper for breathability and lightweight structure',
                    'Stretchy inner sleeve creates a snug, sock-like fit',
                    'Dual-density foam sole provides cloud-like comfort',
                ],
                'specifications': {
                    'Sole Material': 'Rubber with Max Air Chamber',
                    'Upper Material': 'Engineered Knit Mesh',
                    'Closure': 'Lace-Up',
                    'Ideal For': 'Running, Gym, Streetwear',
                },
            },
            {
                'name': 'Adidas Ultraboost Light Running Shoes',
                'category': 'Shoes',
                'brand': 'Adidas',
                'price': Decimal('18999.00'),
                'discount_price': Decimal('14999.00'),
                'stock': 40,
                'is_featured': True,
                'rating': Decimal('4.9'),
                'review_count': 510,
                'image': 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
                'gallery': [
                    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80',
                ],
                'description': 'Experience epic energy with the new Ultraboost Light, our lightest Ultraboost ever. 30% lighter Boost material gives ultimate energy return over hundreds of kilometers.',
                'highlights': [
                    'Light BOOST midsole is 30% lighter with higher energy return',
                    'PRIMEKNIT+ textile upper hugs your foot with targeted support',
                    'Continental Better Rubber outsole provides maximum traction on wet/dry surfaces',
                ],
                'specifications': {
                    'Weight': '293 g (size UK 8.5)',
                    'Midsole Drop': '10 mm',
                    'Arch Type': 'Normal',
                },
            },
            {
                'name': 'Clarks Leather Ankle Chelsea Boots',
                'category': 'Shoes',
                'brand': 'Clarks',
                'price': Decimal('11999.00'),
                'discount_price': Decimal('8499.00'),
                'stock': 65,
                'is_featured': False,
                'rating': Decimal('4.6'),
                'review_count': 195,
                'image': 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=800&q=80',
                'gallery': [
                    'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=800&q=80',
                ],
                'description': 'Crafted in premium full-grain leather, these iconic Chelsea boots feature elastic side gussets for easy on-and-off and an OrthoLite footbed that wicks away moisture.',
                'highlights': [
                    'Rich genuine full-grain leather upper with hand-burnished finish',
                    'OrthoLite cushioned footbed provides targeted underfoot support',
                    'Durable rubber outsole with high slip resistance',
                ],
                'specifications': {
                    'Upper': '100% Genuine Cowhide Leather',
                    'Lining': 'Breathable Microfiber',
                    'Heel Height': '2.5 cm',
                },
            },

            # Accessories
            {
                'name': 'Fossil Gen 6 Smartwatch (Black Stainless Steel)',
                'category': 'Accessories',
                'brand': 'Fossil',
                'price': Decimal('24995.00'),
                'discount_price': Decimal('18995.00'),
                'stock': 35,
                'is_featured': True,
                'rating': Decimal('4.7'),
                'review_count': 328,
                'image': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
                'gallery': [
                    'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
                ],
                'description': 'More than smart. Fast charging to 80% in just 30 minutes. Snapdragon Wear 4100+ platform brings upgraded performance, continuous SpO2 tracking and Google Assistant on your wrist.',
                'highlights': [
                    'Snapdragon Wear 4100+ platform for 30% faster app loading',
                    'Heart-rate tracking with SpO2 blood oxygen sensor',
                    'Always-on 1.28-inch AMOLED display with 416 x 416 resolution',
                    '3 ATM water resistance for swimming and showering',
                ],
                'specifications': {
                    'Compatibility': 'Android & iOS',
                    'Case Size': '44 mm Stainless Steel',
                    'Connectivity': 'Bluetooth 5.0 LE, Wi-Fi, GPS, NFC SE',
                    'Battery': '24+ hour multi-day Extended Mode',
                },
            },
            {
                'name': 'Ray-Ban Aviator Classic Polarized Sunglasses',
                'category': 'Accessories',
                'brand': 'Ray-Ban',
                'price': Decimal('10890.00'),
                'discount_price': Decimal('8690.00'),
                'stock': 80,
                'is_featured': True,
                'rating': Decimal('4.9'),
                'review_count': 610,
                'image': 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
                'gallery': [
                    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80',
                ],
                'description': 'Originally designed for US aviators in 1937, the Ray-Ban Aviator Classic is timeless. Combining great aviator styling with exceptional quality, performance and comfort.',
                'highlights': [
                    'Polarized G-15 green lenses eliminate glare with 100% UV400 protection',
                    'Lightweight monel metal frame in iconic Arista Gold finish',
                    'Crystal clear vision with optimal contrast enhancement',
                ],
                'specifications': {
                    'Frame Material': 'Metal',
                    'Lens Width': '58 mm',
                    'Bridge Size': '14 mm',
                    'Warranty': '2 Years International Ray-Ban Warranty',
                },
            },
            {
                'name': 'Hidesign Genuine Leather Executive Briefcase',
                'category': 'Accessories',
                'brand': 'Hidesign',
                'price': Decimal('14995.00'),
                'discount_price': Decimal('11995.00'),
                'stock': 40,
                'is_featured': False,
                'rating': Decimal('4.7'),
                'review_count': 180,
                'image': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
                'gallery': [
                    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
                ],
                'description': 'Handcrafted with vegetable-tanned classic leather. Features dedicated padded compartment for 15-inch laptops, solid brass hardware, and detachable shoulder strap.',
                'highlights': [
                    '100% handcrafted East India vegetable-tanned leather',
                    'Padded laptop sleeve fits up to 15.6-inch laptops',
                    'Solid sand-cast brass buckle hardware',
                ],
                'specifications': {
                    'Dimensions': '40 x 30 x 10 cm',
                    'Weight': '1.3 kg',
                    'Color': 'Ranch Tan / Dark Brown',
                },
            },

            # Home & Kitchen
            {
                'name': 'Instant Pot Duo 7-in-1 Electric Pressure Cooker (6 Litre)',
                'category': 'Home & Kitchen',
                'brand': 'Instant Pot',
                'price': Decimal('12999.00'),
                'discount_price': Decimal('8999.00'),
                'stock': 90,
                'is_featured': True,
                'rating': Decimal('4.9'),
                'review_count': 940,
                'image': 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80',
                'gallery': [
                    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
                ],
                'description': 'America\'s #1 most loved multi-cooker. Combines 7 appliances in 1: pressure cooker, slow cooker, rice cooker, steamer, sauté pan, yogurt maker and food warmer.',
                'highlights': [
                    'Cooks meals up to 70% faster with 13 one-touch smart cooking programs',
                    'Food-grade 304 (18/8) stainless steel inner pot with tri-ply bottom',
                    'Over 10 proven safety features including Overheat Protection and safe-locking lid',
                ],
                'specifications': {
                    'Capacity': '5.7 Litres (Ideal for 4-6 people)',
                    'Wattage': '1000 Watts',
                    'Voltage': '230V AC 50Hz (India compatible)',
                    'Warranty': '2 Years Manufacturer Warranty',
                },
            },
            {
                'name': 'Philips Digital Air Fryer HD9252 with Rapid Air Tech (4.1L)',
                'category': 'Home & Kitchen',
                'brand': 'Philips',
                'price': Decimal('11995.00'),
                'discount_price': Decimal('8495.00'),
                'stock': 110,
                'is_featured': True,
                'rating': Decimal('4.8'),
                'review_count': 680,
                'image': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
                'gallery': [
                    'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=800&q=80',
                ],
                'description': 'Delicious fries with up to 90% less fat. Rapid Air technology swirls hot air around for crispy, crunchy outside and tender inside cooking with little or no oil.',
                'highlights': [
                    'Patented Rapid Air Starfish design for even heat distribution',
                    'Touch screen with 7 presets: frozen snacks, fresh fries, meat, fish, chicken, cake and veggies',
                    'Keep warm function keeps your food at ideal temperature for up to 30 mins',
                ],
                'specifications': {
                    'Capacity': '4.1 Litre / 0.8 kg basket',
                    'Power': '1400 W',
                    'Cleaning': 'QuickClean basket is dishwasher safe',
                },
            },

            # Beauty
            {
                'name': 'The Ordinary Niacinamide 10% + Zinc 1% (60ml Duo)',
                'category': 'Beauty',
                'brand': 'The Ordinary',
                'price': Decimal('1299.00'),
                'discount_price': Decimal('999.00'),
                'stock': 300,
                'is_featured': True,
                'rating': Decimal('4.8'),
                'review_count': 1120,
                'image': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
                'gallery': [
                    'https://images.unsplash.com/photo-1608248597359-598b0a9db51d?auto=format&fit=crop&w=800&q=80',
                ],
                'description': 'High-strength vitamin and mineral blemish serum. Niacinamide (Vitamin B3) reduces blemishes and signs of congestion while zinc salt of pyrrolidone carboxylic acid balances sebum.',
                'highlights': [
                    'Reduces the appearance of skin blemishes and pore congestion',
                    'Zinc PCA visibly regulates excess sebum activity',
                    'Alcohol-free, oil-free, silicone-free, vegan and cruelty-free',
                ],
                'specifications': {
                    'Skin Type': 'All Skin Types (Ideal for oily & acne-prone)',
                    'Volume': '60 ml',
                    'Format': 'Water-based serum',
                },
            },

            # Books
            {
                'name': 'Atomic Habits by James Clear (Hardcover Collector\'s Edition)',
                'category': 'Books',
                'brand': 'Penguin Random House',
                'price': Decimal('899.00'),
                'discount_price': Decimal('599.00'),
                'stock': 450,
                'is_featured': True,
                'rating': Decimal('4.9'),
                'review_count': 2480,
                'image': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
                'gallery': [
                    'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=800&q=80',
                ],
                'description': 'The instant #1 New York Times bestseller. Over 15 million copies sold worldwide. A supreme, practical framework for improving every day by 1% through tiny habit changes.',
                'highlights': [
                    'Comprehensive 4-step framework: Make it Obvious, Attractive, Easy, and Satisfying',
                    'Overcomes lack of motivation with willpower-proof environment design strategies',
                    'Includes gold foil embossed hardcover and silk bookmark ribbon',
                ],
                'specifications': {
                    'Author': 'James Clear',
                    'Pages': '320 pages',
                    'Language': 'English',
                    'Publisher': 'Penguin Random House',
                },
            },
            {
                'name': 'Rich Dad Poor Dad by Robert T. Kiyosaki (25th Anniversary Edition)',
                'category': 'Books',
                'brand': 'Plata Publishing',
                'price': Decimal('599.00'),
                'discount_price': Decimal('399.00'),
                'stock': 380,
                'is_featured': False,
                'rating': Decimal('4.8'),
                'review_count': 1850,
                'image': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
                'gallery': [
                    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
                ],
                'description': 'The #1 Personal Finance book of all time. Robert Kiyosaki shares lessons on financial literacy, building wealth through cash-flow producing assets, and escaping the rat race.',
                'highlights': [
                    'Explains why high income alone does not guarantee financial freedom',
                    'Teaches the fundamental difference between assets and liabilities',
                    'Updated with modern commentary on today\'s fast-moving economy',
                ],
                'specifications': {
                    'Author': 'Robert T. Kiyosaki',
                    'Pages': '336 pages',
                    'Publisher': 'Plata Publishing',
                },
            },
        ]

        products = []
        for pdata in products_data:
            cat = categories[pdata['category']]
            prod, _ = Product.objects.update_or_create(
                name=pdata['name'],
                defaults={
                    'category': cat,
                    'brand': pdata['brand'],
                    'price': pdata['price'],
                    'discount_price': pdata['discount_price'],
                    'stock': pdata['stock'],
                    'description': pdata['description'],
                    'external_image_url': pdata['image'],
                    'is_featured': pdata['is_featured'],
                    'rating': pdata['rating'],
                    'review_count': pdata['review_count'],
                    'specifications': pdata.get('specifications', {}),
                    'highlights': pdata.get('highlights', []),
                    'is_active': True,
                }
            )
            products.append(prod)
            self.stdout.write(f'  [+] Product: {prod.name[:40]}...')

            # Additional gallery images
            if 'gallery' in pdata:
                ProductImage.objects.filter(product=prod).delete()
                for idx, g_url in enumerate(pdata['gallery']):
                    ProductImage.objects.create(
                        product=prod,
                        external_image_url=g_url,
                        order=idx + 1,
                        alt_text=f'{prod.name} angle {idx + 1}'
                    )

        # 3. Promotional Coupons
        coupons_data = [
            {'code': 'WELCOME50', 'discount_type': 'fixed', 'discount_value': Decimal('500.00'), 'min_order_amount': Decimal('1500.00')},
            {'code': 'SAVE10', 'discount_type': 'percentage', 'discount_value': Decimal('10.00'), 'min_order_amount': Decimal('999.00'), 'max_discount_amount': Decimal('1500.00')},
            {'code': 'FESTIVE20', 'discount_type': 'percentage', 'discount_value': Decimal('20.00'), 'min_order_amount': Decimal('2999.00'), 'max_discount_amount': Decimal('3000.00')},
            {'code': 'SUMMER15', 'discount_type': 'percentage', 'discount_value': Decimal('15.00'), 'min_order_amount': Decimal('1200.00'), 'max_discount_amount': Decimal('2000.00')},
        ]
        for cdata in coupons_data:
            Coupon.objects.update_or_create(
                code=cdata['code'],
                defaults={
                    'discount_type': cdata['discount_type'],
                    'discount_value': cdata['discount_value'],
                    'min_order_amount': cdata['min_order_amount'],
                    'max_discount_amount': cdata.get('max_discount_amount'),
                    'is_active': True,
                }
            )
            self.stdout.write(f'  [+] Coupon: {cdata["code"]}')

        # 4. Users
        users_data = [
            {'email': 'alice@example.com', 'first_name': 'Alice', 'last_name': 'Sharma', 'phone': '+91 9876543210', 'city': 'Mumbai', 'state': 'Maharashtra', 'address': 'Flat 402, Sea Green Apts, Worli'},
            {'email': 'bob@example.com', 'first_name': 'Bob', 'last_name': 'Verma', 'phone': '+91 9811223344', 'city': 'Bengaluru', 'state': 'Karnataka', 'address': '12, Palm Meadows, Whitefield'},
            {'email': 'priya@example.com', 'first_name': 'Priya', 'last_name': 'Patel', 'phone': '+91 9722334455', 'city': 'Ahmedabad', 'state': 'Gujarat', 'address': 'B-14, Shivalik Hills'},
        ]

        created_users = []
        for udata in users_data:
            u, created = User.objects.get_or_create(
                email=udata['email'],
                defaults={
                    'first_name': udata['first_name'],
                    'last_name': udata['last_name'],
                    'phone': udata['phone'],
                    'city': udata['city'],
                    'state': udata['state'],
                    'address': udata['address'],
                    'postal_code': '400018',
                    'country': 'India',
                }
            )
            if created:
                u.set_password('testpass123')
                u.save()
            created_users.append(u)
            self.stdout.write(f'  [+] User: {u.email}')

        # 5. Verified Customer Reviews
        review_comments = [
            'Absolutely phenomenal build quality. Packaging was immaculate and shipping arrived 2 days earlier than expected.',
            'Best purchase I made this year! Worth every single rupee. Performs even better than advertised.',
            'Premium feel, pristine packaging, 100% authentic product. Highly recommended to anyone on the fence.',
            'Excellent performance. Customer service was super responsive when I inquired about warranty registration.',
            'Stunning design and flawless functionality. My whole family is super impressed with this!',
        ]

        Review.objects.all().delete()
        for prod in products:
            sampled_users = random.sample(created_users, min(2, len(created_users)))
            for u in sampled_users:
                Review.objects.create(
                    user=u,
                    product=prod,
                    rating=random.choice([4, 5, 5]),
                    comment=random.choice(review_comments),
                )

        self.stdout.write(self.style.SUCCESS('\n[OK] Realistic database populated successfully!'))
        self.stdout.write(f'  Categories: {Category.objects.count()}')
        self.stdout.write(f'  Products: {Product.objects.count()}')
        self.stdout.write(f'  Coupons: {Coupon.objects.count()}')
        self.stdout.write(f'  Users: {User.objects.count()}')
        self.stdout.write(f'  Reviews: {Review.objects.count()}')
