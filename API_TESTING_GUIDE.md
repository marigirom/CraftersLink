# CraftersLink API Testing Guide

This guide provides step-by-step instructions for testing the CraftersLink API endpoints using the Docker environment.

## Prerequisites

1. Docker and Docker Compose installed
2. CraftersLink project cloned
3. Environment variables configured (`.env` files)

## Starting the Application

```bash
# From project root
docker-compose up --build
```

Wait for all services to start:
- Database: `crafterslink-db` on port 5432
- Backend: `crafterslink-backend` on port 8000
- Frontend: `crafterslink-frontend` on port 5173

## API Base URL

```
http://localhost:8000/api/v1
```

## Testing Tools

You can use any of these tools:
- **cURL** (command line)
- **Postman** (GUI)
- **HTTPie** (command line, user-friendly)
- **Thunder Client** (VS Code extension)

## 1. Authentication Endpoints

### 1.1 Register a Designer

```bash
curl -X POST http://localhost:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jane_designer",
    "email": "jane@example.com",
    "password": "SecurePass123!",
    "password_confirm": "SecurePass123!",
    "first_name": "Jane",
    "last_name": "Doe",
    "role": "DESIGNER",
    "phone_number": "+254712345678"
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "jane_designer",
      "email": "jane@example.com",
      "role": "DESIGNER",
      ...
    },
    "tokens": {
      "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
      "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
    }
  },
  "message": "User registered successfully"
}
```

**Save the access token for subsequent requests!**

### 1.2 Register an Artisan

```bash
curl -X POST http://localhost:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_artisan",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "password_confirm": "SecurePass123!",
    "first_name": "John",
    "last_name": "Kamau",
    "role": "ARTISAN",
    "phone_number": "+254723456789"
  }'
```

### 1.3 Login

```bash
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "SecurePass123!"
  }'
```

### 1.4 Get Current User

```bash
curl -X GET http://localhost:8000/api/v1/auth/me/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 1.5 Refresh Token

```bash
curl -X POST http://localhost:8000/api/v1/auth/refresh/ \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "YOUR_REFRESH_TOKEN"
  }'
```

## 2. Artisan Profile Endpoints

### 2.1 Create Artisan Profile

**Note:** Must be logged in as an ARTISAN user

```bash
curl -X POST http://localhost:8000/api/v1/artisans/create/ \
  -H "Authorization: Bearer ARTISAN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "I am a skilled soapstone carver from Kisii with over 10 years of experience creating beautiful sculptures and decorative items.",
    "county": "KISII",
    "town": "Kisii Town",
    "craft_specialty": "SOAPSTONE",
    "years_of_experience": 10,
    "business_name": "Kamau Soapstone Crafts",
    "workshop_address": "Kisii Town, near the market",
    "portfolio_images": []
  }'
```

### 2.2 List All Artisans

```bash
curl -X GET "http://localhost:8000/api/v1/artisans/?county=KISII&craft_specialty=SOAPSTONE"
```

### 2.3 Get Artisan Details

```bash
curl -X GET http://localhost:8000/api/v1/artisans/1/
```

### 2.4 Update Artisan Profile

```bash
curl -X PUT http://localhost:8000/api/v1/artisans/1/ \
  -H "Authorization: Bearer ARTISAN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Updated bio with more details...",
    "years_of_experience": 11
  }'
```

## 3. Product Endpoints

### 3.1 Create Product

**Note:** Must be logged in as an ARTISAN user

```bash
curl -X POST http://localhost:8000/api/v1/artisans/products/create/ \
  -H "Authorization: Bearer ARTISAN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hand-carved Soapstone Elephant",
    "description": "Beautiful hand-carved elephant sculpture made from authentic Kisii soapstone. This piece showcases traditional Kenyan craftsmanship with intricate details and smooth finish. Perfect for home or office decoration.",
    "material": "Kisii Soapstone",
    "length_cm": 25.5,
    "width_cm": 15.0,
    "height_cm": 20.0,
    "weight_kg": 2.5,
    "price_kes": 15000.00,
    "status": "COMMISSIONABLE",
    "primary_image": "https://example.com/elephant.jpg",
    "additional_images": [],
    "craft_category": "SOAPSTONE",
    "tags": ["elephant", "sculpture", "soapstone", "handmade"]
  }'
