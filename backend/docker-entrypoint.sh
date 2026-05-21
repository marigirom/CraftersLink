#!/bin/bash
set -e

echo "🚀 CraftersLink Backend Starting..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL..."
while ! pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER; do
  sleep 1
done
echo "✅ PostgreSQL is ready!"

# Run migrations
echo "🔄 Running database migrations..."
python manage.py makemigrations --noinput
python manage.py migrate --noinput

# Collect static files
echo "📦 Collecting static files..."
python manage.py collectstatic --noinput --clear

# Create superuser if it doesn't exist
echo "👤 Creating superuser if needed..."
python manage.py shell << 'END'
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(email='admin@crafterslink.com').exists():
    User.objects.create_superuser(
        email='admin@crafterslink.com',
        username='admin',
        password='admin123',
        first_name='Admin',
        last_name='User',
        phone_number='+254700000000',
        role='ARTISAN'
    )
    print('✅ Superuser created: admin@crafterslink.com / admin123')
else:
    print('ℹ️  Superuser already exists')
END

# Seed database is optional - users can create their own data
# Uncomment the line below if you want to seed test data:
# python manage.py seed_crafterslink

echo "✅ Backend initialization complete!"
echo "🎯 Starting Django server..."

# Execute the main command
exec "$@"

# Made with Bob
