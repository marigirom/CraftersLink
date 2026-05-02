# API Testing Quick Start Guide

## Prerequisites
Ensure the backend is running:
```bash
docker compose ps
```

You should see `crafterslink-backend` with status "Up".

## Base URL
```
http://localhost:8000/api/v1
```

## 1. Create a Test User (Registration)

### Using curl:
```bash
curl -X POST http://localhost:8000/api/v1/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "designer@test.com",
    "password": "TestPass123!",
    "password2": "TestPass123!",
    "first_name": "Jane",
    "last_name": "Designer",
    "user_type": "designer",
    "phone_number": "+254712345678"
  }'
```

### Using HTTPie:
```bash
http POST http://localhost:8000/api/v1/users/register/ \
  email=designer@test.com \
  password=TestPass123! \
  password2=TestPass123! \
  first_name=Jane \
  last_name=Designer \
  user_type=designer \
  phone_number=+254712345678
```

## 2. Login to Get Access Token

### Using curl:
```bash
curl -X POST http://localhost:8000/api/v1/users/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "designer@test.com",
    "password": "TestPass123!"
  }'
```

**Save the `access` token from the response!**

### Using HTTPie:
```bash
http POST http://localhost:8000/api/v1/users/login/ \
  email=designer@test.com \
  password=TestPass123!
```

## 3. Test Authenticated Endpoints

Replace `YOUR_ACCESS_TOKEN` with the token from step 2.

### Get User Profile:
```bash
curl -X GET http://localhost:8000/api/v1/users/profile/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Create Artisan Profile:
First, register an artisan user, then:
```bash
curl -X POST http://localhost:8000/api/v1/artisans/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Expert woodworker with 10 years experience",
    "specialization": "Furniture Making",
    "location": "Nairobi, Kenya",
    "years_of_experience": 10
  }'
```

### List Artisans (Public):
```bash
curl -X GET http://localhost:8000/api/v1/artisans/
```

## 4. Using Postman

1. **Import Collection**: Use the API specification in [`docs/API_SPECIFICATION.md`](docs/API_SPECIFICATION.md:1)

2. **Set Environment Variables**:
   - `base_url`: `http://localhost:8000/api/v1`
   - `access_token`: (set after login)

3. **Authorization**:
   - Type: Bearer Token
   - Token: `{{access_token}}`

## 5. Using the Django Admin Panel

1. **Create Superuser**:
```bash
sudo docker compose exec backend python manage.py createsuperuser
```

2. **Access Admin Panel**:
```
http://localhost:8000/admin/
```

3. **Login** with superuser credentials

4. **Manage Data**: View and edit users, artisans, commissions, etc.

## 6. API Documentation

### Swagger UI (Interactive):
```
http://localhost:8000/api/schema/swagger-ui/
```

### ReDoc (Documentation):
```
http://localhost:8000/api/schema/redoc/
```

### OpenAPI Schema (JSON):
```
http://localhost:8000/api/schema/
```

## Common API Endpoints

### Authentication
- `POST /api/v1/users/register/` - Register new user
- `POST /api/v1/users/login/` - Login and get tokens
- `POST /api/v1/users/token/refresh/` - Refresh access token
- `GET /api/v1/users/profile/` - Get current user profile
- `PUT /api/v1/users/profile/` - Update user profile

### Artisans
- `GET /api/v1/artisans/` - List all artisans
- `POST /api/v1/artisans/` - Create artisan profile
- `GET /api/v1/artisans/{id}/` - Get artisan details
- `PUT /api/v1/artisans/{id}/` - Update artisan profile
- `GET /api/v1/artisans/{id}/products/` - Get artisan's products

### Products
- `GET /api/v1/artisans/{artisan_id}/products/` - List products
- `POST /api/v1/artisans/{artisan_id}/products/` - Create product
- `GET /api/v1/artisans/{artisan_id}/products/{id}/` - Get product details
- `PUT /api/v1/artisans/{artisan_id}/products/{id}/` - Update product

### Commissions
- `GET /api/v1/commissions/` - List user's commissions
- `POST /api/v1/commissions/` - Create commission request
- `GET /api/v1/commissions/{id}/` - Get commission details
- `PUT /api/v1/commissions/{id}/` - Update commission
- `POST /api/v1/commissions/{id}/accept/` - Accept commission (artisan)
- `POST /api/v1/commissions/{id}/complete/` - Mark as complete

### Invoices
- `GET /api/v1/invoices/` - List user's invoices
- `GET /api/v1/invoices/{id}/` - Get invoice details
- `GET /api/v1/invoices/{id}/pdf/` - Download invoice PDF
- `POST /api/v1/invoices/{id}/mark-paid/` - Mark invoice as paid

## Testing Workflow Example

### Complete User Journey:

1. **Register Designer**:
```bash
curl -X POST http://localhost:8000/api/v1/users/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"designer@test.com","password":"Test123!","password2":"Test123!","first_name":"Jane","last_name":"Doe","user_type":"designer","phone_number":"+254712345678"}'
```

2. **Register Artisan**:
```bash
curl -X POST http://localhost:8000/api/v1/users/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"artisan@test.com","password":"Test123!","password2":"Test123!","first_name":"John","last_name":"Smith","user_type":"artisan","phone_number":"+254712345679"}'
```

3. **Artisan Login & Create Profile**:
```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/users/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"artisan@test.com","password":"Test123!"}' | jq -r '.access')

# Create artisan profile
curl -X POST http://localhost:8000/api/v1/artisans/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bio":"Expert craftsman","specialization":"Woodworking","location":"Nairobi","years_of_experience":5}'
```

4. **Designer Creates Commission**:
```bash
# Designer login
DESIGNER_TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/users/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"designer@test.com","password":"Test123!"}' | jq -r '.access')

# Create commission (replace ARTISAN_ID)
curl -X POST http://localhost:8000/api/v1/commissions/ \
  -H "Authorization: Bearer $DESIGNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"artisan":1,"title":"Custom Table","description":"Oak dining table","budget":"50000","deadline":"2026-06-01"}'
```

## Troubleshooting

### Backend Not Responding:
```bash
sudo docker compose logs backend
```

### Check Backend Health:
```bash
curl http://localhost:8000/admin/
```

### Reset Database:
```bash
sudo docker compose down -v
sudo ./restart-containers.sh
sudo ./create-migrations.sh
```

## Additional Resources

- Full API Documentation: [`docs/API_SPECIFICATION.md`](docs/API_SPECIFICATION.md:1)
- Detailed Testing Guide: [`API_TESTING_GUIDE.md`](API_TESTING_GUIDE.md:1)
- Architecture Overview: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md:1)