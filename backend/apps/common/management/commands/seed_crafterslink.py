from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from apps.artisans.models import ArtisanProfile, Product
from apps.users.models import DesignerProfile
from apps.commissions.models import Commission
from apps.common.models import Notification, SavedItem, Project, ProjectItem
from datetime import date, timedelta
import random

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed CraftersLink database with realistic Kenyan artisan and designer data'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Starting CraftersLink database seeding...'))

        try:
            with transaction.atomic():
                # Check if data already exists
                if User.objects.filter(role__in=['ARTISAN', 'INTERIOR_DESIGNER']).count() > 5:
                    self.stdout.write(self.style.WARNING(
                        'Database already contains significant user data. Skipping seed.'
                    ))
                    return

                # Create artisans
                artisans = self.create_artisans()
                self.stdout.write(self.style.SUCCESS(f'✓ Created {len(artisans)} artisans'))

                # Create designers
                designers = self.create_designers()
                self.stdout.write(self.style.SUCCESS(f'✓ Created {len(designers)} designers'))

                # Create products
                products = self.create_products(artisans)
                self.stdout.write(self.style.SUCCESS(f'✓ Created {len(products)} products'))

                # Create commissions
                commissions = self.create_commissions(designers, artisans, products)
                self.stdout.write(self.style.SUCCESS(f'✓ Created {len(commissions)} commissions'))

                # Create saved items
                saved = self.create_saved_items(designers, products)
                self.stdout.write(self.style.SUCCESS(f'✓ Created {len(saved)} saved items'))

                # Create projects
                projects = self.create_projects(designers, products)
                self.stdout.write(self.style.SUCCESS(f'✓ Created {len(projects)} projects'))

                # Create notifications
                notifications = self.create_notifications(artisans, designers, commissions)
                self.stdout.write(self.style.SUCCESS(f'✓ Created {len(notifications)} notifications'))

                self.stdout.write(self.style.SUCCESS('\n' + '='*60))
                self.stdout.write(self.style.SUCCESS('✅ CraftersLink database seeding completed successfully!'))
                self.stdout.write(self.style.SUCCESS('='*60))
                self.stdout.write(self.style.SUCCESS('\n📧 Test Accounts Created:\n'))
                self.stdout.write(self.style.SUCCESS('ARTISANS (password: CraftersLink2026!):'))
                self.stdout.write('  • james.mwangi@crafterslink.ke - Carpenter, Murang\'a')
                self.stdout.write('  • aisha.otieno@crafterslink.ke - Metalworker, Nairobi')
                self.stdout.write('  • peter.kamau@crafterslink.ke - Upholsterer, Kiambu')
                self.stdout.write('  • grace.njeri@crafterslink.ke - Ceramicist, Nakuru')
                self.stdout.write('  • samuel.ochieng@crafterslink.ke - Textile Artist, Kisumu')
                self.stdout.write(self.style.SUCCESS('\nDESIGNERS (password: CraftersLink2026!):'))
                self.stdout.write('  • amina.hassan@crafterslink.ke - Hassan Interiors, Nairobi')
                self.stdout.write('  • brian.njoroge@crafterslink.ke - Njoroge Design Studio, Nairobi')
                self.stdout.write('  • carol.wanjiku@crafterslink.ke - Coastal Spaces, Mombasa')
                self.stdout.write('\n' + '='*60 + '\n')

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Error seeding database: {str(e)}'))
            import traceback
            traceback.print_exc()
            raise

    def create_artisans(self):
        artisans_data = [
            {
                'email': 'james.mwangi@crafterslink.ke',
                'username': 'james_mwangi',
                'first_name': 'James',
                'last_name': 'Mwangi',
                'phone_number': '+254712345001',
                'profile_image': 'https://picsum.photos/seed/artisan1/400/400',
                'county': 'MURANGA',
                'town': 'Murang\'a Town',
                'bio': 'Master carpenter with 8 years of experience crafting custom furniture. I specialize in solid wood pieces that blend traditional Kenyan craftsmanship with modern design aesthetics. Every piece tells a story and is built to last generations.',
                'craft_specialty': 'FURNITURE',
                'years_of_experience': 8,
                'business_name': 'Mwangi Custom Woodworks',
                'business_registration': 'BN/2018/45678',
                'portfolio_images': [
                    'https://picsum.photos/seed/portfolio1a/800/600',
                    'https://picsum.photos/seed/portfolio1b/800/600',
                    'https://picsum.photos/seed/portfolio1c/800/600',
                ],
                'average_rating': 4.7,
            },
            {
                'email': 'aisha.otieno@crafterslink.ke',
                'username': 'aisha_otieno',
                'first_name': 'Aisha',
                'last_name': 'Otieno',
                'phone_number': '+254723456002',
                'profile_image': 'https://picsum.photos/seed/artisan2/400/400',
                'county': 'NAIROBI',
                'town': 'Industrial Area',
                'bio': 'Skilled metalworker creating beautiful and functional pieces from steel and iron. From decorative gates to modern sculptures, I bring metal to life with precision welding and custom fabrication techniques.',
                'craft_specialty': 'METALWORK',
                'years_of_experience': 6,
                'business_name': 'Otieno Metal Crafts',
                'business_registration': 'BN/2020/12345',
                'portfolio_images': [
                    'https://picsum.photos/seed/portfolio2a/800/600',
                    'https://picsum.photos/seed/portfolio2b/800/600',
                ],
                'average_rating': 4.5,
            },
            {
                'email': 'peter.kamau@crafterslink.ke',
                'username': 'peter_kamau',
                'first_name': 'Peter',
                'last_name': 'Kamau',
                'phone_number': '+254734567003',
                'profile_image': 'https://picsum.photos/seed/artisan3/400/400',
                'county': 'KIAMBU',
                'town': 'Ruiru',
                'bio': 'Expert upholsterer with a decade of experience transforming furniture. I work with premium fabrics and pay meticulous attention to detail, ensuring every piece is both beautiful and comfortable.',
                'craft_specialty': 'TEXTILES',
                'years_of_experience': 10,
                'business_name': 'Kamau Upholstery Services',
                'business_registration': 'BN/2016/78901',
                'portfolio_images': [
                    'https://picsum.photos/seed/portfolio3a/800/600',
                    'https://picsum.photos/seed/portfolio3b/800/600',
                    'https://picsum.photos/seed/portfolio3c/800/600',
                    'https://picsum.photos/seed/portfolio3d/800/600',
                ],
                'average_rating': 4.8,
            },
            {
                'email': 'grace.njeri@crafterslink.ke',
                'username': 'grace_njeri',
                'first_name': 'Grace',
                'last_name': 'Njeri',
                'phone_number': '+254745678004',
                'profile_image': 'https://picsum.photos/seed/artisan4/400/400',
                'county': 'NAKURU',
                'town': 'Nakuru Town',
                'bio': 'Ceramic artist specializing in handcrafted tiles and pottery. Each piece is created with care, bringing unique character and warmth to your space. I work with both traditional and contemporary designs.',
                'craft_specialty': 'POTTERY',
                'years_of_experience': 5,
                'business_name': 'Njeri Ceramics Studio',
                'business_registration': '',
                'portfolio_images': [
                    'https://picsum.photos/seed/portfolio4a/800/600',
                    'https://picsum.photos/seed/portfolio4b/800/600',
                ],
                'average_rating': 4.3,
            },
            {
                'email': 'samuel.ochieng@crafterslink.ke',
                'username': 'samuel_ochieng',
                'first_name': 'Samuel',
                'last_name': 'Ochieng',
                'phone_number': '+254756789005',
                'profile_image': 'https://picsum.photos/seed/artisan5/400/400',
                'county': 'KISUMU',
                'town': 'Kisumu City',
                'bio': 'Textile artist creating beautiful fabrics for homes and commercial spaces. From curtains to wall hangings, I weave stories into every piece using traditional techniques and natural dyes.',
                'craft_specialty': 'TEXTILES',
                'years_of_experience': 7,
                'business_name': 'Ochieng Textiles',
                'business_registration': 'BN/2019/34567',
                'portfolio_images': [
                    'https://picsum.photos/seed/portfolio5a/800/600',
                    'https://picsum.photos/seed/portfolio5b/800/600',
                    'https://picsum.photos/seed/portfolio5c/800/600',
                ],
                'average_rating': 4.6,
            },
        ]

        artisans = []
        for data in artisans_data:
            # Create user
            user, created = User.objects.get_or_create(
                email=data['email'],
                defaults={
                    'username': data['username'],
                    'first_name': data['first_name'],
                    'last_name': data['last_name'],
                    'phone_number': data['phone_number'],
                    'profile_image': data['profile_image'],
                    'role': 'ARTISAN',
                    'is_verified': True,
                }
            )
            if created:
                user.set_password('CraftersLink2026!')
                user.save()

            # Create artisan profile
            profile, _ = ArtisanProfile.objects.get_or_create(
                user=user,
                defaults={
                    'bio': data['bio'],
                    'county': data['county'],
                    'town': data['town'],
                    'craft_specialty': data['craft_specialty'],
                    'years_of_experience': data['years_of_experience'],
                    'business_name': data['business_name'],
                    'business_registration': data['business_registration'],
                    'portfolio_images': data['portfolio_images'],
                    'average_rating': data['average_rating'],
                }
            )

            artisans.append(profile)

        return artisans

    def create_designers(self):
        designers_data = [
            {
                'email': 'amina.hassan@crafterslink.ke',
                'username': 'amina_hassan',
                'first_name': 'Amina',
                'last_name': 'Hassan',
                'phone_number': '+254767890001',
                'profile_image': 'https://picsum.photos/seed/designer1/400/400',
                'bio': 'Residential interior designer with a passion for creating warm, functional living spaces that reflect my clients\' personalities. Over 15 successful projects completed across Nairobi and its environs.',
                'company_name': 'Hassan Interiors',
                'specialisation': 'RESIDENTIAL',
                'years_of_experience': 6,
                'projects_completed': 15,
                'portfolio_images': [
                    'https://picsum.photos/seed/designport1a/800/600',
                    'https://picsum.photos/seed/designport1b/800/600',
                ],
            },
            {
                'email': 'brian.njoroge@crafterslink.ke',
                'username': 'brian_njoroge',
                'first_name': 'Brian',
                'last_name': 'Njoroge',
                'phone_number': '+254778901002',
                'profile_image': 'https://picsum.photos/seed/designer2/400/400',
                'bio': 'Commercial space designer specializing in offices and retail environments. I create spaces that inspire productivity, enhance brand identity, and drive business success.',
                'company_name': 'Njoroge Design Studio',
                'specialisation': 'COMMERCIAL',
                'years_of_experience': 8,
                'projects_completed': 25,
                'portfolio_images': [
                    'https://picsum.photos/seed/designport2a/800/600',
                    'https://picsum.photos/seed/designport2b/800/600',
                    'https://picsum.photos/seed/designport2c/800/600',
                ],
            },
            {
                'email': 'carol.wanjiku@crafterslink.ke',
                'username': 'carol_wanjiku',
                'first_name': 'Carol',
                'last_name': 'Wanjiku',
                'phone_number': '+254789012003',
                'profile_image': 'https://picsum.photos/seed/designer3/400/400',
                'bio': 'Hospitality design specialist creating memorable experiences through thoughtful design. I work with hotels, restaurants, and resorts along the Kenyan coast and beyond.',
                'company_name': 'Coastal Spaces',
                'specialisation': 'HOSPITALITY',
                'years_of_experience': 5,
                'projects_completed': 18,
                'portfolio_images': [
                    'https://picsum.photos/seed/designport3a/800/600',
                ],
            },
        ]

        designers = []
        for data in designers_data:
            # Create user
            user, created = User.objects.get_or_create(
                email=data['email'],
                defaults={
                    'username': data['username'],
                    'first_name': data['first_name'],
                    'last_name': data['last_name'],
                    'phone_number': data['phone_number'],
                    'profile_image': data['profile_image'],
                    'role': 'INTERIOR_DESIGNER',
                    'is_verified': True,
                }
            )
            if created:
                user.set_password('CraftersLink2026!')
                user.save()

            # Create designer profile
            profile, _ = DesignerProfile.objects.get_or_create(
                user=user,
                defaults={
                    'bio': data['bio'],
                    'company_name': data['company_name'],
                    'specialisation': data['specialisation'],
                    'years_of_experience': data['years_of_experience'],
                    'projects_completed': data['projects_completed'],
                    'portfolio_images': data['portfolio_images'],
                }
            )

            designers.append(user)

        return designers

    def create_products(self, artisans):
        products_data = [
            # James Mwangi - Carpenter (3 items)
            {
                'artisan': artisans[0],
                'name': 'Handcrafted Mahogany Dining Table',
                'description': 'Exquisite 6-seater dining table crafted from solid mahogany wood. Features a smooth, hand-finished surface and sturdy mortise-and-tenon joinery. Dimensions: 180cm x 90cm x 75cm. Perfect centerpiece for family gatherings and dinner parties. Each table is unique with natural wood grain patterns.',
                'material': 'Solid Mahogany Wood',
                'length_cm': 180,
                'width_cm': 90,
                'height_cm': 75,
                'price_kes': 45000,
                'status': 'IN_STOCK',
                'primary_image': 'https://picsum.photos/seed/product1/800/600',
                'additional_images': [
                    'https://picsum.photos/seed/product1a/800/600',
                    'https://picsum.photos/seed/product1b/800/600',
                ],
                'craft_category': 'Furniture',
                'tags': ['dining', 'mahogany', 'custom', 'handmade', 'family'],
            },
            {
                'artisan': artisans[0],
                'name': 'Oak Coffee Table with Glass Top',
                'description': 'Modern coffee table featuring solid oak frame with tempered glass top. Lower shelf provides additional storage space. Dimensions: 120cm x 60cm x 45cm. The combination of natural oak and glass creates an elegant focal point for any living room.',
                'material': 'Oak Wood & Tempered Glass',
                'length_cm': 120,
                'width_cm': 60,
                'height_cm': 45,
                'price_kes': 18500,
                'status': 'IN_STOCK',
                'primary_image': 'https://picsum.photos/seed/product2/800/600',
                'additional_images': [
                    'https://picsum.photos/seed/product2a/800/600',
                ],
                'craft_category': 'Furniture',
                'tags': ['coffee table', 'oak', 'glass', 'modern', 'living room'],
            },
            {
                'artisan': artisans[0],
                'name': 'Custom Kitchen Cabinet Set',
                'description': 'Complete kitchen cabinet set made from solid mahogany with soft-close hinges and drawer slides. Includes wall cabinets, base cabinets, and island unit. Custom-built to fit your kitchen dimensions. Price shown is for standard 3m x 3m kitchen. Includes installation.',
                'material': 'Mahogany Wood',
                'price_kes': 120000,
                'status': 'COMMISSIONABLE',
                'primary_image': 'https://picsum.photos/seed/product3/800/600',
                'additional_images': [
                    'https://picsum.photos/seed/product3a/800/600',
                    'https://picsum.photos/seed/product3b/800/600',
                    'https://picsum.photos/seed/product3c/800/600',
                ],
                'craft_category': 'Furniture',
                'tags': ['kitchen', 'cabinets', 'custom', 'mahogany', 'installation'],
            },
            # Aisha Otieno - Metalworker (3 items)
            {
                'artisan': artisans[1],
                'name': 'Wrought Iron Staircase Railing',
                'description': 'Custom wrought iron staircase railing with decorative scrollwork. Made from 25mm solid steel bars with powder-coated finish for durability. Price per running meter. Includes professional installation and 2-year warranty against rust.',
                'material': 'Wrought Iron Steel',
                'price_kes': 8500,
                'status': 'IN_STOCK',
                'primary_image': 'https://picsum.photos/seed/product4/800/600',
                'additional_images': [
                    'https://picsum.photos/seed/product4a/800/600',
                ],
                'craft_category': 'Metalwork',
                'tags': ['railing', 'staircase', 'wrought iron', 'decorative'],
            },
            {
                'artisan': artisans[1],
                'name': 'Custom Steel Gate with Geometric Pattern',
                'description': 'Modern security gate featuring geometric pattern design. Constructed from 25mm steel bars with anti-rust coating. Standard size: 3m x 2.5m. Includes hinges, lock mechanism, and professional installation. Custom sizes available on request.',
                'material': 'Steel',
                'length_cm': 300,
                'height_cm': 250,
                'price_kes': 35000,
                'status': 'IN_STOCK',
                'primary_image': 'https://picsum.photos/seed/product5/800/600',
                'additional_images': [
                    'https://picsum.photos/seed/product5a/800/600',
                    'https://picsum.photos/seed/product5b/800/600',
                ],
                'craft_category': 'Metalwork',
                'tags': ['gate', 'security', 'steel', 'geometric', 'modern'],
            },
            {
                'artisan': artisans[1],
                'name': 'Decorative Wall Shelf - Metal Frame',
                'description': 'Industrial-style wall shelf with black metal frame and wooden shelves. Three-tier design perfect for displaying books, plants, or decorative items. Dimensions: 90cm x 25cm x 80cm. Easy wall mounting with included hardware.',
                'material': 'Steel & Wood',
                'length_cm': 90,
                'width_cm': 25,
                'height_cm': 80,
                'price_kes': 6500,
                'status': 'IN_STOCK',
                'primary_image': 'https://picsum.photos/seed/product6/800/600',
                'additional_images': [],
                'craft_category': 'Metalwork',
                'tags': ['shelf', 'wall', 'industrial', 'storage', 'decorative'],
            },
            # Peter Kamau - Upholsterer (3 items)
            {
                'artisan': artisans[2],
                'name': '3-Seater Linen Sofa - Custom Made',
                'description': 'Luxurious 3-seater sofa upholstered in premium linen fabric. Features high-density foam cushions for maximum comfort and solid hardwood frame for durability. Dimensions: 200cm x 85cm x 90cm. Available in multiple colors. Includes delivery within Nairobi.',
                'material': 'Linen Fabric & Hardwood',
                'length_cm': 200,
                'width_cm': 85,
                'height_cm': 90,
                'price_kes': 55000,
                'status': 'IN_STOCK',
                'primary_image': 'https://picsum.photos/seed/product7/800/600',
                'additional_images': [
                    'https://picsum.photos/seed/product7a/800/600',
                    'https://picsum.photos/seed/product7b/800/600',
                ],
                'craft_category': 'Furniture',
                'tags': ['sofa', 'linen', 'living room', 'upholstery', 'comfortable'],
            },
            {
                'artisan': artisans[2],
                'name': 'Dining Chair Set (4 chairs) - Velvet Finish',
                'description': 'Set of 4 elegant dining chairs upholstered in soft velvet fabric. Solid wood legs with walnut finish. Padded seats and backs for comfort during long meals. Each chair: 45cm x 50cm x 95cm. Perfect complement to any dining table.',
                'material': 'Velvet & Solid Wood',
                'length_cm': 45,
                'width_cm': 50,
                'height_cm': 95,
                'price_kes': 28000,
                'status': 'IN_STOCK',
                'primary_image': 'https://picsum.photos/seed/product8/800/600',
                'additional_images': [
                    'https://picsum.photos/seed/product8a/800/600',
                ],
                'craft_category': 'Furniture',
                'tags': ['dining', 'chairs', 'velvet', 'set', 'elegant'],
            },
            {
                'artisan': artisans[2],
                'name': 'Vintage Armchair Restoration',
                'description': 'Professional restoration service for vintage armchairs. Includes frame repair, spring replacement, new padding, and reupholstery in fabric of your choice. Price shown is base rate. Final cost depends on chair condition and fabric selection. Turnaround time: 2-3 weeks.',
                'material': 'Various Fabrics',
                'price_kes': 12000,
                'status': 'COMMISSIONABLE',
                'primary_image': 'https://picsum.photos/seed/product9/800/600',
                'additional_images': [
                    'https://picsum.photos/seed/product9a/800/600',
                    'https://picsum.photos/seed/product9b/800/600',
                ],
                'craft_category': 'Furniture',
                'tags': ['restoration', 'vintage', 'armchair', 'upholstery', 'custom'],
            },
            # Grace Njeri - Ceramicist (3 items)
            {
                'artisan': artisans[3],
                'name': 'Handthrown Ceramic Vase Set (3 pieces)',
                'description': 'Set of 3 handthrown ceramic vases in complementary sizes. Each piece is unique with subtle variations in glaze. Perfect for fresh or dried flowers. Heights: 25cm, 20cm, 15cm. Food-safe glaze. Adds artisanal touch to any space.',
                'material': 'Ceramic',
                'height_cm': 25,
                'price_kes': 4500,
                'status': 'IN_STOCK',
                'primary_image': 'https://picsum.photos/seed/product10/800/600',
                'additional_images': [
                    'https://picsum.photos/seed/product10a/800/600',
                ],
                'craft_category': 'Ceramics',
                'tags': ['vase', 'ceramic', 'handmade', 'set', 'decorative'],
            },
            {
                'artisan': artisans[3],
                'name': 'Custom Ceramic Tile Mural',
                'description': 'Bespoke ceramic tile mural for feature walls. Hand-painted designs incorporating traditional Kenyan motifs or custom artwork. Each tile: 20cm x 20cm. Price per square meter. Minimum order: 1 sqm. Lead time: 4-6 weeks for custom designs.',
                'material': 'Ceramic',
                'price_kes': 15000,
                'status': 'COMMISSIONABLE',
                'primary_image': 'https://picsum.photos/seed/product11/800/600',
                'additional_images': [
                    'https://picsum.photos/seed/product11a/800/600',
                    'https://picsum.photos/seed/product11b/800/600',
                ],
                'craft_category': 'Ceramics',
                'tags': ['tiles', 'mural', 'custom', 'ceramic', 'art'],
            },
            {
                'artisan': artisans[3],
                'name': 'Terracotta Planter Collection (5 pieces)',
                'description': 'Collection of 5 terracotta planters in various sizes. Unglazed natural finish with drainage holes. Sizes range from 15cm to 35cm diameter. Perfect for indoor plants or outdoor garden. Durable and breathable material promotes healthy plant growth.',
                'material': 'Terracotta',
                'price_kes': 7500,
                'status': 'IN_STOCK',
                'primary_image': 'https://picsum.photos/seed/product12/800/600',
                'additional_images': [],
                'craft_category': 'Ceramics',
                'tags': ['planters', 'terracotta', 'garden', 'collection', 'plants'],
            },
            # Samuel Ochieng - Textile Artist (3 items)
            {
                'artisan': artisans[4],
                'name': 'Hand-woven Sisal Wall Hanging',
                'description': 'Beautiful wall hanging hand-woven from natural sisal fibers. Features traditional Kenyan patterns in earth tones. Dimensions: 120cm x 80cm. Adds warmth and cultural authenticity to any space. Each piece is unique and tells a story.',
                'material': 'Natural Sisal',
                'length_cm': 120,
                'height_cm': 80,
                'price_kes': 8000,
                'status': 'IN_STOCK',
                'primary_image': 'https://picsum.photos/seed/product13/800/600',
                'additional_images': [
                    'https://picsum.photos/seed/product13a/800/600',
                ],
                'craft_category': 'Textiles',
                'tags': ['wall hanging', 'sisal', 'handwoven', 'traditional', 'art'],
            },
            {
                'artisan': artisans[4],
                'name': 'Kikoi Throw Blanket - Natural Dyes',
                'description': 'Soft kikoi throw blanket woven from 100% cotton and colored with natural plant-based dyes. Dimensions: 150cm x 200cm. Lightweight yet warm, perfect for cool evenings. Machine washable. Traditional Kenyan textile with modern appeal.',
                'material': '100% Cotton',
                'length_cm': 150,
                'width_cm': 200,
                'price_kes': 3500,
                'status': 'IN_STOCK',
                'primary_image': 'https://picsum.photos/seed/product14/800/600',
                'additional_images': [],
                'craft_category': 'Textiles',
                'tags': ['kikoi', 'blanket', 'cotton', 'natural dyes', 'traditional'],
            },
            {
                'artisan': artisans[4],
                'name': 'Custom Woven Area Rug 2x3m',
                'description': 'Custom hand-woven area rug made from durable natural fibers. Size: 2m x 3m. Choose from traditional or contemporary patterns. Colors can be customized to match your interior. Lead time: 3-4 weeks. Adds texture and warmth to any room.',
                'material': 'Natural Fibers',
                'length_cm': 200,
                'width_cm': 300,
                'price_kes': 22000,
                'status': 'COMMISSIONABLE',
                'primary_image': 'https://picsum.photos/seed/product15/800/600',
                'additional_images': [
                    'https://picsum.photos/seed/product15a/800/600',
                    'https://picsum.photos/seed/product15b/800/600',
                ],
                'craft_category': 'Textiles',
                'tags': ['rug', 'woven', 'custom', 'area rug', 'natural'],
            },
        ]

        products = []
        for data in products_data:
            product, _ = Product.objects.get_or_create(
                artisan=data['artisan'],
                name=data['name'],
                defaults=data
            )
            products.append(product)

        return products

    def create_commissions(self, designers, artisans, products):
        commissions_data = [
            {
                'designer': designers[0],
                'artisan': artisans[0],
                'reference_product': products[0],
                'title': 'Custom Dining Table for Karen Residence',
                'custom_brief': 'I need a custom dining table similar to your mahogany piece but with darker finish and slightly larger dimensions (200cm x 100cm). Client prefers a more contemporary edge profile.',
                'budget_kes': 50000,
                'requested_delivery_date': date.today() + timedelta(days=30),
                'status': 'PENDING',
            },
            {
                'designer': designers[1],
                'artisan': artisans[1],
                'reference_product': products[4],
                'title': 'Office Building Security Gate',
                'custom_brief': 'Need a decorative security gate for office building entrance in Westlands. Dimensions: 3.5m x 2.8m. Modern geometric pattern to match building architecture.',
                'budget_kes': 40000,
                'requested_delivery_date': date.today() + timedelta(days=21),
                'status': 'ACCEPTED',
                'agreed_delivery_date': date.today() + timedelta(days=25),
            },
            {
                'designer': designers[2],
                'artisan': artisans[2],
                'reference_product': products[6],
                'title': 'Hotel Lobby Furniture',
                'custom_brief': 'Furnishing hotel lobby - need 5 of your 3-seater sofas in navy blue linen. What\'s your lead time and can you offer bulk discount?',
                'budget_kes': 250000,
                'requested_delivery_date': date.today() + timedelta(days=45),
                'status': 'IN_PROGRESS',
                'agreed_delivery_date': date.today() + timedelta(days=42),
            },
            {
                'designer': designers[0],
                'artisan': artisans[3],
                'reference_product': products[10],
                'title': 'Custom Tile Mural for Feature Wall',
                'custom_brief': 'Looking for custom ceramic tile mural for residential feature wall. Approximately 3m x 2m. Would like to incorporate coastal theme with blues and whites.',
                'budget_kes': 45000,
                'requested_delivery_date': date.today() + timedelta(days=50),
                'status': 'COMPLETED',
                'agreed_delivery_date': date.today() - timedelta(days=5),
                'actual_delivery_date': date.today() - timedelta(days=3),
            },
            {
                'designer': designers[1],
                'artisan': artisans[4],
                'reference_product': products[12],
                'title': 'Restaurant Window Treatments',
                'custom_brief': 'Need custom woven curtains for upscale restaurant. 8 large windows, each approximately 3m x 2.5m. Natural fiber material preferred. Can you do site visit for measurements?',
                'budget_kes': 80000,
                'requested_delivery_date': date.today() + timedelta(days=35),
                'status': 'PENDING',
            },
        ]

        commissions = []
        for data in commissions_data:
            commission, _ = Commission.objects.get_or_create(
                designer=data['designer'],
                artisan=data['artisan'],
                title=data['title'],
                defaults=data
            )
            commissions.append(commission)

        return commissions

    def create_saved_items(self, designers, products):
        saved_items = []
        
        # Amina saves items 0, 4, 9
        for product in [products[0], products[4], products[9]]:
            saved, _ = SavedItem.objects.get_or_create(
                designer=designers[0],
                product=product
            )
            saved_items.append(saved)
        
        # Brian saves items 6, 12
        for product in [products[6], products[12]]:
            saved, _ = SavedItem.objects.get_or_create(
                designer=designers[1],
                product=product
            )
            saved_items.append(saved)
        
        # Carol saves items 1, 7, 13
        for product in [products[1], products[7], products[13]]:
            saved, _ = SavedItem.objects.get_or_create(
                designer=designers[2],
                product=product
            )
            saved_items.append(saved)

        return saved_items

    def create_projects(self, designers, products):
        projects_list = []
        
        # Amina's project
        project1, _ = Project.objects.get_or_create(
            designer=designers[0],
            name='Karen Residence',
            defaults={
                'description': 'Complete interior design for 4-bedroom house in Karen'
            }
        )
        ProjectItem.objects.get_or_create(project=project1, product=products[0])
        ProjectItem.objects.get_or_create(project=project1, product=products[9])
        projects_list.append(project1)
        
        # Brian's project
        project2, _ = Project.objects.get_or_create(
            designer=designers[1],
            name='Westlands Office Fit-Out',
            defaults={
                'description': 'Modern office space design for tech startup'
            }
        )
        ProjectItem.objects.get_or_create(project=project2, product=products[4])
        ProjectItem.objects.get_or_create(project=project2, product=products[6])
        projects_list.append(project2)

        return projects_list

    def create_notifications(self, artisans, designers, commissions):
        notifications = []

        # Notifications for pending commissions
        for commission in commissions:
            if commission.status == 'PENDING':
                notif, _ = Notification.objects.get_or_create(
                    user=commission.artisan.user,
                    type='NEW_ORDER',
                    reference_id=str(commission.id),
                    defaults={
                        'title': 'New Enquiry Received',
                        'message': f'{commission.designer.get_full_name()} sent you an enquiry about {commission.title}',
                        'is_read': False,
                    }
                )
                notifications.append(notif)

        # Notifications for accepted/completed commissions
        for commission in commissions:
            if commission.status in ['ACCEPTED', 'COMPLETED']:
                notif, _ = Notification.objects.get_or_create(
                    user=commission.designer,
                    type='ORDER_UPDATE',
                    reference_id=str(commission.id),
                    defaults={
                        'title': 'Enquiry Update',
                        'message': f'Your enquiry about {commission.title} has been {commission.status.lower()}',
                        'is_read': random.choice([True, False]),
                    }
                )
                notifications.append(notif)

        return notifications


# Made with Bob