```

### 3.2 List Products

```bash
# All products
curl -X GET http://localhost:8000/api/v1/artisans/products/

# Filter by status and category
curl -X GET "http://localhost:8000/api/v1/artisans/products/?status=COMMISSIONABLE&craft_category=SOAPSTONE"

# Search
curl -X GET "http://localhost:8000/api/v1/artisans/products/?search=elephant"

# Order by price
curl -X GET "http://localhost:8000/api/v1/artisans/products/?ordering=price_kes"
```

### 3.3 Get Product Details

```bash
curl -X GET http://localhost:8000/api/v1/artisans/products/1/
```

### 3.4 Update Product

```bash
curl -X PUT http://localhost:8000/api/v1/artisans/products/1/ \
  -H "Authorization: Bearer ARTISAN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price_kes": 16000.00,
    "status": "IN_STOCK"
  }'
```

### 3.5 Delete Product

```bash
curl -X DELETE http://localhost:8000/api/v1/artisans/products/1/ \
  -H "Authorization: Bearer ARTISAN_ACCESS_TOKEN"
```

## 4. Commission Endpoints

### 4.1 Create Commission

**Note:** Must be logged in as a DESIGNER user

```bash
curl -X POST http://localhost:8000/api/v1/commissions/create/ \
  -H "Authorization: Bearer DESIGNER_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "artisan": 1,
    "reference_product": 1,
    "title": "Custom Soapstone Lion Sculpture",
    "custom_brief": "I would like a custom soapstone lion sculpture similar to the elephant you have in your portfolio. The lion should be in a sitting position, approximately 30cm tall, with detailed mane work. I need this for a client project.",
    "budget_kes": 25000.00,
    "requested_delivery_date": "2026-06-15",
    "attachment_urls": [],
    "notes": "Please use light-colored soapstone if possible"
  }'
```

### 4.2 List Commissions

```bash
# Designer's commissions
curl -X GET http://localhost:8000/api/v1/commissions/ \
  -H "Authorization: Bearer DESIGNER_ACCESS_TOKEN"

# Artisan's commissions
curl -X GET http://localhost:8000/api/v1/commissions/ \
  -H "Authorization: Bearer ARTISAN_ACCESS_TOKEN"

# Filter by status
curl -X GET "http://localhost:8000/api/v1/commissions/?status=PENDING" \
  -H "Authorization: Bearer TOKEN"
```

### 4.3 Get Commission Details

```bash
curl -X GET http://localhost:8000/api/v1/commissions/1/ \
  -H "Authorization: Bearer TOKEN"
```

### 4.4 Accept Commission

**Note:** Must be the artisan

```bash
curl -X POST http://localhost:8000/api/v1/commissions/1/action/ \
  -H "Authorization: Bearer ARTISAN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "accept",
    "agreed_delivery_date": "2026-06-10"
  }'
```

**This will automatically create 5 default milestones!**

### 4.5 Reject Commission

```bash
curl -X POST http://localhost:8000/api/v1/commissions/1/action/ \
  -H "Authorization: Bearer ARTISAN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "reject"
  }'
```

### 4.6 Start Work

```bash
curl -X POST http://localhost:8000/api/v1/commissions/1/action/ \
  -H "Authorization: Bearer ARTISAN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "start_work"
  }'
```

### 4.7 Complete Commission

```bash
curl -X POST http://localhost:8000/api/v1/commissions/1/action/ \
  -H "Authorization: Bearer ARTISAN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "complete"
  }'
```

**This will automatically generate an invoice!**

### 4.8 Cancel Commission

**Note:** Must be the designer

```bash
curl -X POST http://localhost:8000/api/v1/commissions/1/action/ \
  -H "Authorization: Bearer DESIGNER_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "cancel"
  }'
