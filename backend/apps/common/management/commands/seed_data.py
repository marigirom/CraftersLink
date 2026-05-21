from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from apps.artisans.models import ArtisanProfile, CatalogueItem
from apps.users.models import DesignerProfile
from apps.commissions.models import Commission
from apps.common.models import Notification, SavedItem
import random

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed database with realistic Kenyan artisan and designer data'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Starting database seeding...'))

        try:
            with transaction.atomic():
                # Check if data already exists
                if User.objects.filter(role__in=['artisan', 'interior_designer']).count() > 0:
                    self.stdout.write(self.style.WARNING(
                        'Database already contains user data. Skipping seed.'
                    ))
                    return

                # Create artisans
                artisans = self.create_artisans()
                self.stdout.write(self.style.SUCCESS(f'Created {len(artisans)} artisans'))

                # Create designers
                designers = self.create_designers()
                self.stdout.write(self.style.SUCCESS(f'Created {len(designers)} designers'))

                # Create catalogue items
                items = self.create_catalogue_items(artisans)
                self.stdout.write(self.style.SUCCESS(f'Created {len(items)} catalogue items'))

                # Create commissions
                commissions = self.create_commissions(designers, artisans, items)
                self.stdout.write(self.style.SUCCESS(f'Created {len(commissions)} commissions'))

                # Create saved items
                saved = self.create_saved_items(designers, items)
                self.stdout.write(self.style.SUCCESS(f'Created {len(saved)} saved items'))

                # Create notifications
                notifications = self.create_notifications(artisans, designers, commissions)
                self.stdout.write(self.style.SUCCESS(f'Created {len(notifications)} notifications'))

                self.stdout.write(self.style.SUCCESS('\n✅ Database seeding completed successfully!'))
                self.stdout.write(self.style.SUCCESS('\nTest Accounts Created:'))
                self.stdout.write(self.style.SUCCESS('Artisans:'))
                self.stdout.write('  - john.kamau@crafterslink.com / password123')
                self.stdout.write('  - mary.wanjiku@crafterslink.com / password123')
                self.stdout.write('  - peter.omondi@crafterslink.com / password123')
                self.stdout.write('  - grace.akinyi@crafterslink.com / password123')
                self.stdout.write('  - david.mwangi@crafterslink.com / password123')
                self.stdout.write(self.style.SUCCESS('\nDesigners:'))
                self.stdout.write('  - sarah.njeri@crafterslink.com / password123')
                self.stdout.write('  - james.otieno@crafterslink.com / password123')
                self.stdout.write('  - lucy.wambui@crafterslink.com / password123')

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error seeding database: {str(e)}'))
            raise

    def create_artisans(self):
        artisans_data = [
            {
                'email': 'john.kamau@crafterslink.com',
                'full_name': 'John Kamau',
                'phone': '+254712345678',
                'location': 'Nairobi',
                'bio': 'Master carpenter with 8 years of experience in custom furniture making. Specializing in solid wood pieces that blend traditional craftsmanship with modern design.',
                'skills': ['Custom Furniture', 'Woodworking', 'Joinery', 'Cabinet Making'],
                'specialisation': 'Custom Furniture',
                'years_experience': 8,
                'rating': 4.7,
                'total_reviews': 23,
                'is_verified': True,
            },
            {
                'email': 'mary.wanjiku@crafterslink.com',
                'full_name': 'Mary Wanjiku',
                'phone': '+254723456789',
                'location': 'Mombasa',
                'bio': 'Skilled metalworker creating beautiful and functional pieces. From decorative gates to modern sculptures, I bring metal to life.',
                'skills': ['Gates', 'Railings', 'Sculptures', 'Welding', 'Metal Fabrication'],
                'specialisation': 'Metalwork',
                'years_experience': 6,
                'rating': 4.5,
                'total_reviews': 18,
                'is_verified': True,
            },
            {
                'email': 'peter.omondi@crafterslink.com',
                'full_name': 'Peter Omondi',
                'phone': '+254734567890',
                'location': 'Kisumu',
                'bio': 'Expert upholsterer with a decade of experience. I transform furniture with quality fabrics and meticulous attention to detail.',
                'skills': ['Upholstery', 'Furniture Restoration', 'Custom Cushions', 'Fabric Selection'],
                'specialisation': 'Upholstery',
                'years_experience': 10,
                'rating': 4.8,
                'total_reviews': 31,
                'is_verified': True,
            },
            {
                'email': 'grace.akinyi@crafterslink.com',
                'full_name': 'Grace Akinyi',
                'phone': '+254745678901',
                'location': 'Nakuru',
                'bio': 'Ceramic artist specializing in tiles and pottery. Each piece is handcrafted with care, bringing unique character to your space.',
                'skills': ['Tiles', 'Pottery', 'Ceramic Sinks', 'Decorative Pieces'],
                'specialisation': 'Ceramics',
                'years_experience': 5,
                'rating': 4.6,
                'total_reviews': 15,
                'is_verified': False,
            },
            {
                'email': 'david.mwangi@crafterslink.com',
                'full_name': 'David Mwangi',
                'phone': '+254756789012',
                'location': 'Eldoret',
                'bio': 'Textile artist creating beautiful fabrics for homes and commercial spaces. From curtains to wall hangings, I weave stories into every piece.',
                'skills': ['Curtains', 'Rugs', 'Wall Hangings', 'Textile Design', 'Weaving'],
                'specialisation': 'Textiles',
                'years_experience': 7,
                'rating': 4.4,
                'total_reviews': 12,
                'is_verified': True,
            },
        ]

        artisans = []
        for data in artisans_data:
            # Create user
            user = User.objects.create_user(
                email=data['email'],
                password='password123',
                full_name=data['full_name'],
                phone=data['phone'],
                location=data['location'],
                bio=data['bio'],
                role='artisan'
            )

            # Create artisan profile
            profile = ArtisanProfile.objects.create(
                user=user,
                skills=data['skills'],
                specialisation=data['specialisation'],
                years_experience=data['years_experience'],
                rating=data['rating'],
                total_reviews=data['total_reviews'],
                is_verified=data['is_verified']
            )

            artisans.append(profile)

        return artisans

    def create_designers(self):
        designers_data = [
            {
                'email': 'sarah.njeri@crafterslink.com',
                'full_name': 'Sarah Njeri',
                'phone': '+254767890123',
                'location': 'Nairobi',
                'bio': 'Residential interior designer with a passion for creating warm, functional living spaces. 12 successful projects completed.',
                'company_name': 'Njeri Interiors',
                'specialisation': 'residential',
                'projects_completed': 12,
            },
            {
                'email': 'james.otieno@crafterslink.com',
                'full_name': 'James Otieno',
                'phone': '+254778901234',
                'location': 'Mombasa',
                'bio': 'Commercial space designer specializing in offices and retail environments. Creating spaces that inspire productivity and success.',
                'company_name': 'Otieno Design Studio',
                'specialisation': 'commercial',
                'projects_completed': 25,
            },
            {
                'email': 'lucy.wambui@crafterslink.com',
                'full_name': 'Lucy Wambui',
                'phone': '+254789012345',
                'location': 'Nairobi',
                'bio': 'Hospitality design specialist. I create memorable experiences through thoughtful design in hotels and restaurants.',
                'company_name': 'Wambui Spaces',
                'specialisation': 'hospitality',
                'projects_completed': 18,
            },
        ]

        designers = []
        for data in designers_data:
            # Create user
            user = User.objects.create_user(
                email=data['email'],
                password='password123',
                full_name=data['full_name'],
                phone=data['phone'],
                location=data['location'],
                bio=data['bio'],
                role='interior_designer'
            )

            # Create designer profile
            profile = DesignerProfile.objects.create(
                user=user,
                company_name=data['company_name'],
                specialisation=data['specialisation'],
                projects_completed=data['projects_completed']
            )

            designers.append(profile)

        return designers

    def create_catalogue_items(self, artisans):
        items_data = [
            # John Kamau - Carpenter
            {
                'artisan': artisans[0],
                'title': 'Custom Dining Table (6-Seater)',
                'description': 'Handcrafted solid mahogany dining table. Seats 6 comfortably. Dimensions: 180cm x 90cm. Features smooth finish and sturdy construction. Perfect for family gatherings.',
                'category': 'furniture',
                'price': 45000,
                'price_unit': 'per_piece',
                'availability': 'available',
                'tags': ['dining', 'mahogany', 'custom', 'family'],
            },
            {
                'artisan': artisans[0],
                'title': 'Mahogany Coffee Table',
                'description': 'Elegant coffee table with lower shelf for storage. Made from solid mahogany wood. Dimensions: 120cm x 60cm x 45cm height.',
                'category': 'furniture',
                'price': 28000,
                'price_unit': 'per_piece',
                'availability': 'available',
                'tags': ['coffee table', 'mahogany', 'living room'],
            },
            {
                'artisan': artisans[0],
                'title': 'Oak Bookshelf',
                'description': '5-tier bookshelf made from solid oak. Dimensions: 180cm height x 90cm width x 30cm depth. Can hold up to 100 books.',
                'category': 'furniture',
                'price': 35000,
                'price_unit': 'per_piece',
                'availability': 'custom_order',
                'tags': ['bookshelf', 'oak', 'storage', 'study'],
            },
            {
                'artisan': artisans[0],
                'title': 'Bedside Tables (Pair)',
                'description': 'Matching pair of bedside tables with drawer and shelf. Made from treated pine. Dimensions: 50cm x 40cm x 60cm height each.',
                'category': 'furniture',
                'price': 18000,
                'price_unit': 'per_piece',
                'availability': 'available',
                'tags': ['bedroom', 'bedside', 'pine', 'storage'],
            },
            # Mary Wanjiku - Metalworker
            {
                'artisan': artisans[1],
                'title': 'Decorative Security Gate',
                'description': 'Custom-designed security gate with decorative patterns. Made from 25mm steel bars. Includes installation. Standard size: 3m x 2.5m.',
                'category': 'metalwork',
                'price': 85000,
                'price_unit': 'per_piece',
                'availability': 'custom_order',
                'tags': ['gate', 'security', 'decorative', 'steel'],
            },
            {
                'artisan': artisans[1],
                'title': 'Balcony Railing',
                'description': 'Modern balcony railing with vertical bars. Made from powder-coated steel. Price per running meter. Includes installation.',
                'category': 'metalwork',
                'price': 3500,
                'price_unit': 'per_sqm',
                'availability': 'available',
                'tags': ['railing', 'balcony', 'steel', 'modern'],
            },
            {
                'artisan': artisans[1],
                'title': 'Abstract Garden Sculpture',
                'description': 'Unique abstract sculpture for garden or outdoor space. Made from welded steel with rust-resistant coating. Height: 150cm.',
                'category': 'metalwork',
                'price': 25000,
                'price_unit': 'per_piece',
                'availability': 'available',
                'tags': ['sculpture', 'art', 'garden', 'outdoor'],
            },
            # Peter Omondi - Upholstery
            {
                'artisan': artisans[2],
                'title': '3-Seater Sofa',
                'description': 'Comfortable 3-seater sofa with high-density foam cushions. Choice of fabric colors. Dimensions: 200cm x 85cm x 90cm. Includes delivery within Kisumu.',
                'category': 'furniture',
                'price': 65000,
                'price_unit': 'per_piece',
                'availability': 'available',
                'tags': ['sofa', 'living room', 'upholstery', 'comfortable'],
            },
            {
                'artisan': artisans[2],
                'title': 'Accent Chair',
                'description': 'Stylish accent chair perfect for reading corner. Solid wood frame with premium upholstery. Multiple fabric options available.',
                'category': 'furniture',
                'price': 22000,
                'price_unit': 'per_piece',
                'availability': 'available',
                'tags': ['chair', 'accent', 'reading', 'upholstery'],
            },
            {
                'artisan': artisans[2],
                'title': 'Custom Cushions (Set of 4)',
                'description': 'Set of 4 decorative cushions. Size: 45cm x 45cm each. Choice of fabrics and patterns. Includes inner cushions.',
                'category': 'textiles',
                'price': 6500,
                'price_unit': 'per_piece',
                'availability': 'available',
                'tags': ['cushions', 'decorative', 'custom', 'set'],
            },
            # Grace Akinyi - Ceramics
            {
                'artisan': artisans[3],
                'title': 'Bathroom Tiles',
                'description': 'High-quality ceramic tiles for bathroom walls and floors. Size: 30cm x 30cm. Multiple colors available. Price per square meter.',
                'category': 'ceramics',
                'price': 2800,
                'price_unit': 'per_sqm',
                'availability': 'available',
                'tags': ['tiles', 'bathroom', 'ceramic', 'flooring'],
            },
            {
                'artisan': artisans[3],
                'title': 'Kitchen Backsplash Tiles',
                'description': 'Decorative ceramic tiles perfect for kitchen backsplash. Size: 20cm x 20cm. Glossy finish. Easy to clean. Price per square meter.',
                'category': 'ceramics',
                'price': 3200,
                'price_unit': 'per_sqm',
                'availability': 'available',
                'tags': ['tiles', 'kitchen', 'backsplash', 'decorative'],
            },
            {
                'artisan': artisans[3],
                'title': 'Decorative Pottery Set',
                'description': 'Set of 3 handmade pottery pieces. Includes vase, bowl, and decorative plate. Each piece is unique. Perfect for home decor.',
                'category': 'ceramics',
                'price': 8500,
                'price_unit': 'per_piece',
                'availability': 'busy',
                'tags': ['pottery', 'handmade', 'decorative', 'set'],
            },
            # David Mwangi - Textiles
            {
                'artisan': artisans[4],
                'title': 'Blackout Curtains (Per Panel)',
                'description': 'Heavy-duty blackout curtains. Size: 250cm height x 140cm width per panel. Multiple colors available. Includes curtain rings.',
                'category': 'textiles',
                'price': 4500,
                'price_unit': 'per_piece',
                'availability': 'available',
                'tags': ['curtains', 'blackout', 'bedroom', 'window'],
            },
            {
                'artisan': artisans[4],
                'title': 'Hand-Woven Rug (2x3m)',
                'description': 'Beautiful hand-woven rug made from natural fibers. Size: 2m x 3m. Durable and easy to clean. Adds warmth to any room.',
                'category': 'textiles',
                'price': 15000,
                'price_unit': 'per_piece',
                'availability': 'custom_order',
                'tags': ['rug', 'handwoven', 'natural', 'floor'],
            },
            {
                'artisan': artisans[4],
                'title': 'Decorative Wall Hanging',
                'description': 'Unique textile wall hanging with traditional Kenyan patterns. Size: 120cm x 80cm. Adds cultural touch to any space.',
                'category': 'textiles',
                'price': 7500,
                'price_unit': 'per_piece',
                'availability': 'available',
                'tags': ['wall hanging', 'decorative', 'traditional', 'art'],
            },
        ]

        items = []
        for data in items_data:
            item = CatalogueItem.objects.create(**data)
            items.append(item)

        return items

    def create_commissions(self, designers, artisans, items):
        commissions_data = [
            {
                'designer': designers[0],  # Sarah
                'artisan': artisans[0],  # John
                'catalogue_item': items[0],  # Dining table
                'message': 'Hi John, I\'m interested in your custom dining table for a client project in Karen. Can we discuss customization options? The client prefers a darker finish.',
                'status': 'pending',
            },
            {
                'designer': designers[1],  # James
                'artisan': artisans[1],  # Mary
                'catalogue_item': items[4],  # Gate
                'message': 'Hello Mary, I need a decorative gate for an office building in Mombasa. The dimensions are 3.5m x 2.8m. Can you provide a quote?',
                'status': 'in_progress',
            },
            {
                'designer': designers[2],  # Lucy
                'artisan': artisans[2],  # Peter
                'catalogue_item': items[7],  # Sofa
                'message': 'Hi Peter, I\'m furnishing a hotel lobby and need 5 of your 3-seater sofas. What\'s your lead time and can you offer a bulk discount?',
                'status': 'accepted',
            },
            {
                'designer': designers[0],  # Sarah
                'artisan': artisans[3],  # Grace
                'catalogue_item': items[10],  # Bathroom tiles
                'message': 'Hello Grace, I need bathroom tiles for a 3-bedroom house. Total area is about 25 square meters. Do you have samples I can see?',
                'status': 'completed',
            },
            {
                'designer': designers[1],  # James
                'artisan': artisans[4],  # David
                'catalogue_item': items[13],  # Curtains
                'message': 'Hi David, I need blackout curtains for a restaurant. We have 8 large windows. Can you do a site visit to take measurements?',
                'status': 'pending',
            },
        ]

        commissions = []
        for data in commissions_data:
            commission = Commission.objects.create(
                designer=data['designer'],
                artisan=data['artisan'],
                catalogue_item=data['catalogue_item'],
                message=data['message'],
                status=data['status']
            )
            commissions.append(commission)

        return commissions

    def create_saved_items(self, designers, items):
        # Each designer saves 3-5 random items
        saved = []
        for designer in designers:
            num_to_save = random.randint(3, 5)
            items_to_save = random.sample(items, num_to_save)
            
            for item in items_to_save:
                saved_item = SavedItem.objects.create(
                    designer=designer,
                    catalogue_item=item
                )
                saved.append(saved_item)

        return saved

    def create_notifications(self, artisans, designers, commissions):
        notifications = []

        # Notifications for artisans about new commissions
        for commission in commissions:
            if commission.status == 'pending':
                notif = Notification.objects.create(
                    user=commission.artisan.user,
                    type='new_commission',
                    message=f'New enquiry from {commission.designer.user.full_name} about {commission.catalogue_item.title}',
                    reference_id=commission.id,
                    is_read=False
                )
                notifications.append(notif)

        # Notifications for designers about commission updates
        for commission in commissions:
            if commission.status in ['accepted', 'completed']:
                notif = Notification.objects.create(
                    user=commission.designer.user,
                    type='commission_update',
                    message=f'Your enquiry about {commission.catalogue_item.title} has been {commission.status}',
                    reference_id=commission.id,
                    is_read=random.choice([True, False])
                )
                notifications.append(notif)

        # Some profile view notifications for artisans
        for artisan in artisans[:3]:  # First 3 artisans
            notif = Notification.objects.create(
                user=artisan.user,
                type='profile_view',
                message=f'Your profile was viewed by {random.choice(designers).user.full_name}',
                is_read=random.choice([True, False])
            )
            notifications.append(notif)

        return notifications

# Made with Bob