```

## 5. Milestone Endpoints

### 5.1 List Commission Milestones

```bash
curl -X GET http://localhost:8000/api/v1/commissions/1/milestones/ \
  -H "Authorization: Bearer TOKEN"
```

### 5.2 Update Milestone Progress

**Note:** Must be the artisan

```bash
curl -X PATCH http://localhost:8000/api/v1/commissions/milestones/1/ \
  -H "Authorization: Bearer ARTISAN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS",
    "progress_percentage": 50,
    "progress_images": ["https://example.com/progress1.jpg"]
  }'
```

## 6. Invoice Endpoints

### 6.1 List Invoices

```bash
# Designer's invoices
curl -X GET http://localhost:8000/api/v1/invoices/ \
  -H "Authorization: Bearer DESIGNER_ACCESS_TOKEN"

# Artisan's invoices
curl -X GET http://localhost:8000/api/v1/invoices/ \
  -H "Authorization: Bearer ARTISAN_ACCESS_TOKEN"

# Filter by status
curl -X GET "http://localhost:8000/api/v1/invoices/?status=SENT" \
  -H "Authorization: Bearer TOKEN"
```

### 6.2 Get Invoice Details

```bash
curl -X GET http://localhost:8000/api/v1/invoices/1/ \
  -H "Authorization: Bearer TOKEN"
```

### 6.3 Create Invoice Manually

**Note:** Usually auto-created, but can be created manually by artisan

```bash
curl -X POST http://localhost:8000/api/v1/invoices/create/ \
  -H "Authorization: Bearer ARTISAN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "commission": 1,
    "due_date": "2026-07-10",
    "subtotal_kes": 25000.00,
    "tax_percentage": 16.00,
    "line_items": [
      {
        "description": "Custom Soapstone Lion Sculpture",
        "quantity": 1,
        "unit_price": 25000.00,
        "total": 25000.00
      }
    ],
    "notes": "Thank you for your business!",
    "terms_and_conditions": "Payment due within 30 days"
  }'
```

### 6.4 Update Invoice

**Note:** Only draft invoices can be updated

```bash
curl -X PATCH http://localhost:8000/api/v1/invoices/1/update/ \
  -H "Authorization: Bearer ARTISAN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Updated notes",
    "due_date": "2026-07-15"
  }'
```

### 6.5 Send Invoice

**Note:** Must be the artisan

```bash
curl -X POST http://localhost:8000/api/v1/invoices/1/send/ \
  -H "Authorization: Bearer ARTISAN_ACCESS_TOKEN"
```

### 6.6 Mark Invoice as Paid

**Note:** Must be the designer

```bash
curl -X POST http://localhost:8000/api/v1/invoices/1/pay/ \
  -H "Authorization: Bearer DESIGNER_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_method": "M-PESA",
    "payment_reference": "QA12345678"
  }'
```

### 6.7 Download Invoice PDF

```bash
curl -X GET http://localhost:8000/api/v1/invoices/1/download/ \
  -H "Authorization: Bearer TOKEN" \
  --output invoice.pdf
```

## Complete Workflow Example

Here's a complete workflow from registration to invoice payment:

```bash
# 1. Register Designer
DESIGNER_RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"jane_designer","email":"jane@example.com","password":"SecurePass123!","password_confirm":"SecurePass123!","first_name":"Jane","last_name":"Doe","role":"DESIGNER","phone_number":"+254712345678"}')

DESIGNER_TOKEN=$(echo $DESIGNER_RESPONSE | jq -r '.data.tokens.access')

# 2. Register Artisan
ARTISAN_RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"john_artisan","email":"john@example.com","password":"SecurePass123!","password_confirm":"SecurePass123!","first_name":"John","last_name":"Kamau","role":"ARTISAN","phone_number":"+254723456789"}')

ARTISAN_TOKEN=$(echo $ARTISAN_RESPONSE | jq -r '.data.tokens.access')

# 3. Create Artisan Profile
curl -X POST http://localhost:8000/api/v1/artisans/create/ \
  -H "Authorization: Bearer $ARTISAN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bio":"Skilled soapstone carver from Kisii with over 10 years of experience.","county":"KISII","town":"Kisii Town","craft_specialty":"SOAPSTONE","years_of_experience":10,"business_name":"Kamau Crafts","portfolio_images":[]}'

# 4. Create Product
curl -X POST http://localhost:8000/api/v1/artisans/products/create/ \
  -H "Authorization: Bearer $ARTISAN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Soapstone Elephant","description":"Beautiful hand-carved elephant sculpture made from authentic Kisii soapstone with intricate details.","material":"Kisii Soapstone","price_kes":15000.00,"status":"COMMISSIONABLE","primary_image":"https://example.com/elephant.jpg","craft_category":"SOAPSTONE","tags":["elephant","sculpture"]}'

# 5. Designer Creates Commission
curl -X POST http://localhost:8000/api/v1/commissions/create/ \
  -H "Authorization: Bearer $DESIGNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"artisan":1,"title":"Custom Lion Sculpture","custom_brief":"I would like a custom soapstone lion sculpture similar to your elephant. Sitting position, 30cm tall.","budget_kes":25000.00,"requested_delivery_date":"2026-06-15"}'

# 6. Artisan Accepts Commission
curl -X POST http://localhost:8000/api/v1/commissions/1/action/ \
  -H "Authorization: Bearer $ARTISAN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"accept","agreed_delivery_date":"2026-06-10"}'

# 7. Artisan Starts Work
curl -X POST http://localhost:8000/api/v1/commissions/1/action/ \
  -H "Authorization: Bearer $ARTISAN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"start_work"}'

# 8. Artisan Updates Milestone
curl -X PATCH http://localhost:8000/api/v1/commissions/milestones/1/ \
  -H "Authorization: Bearer $ARTISAN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"IN_PROGRESS","progress_percentage":100}'

# 9. Artisan Completes Commission (auto-generates invoice)
curl -X POST http://localhost:8000/api/v1/commissions/1/action/ \
  -H "Authorization: Bearer $ARTISAN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"complete"}'

# 10. Artisan Sends Invoice
curl -X POST http://localhost:8000/api/v1/invoices/1/send/ \
  -H "Authorization: Bearer $ARTISAN_TOKEN"

# 11. Designer Marks as Paid
curl -X POST http://localhost:8000/api/v1/invoices/1/pay/ \
  -H "Authorization: Bearer $DESIGNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"payment_method":"M-PESA","payment_reference":"QA12345678"}'

# 12. Download Invoice PDF
curl -X GET http://localhost:8000/api/v1/invoices/1/download/ \
  -H "Authorization: Bearer $DESIGNER_TOKEN" \
  --output invoice.pdf
```

## Common Issues & Solutions

### 1. Authentication Errors (401)
- **Issue:** Token expired or invalid
- **Solution:** Login again to get a new token or use refresh token

### 2. Permission Errors (403)
- **Issue:** Wrong user role for the action
- **Solution:** Ensure you're using the correct user token (designer vs artisan)

### 3. Validation Errors (400)
- **Issue:** Invalid data in request
- **Solution:** Check the error message and fix the data

### 4. Not Found Errors (404)
- **Issue:** Resource doesn't exist
- **Solution:** Verify the ID in the URL

## Admin Panel

Access the Django admin panel at:
```
http://localhost:8000/admin/
```

Create a superuser:
```bash
docker-compose exec backend python manage.py createsuperuser
```

## Database Access

Access PostgreSQL directly:
```bash
docker-compose exec db psql -U postgres -d crafterslink
```

## Logs

View backend logs:
```bash
docker-compose logs -f backend
```

View all logs:
```bash
docker-compose logs -f
```

## Next Steps

1. Test all endpoints systematically
2. Verify data persistence across container restarts
3. Test error scenarios
4. Verify PDF generation
5. Test file uploads (when implemented)
6. Load test with multiple concurrent requests

## Made with Bob