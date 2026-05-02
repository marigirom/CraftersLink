# CraftersLink - REST API Specification

## Overview
This document provides comprehensive API documentation for the CraftersLink platform, including endpoints, request/response formats, authentication, and error handling.

**Base URL:** `http://localhost:8000/api/v1`  
**Production URL:** `https://api.crafterslink.com/api/v1`

---

## Table of Contents
1. [Authentication](#1-authentication)
2. [Artisan Endpoints](#2-artisan-endpoints)
3. [Product Endpoints](#3-product-endpoints)
4. [Commission Endpoints](#4-commission-endpoints)
5. [Milestone Endpoints](#5-milestone-endpoints)
6. [Invoice Endpoints](#6-invoice-endpoints)
7. [File Upload](#7-file-upload)
8. [Error Handling](#8-error-handling)
9. [Rate Limiting](#9-rate-limiting)

---

## 1. Authentication

### 1.1 Register User

**Endpoint:** `POST /auth/register/`

**Description:** Register a new user account (Designer or Artisan)

**Request Body:**
```json
{
  "username": "john_designer",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "password_confirm": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "role": "DESIGNER",
  "phone_number": "+254712345678"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "john_designer",
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "DESIGNER",
      "phone_number": "+254712345678",
      "is_verified": false,
      "created_at": "2026-05-02T10:00:00Z"
    },
    "tokens": {
      "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
      "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
    }
  },
  "message": "User registered successfully"
}
```

**Validation Rules:**
- Username: 3-150 characters, alphanumeric + underscore
- Email: Valid email format, unique
- Password: Min 8 characters, must include uppercase, lowercase, number
- Role: Must be "DESIGNER" or "ARTISAN"
- Phone: Kenyan format (+254XXXXXXXXX)

---

### 1.2 Login

**Endpoint:** `POST /auth/login/`

**Description:** Authenticate user and receive JWT tokens

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "john_designer",
      "email": "john@example.com",
      "role": "DESIGNER",
      "profile_image": "https://cos.ibm.com/bucket/profile_1.jpg"
    },
    "tokens": {
      "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
      "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
    }
  },
  "message": "Login successful"
}
```

**Token Expiry:**
- Access Token: 1 hour
- Refresh Token: 7 days

---

### 1.3 Refresh Token

**Endpoint:** `POST /auth/refresh/`

**Description:** Get new access token using refresh token

**Request Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

---

### 1.4 Get Current User

**Endpoint:** `GET /auth/me/`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "john_designer",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "DESIGNER",
    "phone_number": "+254712345678",
    "profile_image": "https://cos.ibm.com/bucket/profile_1.jpg",
    "is_verified": true,
    "created_at": "2026-05-02T10:00:00Z"
  }
}
```

---

### 1.5 Update Profile

**Endpoint:** `PUT /auth/me/`

**Authentication:** Required

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+254712345678",
  "profile_image": "https://cos.ibm.com/bucket/profile_1_new.jpg"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "john_designer",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "+254712345678",
    "profile_image": "https://cos.ibm.com/bucket/profile_1_new.jpg"
  },
  "message": "Profile updated successfully"
}
```

---

## 2. Artisan Endpoints

### 2.1 List Artisans

**Endpoint:** `GET /artisans/`

**Authentication:** Optional (public endpoint)

**Query Parameters:**
- `county` (string): Filter by county (e.g., "KISII")
- `craft_specialty` (string): Filter by craft (e.g., "SOAPSTONE")
- `min_rating` (decimal): Minimum average rating (0.00-5.00)
- `search` (string): Search in bio and business name
- `ordering` (string): Sort field (e.g., "-average_rating", "created_at")
- `page` (integer): Page number (default: 1)
- `page_size` (integer): Items per page (default: 20, max: 100)

**Example Request:**
```
GET /artisans/?county=KISII&craft_specialty=SOAPSTONE&min_rating=4.0&ordering=-average_rating
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "count": 45,
    "next": "http://localhost:8000/api/v1/artisans/?page=2",
    "previous": null,
    "results": [
      {
        "id": 1,
        "user": {
          "id": 2,
          "username": "mary_artisan",
          "first_name": "Mary",
          "last_name": "Otieno",
          "profile_image": "https://cos.ibm.com/bucket/profile_2.jpg"
        },
        "bio": "Master soapstone carver with 15 years of experience...",
        "county": "KISII",
        "town": "Tabaka",
        "craft_specialty": "SOAPSTONE",
        "years_of_experience": 15,
        "business_name": "Tabaka Carvings Ltd",
        "portfolio_images": [
          "https://cos.ibm.com/bucket/portfolio_1.jpg",
          "https://cos.ibm.com/bucket/portfolio_2.jpg"
        ],
        "average_rating": 4.8,
        "total_commissions": 127,
        "created_at": "2026-01-15T08:30:00Z"
      }
    ]
  }
}
```

---

### 2.2 Get Artisan Details

**Endpoint:** `GET /artisans/{id}/`

**Authentication:** Optional

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user": {
      "id": 2,
      "username": "mary_artisan",
      "first_name": "Mary",
      "last_name": "Otieno",
      "email": "mary@example.com",
      "phone_number": "+254722334455",
      "profile_image": "https://cos.ibm.com/bucket/profile_2.jpg"
    },
    "bio": "Master soapstone carver with 15 years of experience...",
    "county": "KISII",
    "town": "Tabaka",
    "craft_specialty": "SOAPSTONE",
    "years_of_experience": 15,
    "workshop_address": "Tabaka Trading Centre, Kisii County",
    "business_name": "Tabaka Carvings Ltd",
    "business_registration": "BN/2010/12345",
    "portfolio_images": [
      "https://cos.ibm.com/bucket/portfolio_1.jpg",
      "https://cos.ibm.com/bucket/portfolio_2.jpg"
    ],
    "average_rating": 4.8,
    "total_commissions": 127,
    "products_count": 23,
    "created_at": "2026-01-15T08:30:00Z"
  }
}
```

---

### 2.3 Update Artisan Profile

**Endpoint:** `PUT /artisans/{id}/`

**Authentication:** Required (Artisan owner only)

**Request Body:**
```json
{
  "bio": "Updated bio text...",
  "county": "KISII",
  "town": "Tabaka",
  "craft_specialty": "SOAPSTONE",
  "years_of_experience": 16,
  "workshop_address": "New workshop address",
  "business_name": "Tabaka Carvings Ltd",
  "portfolio_images": [
    "https://cos.ibm.com/bucket/portfolio_1.jpg",
    "https://cos.ibm.com/bucket/portfolio_2.jpg"
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "bio": "Updated bio text...",
    "county": "KISII",
    "town": "Tabaka",
    "updated_at": "2026-05-02T11:00:00Z"
  },
  "message": "Artisan profile updated successfully"
}
```

---

## 3. Product Endpoints

### 3.1 List Products

**Endpoint:** `GET /products/`

**Authentication:** Optional

**Query Parameters:**
- `status` (string): Filter by status (IN_STOCK, COMMISSIONABLE, SOLD)
- `craft_category` (string): Filter by category
- `material` (string): Filter by material
- `county` (string): Filter by artisan's county
- `price_min` (decimal): Minimum price in KES
- `price_max` (decimal): Maximum price in KES
- `search` (string): Search in name and description
- `ordering` (string): Sort field (e.g., "-created_at", "price_kes")
- `page` (integer): Page number
- `page_size` (integer): Items per page

**Example Request:**
```
GET /products/?material=Soapstone&county=KISII&status=COMMISSIONABLE&price_min=5000&price_max=20000&ordering=-created_at
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "count": 156,
    "next": "http://localhost:8000/api/v1/products/?page=2",
    "previous": null,
    "results": [
      {
        "id": 1,
        "artisan": {
          "id": 1,
          "business_name": "Tabaka Carvings Ltd",
          "county": "KISII",
          "craft_specialty": "SOAPSTONE",
          "average_rating": 4.8
        },
        "name": "Kisii Soapstone Elephant",
        "description": "Hand-carved elephant from authentic Kisii soapstone...",
        "material": "Soapstone",
        "length_cm": 30.00,
        "width_cm": 15.00,
        "height_cm": 25.00,
        "weight_kg": 2.50,
        "price_kes": 12500.00,
        "status": "COMMISSIONABLE",
        "primary_image": "https://cos.ibm.com/bucket/product_1_primary.jpg",
        "additional_images": [
          "https://cos.ibm.com/bucket/product_1_side.jpg",
          "https://cos.ibm.com/bucket/product_1_back.jpg"
        ],
        "craft_category": "SOAPSTONE",
        "tags": ["traditional", "decorative", "elephant"],
        "views_count": 245,
        "commission_count": 12,
        "created_at": "2026-04-15T09:00:00Z"
      }
    ]
  }
}
```

---

### 3.2 Get Product Details

**Endpoint:** `GET /products/{id}/`

**Authentication:** Optional

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "artisan": {
      "id": 1,
      "user": {
        "first_name": "Mary",
        "last_name": "Otieno"
      },
      "business_name": "Tabaka Carvings Ltd",
      "county": "KISII",
      "town": "Tabaka",
      "craft_specialty": "SOAPSTONE",
      "average_rating": 4.8,
      "total_commissions": 127
    },
    "name": "Kisii Soapstone Elephant",
    "description": "Hand-carved elephant from authentic Kisii soapstone...",
    "material": "Soapstone",
    "length_cm": 30.00,
    "width_cm": 15.00,
    "height_cm": 25.00,
    "weight_kg": 2.50,
    "price_kes": 12500.00,
    "status": "COMMISSIONABLE",
    "primary_image": "https://cos.ibm.com/bucket/product_1_primary.jpg",
    "additional_images": [
      "https://cos.ibm.com/bucket/product_1_side.jpg",
      "https://cos.ibm.com/bucket/product_1_back.jpg"
    ],
    "craft_category": "SOAPSTONE",
    "tags": ["traditional", "decorative", "elephant"],
    "views_count": 246,
    "commission_count": 12,
    "created_at": "2026-04-15T09:00:00Z",
    "updated_at": "2026-05-02T11:15:00Z"
  }
}
```

---

### 3.3 Create Product

**Endpoint:** `POST /products/`

**Authentication:** Required (Artisan only)

**Request Body:**
```json
{
  "name": "Kisii Soapstone Elephant",
  "description": "Hand-carved elephant from authentic Kisii soapstone...",
  "material": "Soapstone",
  "length_cm": 30.00,
  "width_cm": 15.00,
  "height_cm": 25.00,
  "weight_kg": 2.50,
  "price_kes": 12500.00,
  "status": "COMMISSIONABLE",
  "primary_image": "https://cos.ibm.com/bucket/product_1_primary.jpg",
  "additional_images": [
    "https://cos.ibm.com/bucket/product_1_side.jpg"
  ],
  "craft_category": "SOAPSTONE",
  "tags": ["traditional", "decorative", "elephant"]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Kisii Soapstone Elephant",
    "price_kes": 12500.00,
    "status": "COMMISSIONABLE",
    "created_at": "2026-05-02T11:20:00Z"
  },
  "message": "Product created successfully"
}
```

---

### 3.4 Update Product

**Endpoint:** `PUT /products/{id}/`

**Authentication:** Required (Artisan owner only)

**Request Body:** (Same as Create Product)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Kisii Soapstone Elephant",
    "price_kes": 13000.00,
    "updated_at": "2026-05-02T11:25:00Z"
  },
  "message": "Product updated successfully"
}
```

---

### 3.5 Delete Product

**Endpoint:** `DELETE /products/{id}/`

**Authentication:** Required (Artisan owner only)

**Response (204 No Content)**

---

## 4. Commission Endpoints

### 4.1 List Commissions

**Endpoint:** `GET /commissions/`

**Authentication:** Required

**Query Parameters:**
- `status` (string): Filter by status
- `role` (string): Filter by role (as_designer, as_artisan)
- `ordering` (string): Sort field

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "count": 15,
    "results": [
      {
        "id": 1,
        "designer": {
          "id": 1,
          "first_name": "John",
          "last_name": "Doe"
        },
        "artisan": {
          "id": 1,
          "business_name": "Tabaka Carvings Ltd",
          "county": "KISII"
        },
        "reference_product": {
          "id": 1,
          "name": "Kisii Soapstone Elephant",
          "primary_image": "https://cos.ibm.com/bucket/product_1.jpg"
        },
        "title": "Custom Elephant Carving",
        "budget_kes": 15000.00,
        "status": "IN_PROGRESS",
        "requested_delivery_date": "2026-06-15",
        "agreed_delivery_date": "2026-06-10",
        "created_at": "2026-05-01T10:00:00Z"
      }
    ]
  }
}
```

---

### 4.2 Get Commission Details

**Endpoint:** `GET /commissions/{id}/`

**Authentication:** Required (Designer or Artisan involved)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "designer": {
      "id": 1,
      "username": "john_designer",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone_number": "+254712345678"
    },
    "artisan": {
      "id": 1,
      "business_name": "Tabaka Carvings Ltd",
      "user": {
        "first_name": "Mary",
        "last_name": "Otieno",
        "phone_number": "+254722334455"
      },
      "county": "KISII",
      "town": "Tabaka"
    },
    "reference_product": {
      "id": 1,
      "name": "Kisii Soapstone Elephant",
      "primary_image": "https://cos.ibm.com/bucket/product_1.jpg",
      "price_kes": 12500.00
    },
    "title": "Custom Elephant Carving",
    "custom_brief": "I need a custom elephant carving similar to the reference...",
    "budget_kes": 15000.00,
    "requested_delivery_date": "2026-06-15",
    "agreed_delivery_date": "2026-06-10",
    "actual_delivery_date": null,
    "status": "IN_PROGRESS",
    "attachment_urls": [
      "https://cos.ibm.com/bucket/brief_sketch.pdf"
    ],
    "notes": "Client prefers darker soapstone",
    "milestones": [
      {
        "id": 1,
        "name": "Material Sourcing",
        "status": "DELIVERED",
        "progress_percentage": 100
      },
      {
        "id": 2,
        "name": "Work in Progress",
        "status": "IN_PROGRESS",
        "progress_percentage": 60
      }
    ],
    "created_at": "2026-05-01T10:00:00Z",
    "updated_at": "2026-05-02T11:30:00Z"
  }
}
```

---

### 4.3 Create Commission

**Endpoint:** `POST /commissions/`

**Authentication:** Required (Designer only)

**Request Body:**
```json
{
  "artisan_id": 1,
  "reference_product_id": 1,
  "title": "Custom Elephant Carving",
  "custom_brief": "I need a custom elephant carving similar to the reference...",
  "budget_kes": 15000.00,
  "requested_delivery_date": "2026-06-15",
  "attachment_urls": [
    "https://cos.ibm.com/bucket/brief_sketch.pdf"
  ]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Custom Elephant Carving",
    "status": "PENDING",
    "budget_kes": 15000.00,
    "created_at": "2026-05-02T11:35:00Z"
  },
  "message": "Commission request sent to artisan"
}
```

---

### 4.4 Accept Commission

**Endpoint:** `PATCH /commissions/{id}/accept/`

**Authentication:** Required (Artisan only)

**Request Body:**
```json
{
  "agreed_delivery_date": "2026-06-10"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "ACCEPTED",
    "agreed_delivery_date": "2026-06-10"
  },
  "message": "Commission accepted successfully"
}
```

---

### 4.5 Reject Commission

**Endpoint:** `PATCH /commissions/{id}/reject/`

**Authentication:** Required (Artisan only)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "REJECTED"
  },
  "message": "Commission rejected"
}
```

---

### 4.6 Complete Commission

**Endpoint:** `PATCH /commissions/{id}/complete/`

**Authentication:** Required (Artisan only)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "COMPLETED",
    "actual_delivery_date": "2026-06-08"
  },
  "message": "Commission marked as completed. Invoice generated."
}
```

---

## 5. Milestone Endpoints

### 5.1 List Commission Milestones

**Endpoint:** `GET /commissions/{commission_id}/milestones/`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "commission_id": 1,
      "name": "Material Sourcing",
      "description": "Sourcing high-quality soapstone",
      "status": "DELIVERED",
      "progress_percentage": 100,
      "progress_images": [
        "https://cos.ibm.com/bucket/milestone_1_progress.jpg"
      ],
      "expected_completion": "2026-05-05",
      "actual_completion": "2026-05-04T14:30:00Z",
      "order": 1,
      "created_at": "2026-05-01T10:05:00Z"
    },
    {
      "id": 2,
      "name": "Work in Progress",
      "status": "IN_PROGRESS",
      "progress_percentage": 60,
      "progress_images": [
        "https://cos.ibm.com/bucket/milestone_2_progress_1.jpg",
        "https://cos.ibm.com/bucket/milestone_2_progress_2.jpg"
      ],
      "order": 2
    }
  ]
}
```

---

### 5.2 Update Milestone Progress

**Endpoint:** `PATCH /milestones/{id}/update-progress/`

**Authentication:** Required (Artisan only)

**Request Body:**
```json
{
  "progress_percentage": 75,
  "progress_images": [
    "https://cos.ibm.com/bucket/new_progress.jpg"
  ],
  "description": "Carving details completed"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "progress_percentage": 75,
    "progress_images": [
      "https://cos.ibm.com/bucket/milestone_2_progress_1.jpg",
      "https://cos.ibm.com/bucket/milestone_2_progress_2.jpg",
      "https://cos.ibm.com/bucket/new_progress.jpg"
    ],
    "updated_at": "2026-05-02T11:45:00Z"
  },
  "message": "Milestone progress updated"
}
```

---

## 6. Invoice Endpoints

### 6.1 List Invoices

**Endpoint:** `GET /invoices/`

**Authentication:** Required

**Query Parameters:**
- `status` (string): Filter by status
- `ordering` (string): Sort field

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "count": 8,
    "results": [
      {
        "id": 1,
        "commission": {
          "id": 1,
          "title": "Custom Elephant Carving"
        },
        "invoice_number": "INV-2026-0001",
        "issue_date": "2026-06-08",
        "due_date": "2026-07-08",
        "total_kes": 17400.00,
        "status": "SENT",
        "created_at": "2026-06-08T15:00:00Z"
      }
    ]
  }
}
```

---

### 6.2 Get Invoice Details

**Endpoint:** `GET /invoices/{id}/`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "commission": {
      "id": 1,
      "title": "Custom Elephant Carving",
      "designer": {
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com"
      },
      "artisan": {
        "business_name": "Tabaka Carvings Ltd",
        "user": {
          "first_name": "Mary",
          "last_name": "Otieno"
        }
      }
    },
    "invoice_number": "INV-2026-0001",
    "issue_date": "2026-06-08",
    "due_date": "2026-07-08",
    "subtotal_kes": 15000.00,
    "tax_percentage": 16.00,
    "tax_amount_kes": 2400.00,
    "total_kes": 17400.00,
    "status": "SENT",
    "line_items": [
      {
        "description": "Custom soapstone elephant carving",
        "quantity": 1,
        "unit_price": 15000.00,
        "total": 15000.00
      }
    ],
    "payment_method": "",
    "payment_reference": "",
    "paid_date": null,
    "pdf_url": "https://cos.ibm.com/bucket/invoices/INV-2026-0001.pdf",
    "notes": "Payment due within 30 days",
    "terms_and_conditions": "Payment terms: Net 30 days...",
    "created_at": "2026-06-08T15:00:00Z"
  }
}
```

---

### 6.3 Generate Invoice

**Endpoint:** `POST /invoices/`

**Authentication:** Required (Artisan only)

**Request Body:**
```json
{
  "commission_id": 1,
  "due_date": "2026-07-08",
  "line_items": [
    {
      "description": "Custom soapstone elephant carving",
      "quantity": 1,
      "unit_price": 15000.00,
      "total": 15000.00
    }
  ],
  "notes": "Payment due within 30 days",
  "terms_and_conditions": "Payment terms: Net 30 days..."
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "invoice_number": "INV-2026-0001",
    "total_kes": 17400.00,
    "status": "DRAFT",
    "pdf_url": "https://cos.ibm.com/bucket/invoices/INV-2026-0001.pdf"
  },
  "message": "Invoice generated successfully"
}
```

---

### 6.4 Send Invoice

**Endpoint:** `PATCH /invoices/{id}/send/`

**Authentication:** Required (Artisan only)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "SENT"
  },
  "message": "Invoice sent to designer via email"
}
```

---

### 6.5 Mark Invoice as Paid

**Endpoint:** `PATCH /invoices/{id}/mark-paid/`

**Authentication:** Required (Artisan only)

**Request Body:**
```json
{
  "payment_method": "M-Pesa",
  "payment_reference": "QA12BC34DE"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "PAID",
    "payment_method": "M-Pesa",
    "payment_reference": "QA12BC34DE",
    "paid_date": "2026-06-20T10:30:00Z"
  },
  "message": "Invoice marked as paid"
}
```

---

### 6.6 Download Invoice PDF

**Endpoint:** `GET /invoices/{id}/pdf/`

**Authentication:** Required

**Response:** Redirects to IBM COS pre-signed URL for PDF download

---

## 7. File Upload

### 7.1 Upload Image

**Endpoint:** `POST /upload/image/`

**Authentication:** Required

**Request:** `multipart/form-data`

**Form Data:**
- `file`: Image file (JPEG, PNG, WebP)
- `type`: Upload type (profile, product, portfolio, commission, milestone)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "url": "https://cos.ibm.com/bucket/uploads/image_123.jpg",
    "filename": "image_123.jpg",
    "size": 245678,
    "content_type": "image/jpeg"
  },
  "message": "Image uploaded successfully"
}
```

**Validation:**
- Max file size: 5MB
- Allowed types: image/jpeg, image/png, image/webp
- Image dimensions: Min 400x400px, Max 4000x4000px

---

### 7.2 Upload Document

**Endpoint:** `POST /upload/document/`

**Authentication:** Required

**Request:** `multipart/form-data`

**Form Data:**
- `file`: Document file (PDF)
- `type`: Upload type (brief, contract)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "url": "https://cos.ibm.com/bucket/uploads/document_456.pdf",
    "filename": "document_456.pdf",
    "size": 1234567,
    "content_type": "application/pdf"
  },
  "message": "Document uploaded successfully"
}
```

**Validation:**
- Max file size: 10MB
- Allowed types: application/pdf

---

## 8. Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field_name": ["Error detail for this field"]
    }
  }
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation errors |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Common Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Input validation failed |
| `AUTHENTICATION_REQUIRED` | No authentication token provided |
| `INVALID_TOKEN` | Token is invalid or expired |
| `PERMISSION_DENIED` | User lacks required permissions |
| `NOT_FOUND` | Requested resource not found |
| `DUPLICATE_ENTRY` | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `FILE_TOO_LARGE` | Uploaded file exceeds size limit |
| `INVALID_FILE_TYPE` | File type not allowed |

### Example Error Responses

**Validation Error (400):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": ["This field is required"],
      "price_kes": ["Price must be greater than 0"]
    }
  }
}
```

**Authentication Error (401):**
```json
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "Authentication credentials were not provided"
  }
}
```

**Permission Error (403):**
```json
{
  "success": false,
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "You do not have permission to perform this action"
  }
}
```

**Not Found Error (404):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Product with id 999 not found"
  }
}
```

---

## 9. Rate Limiting

### Rate Limits

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Authentication | 5 requests | 1 minute |
| Read Operations (GET) | 100 requests | 1 minute |
| Write Operations (POST/PUT/PATCH) | 30 requests | 1 minute |
| File Uploads | 10 requests | 1 minute |

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1651492800
```

### Rate Limit Exceeded Response (429)

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again in 45 seconds.",
    "retry_after": 45
  }
}
```

---

## 10. Authentication Headers

All authenticated requests must include:

```
Authorization: Bearer <access_token>
```

Example:
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

---

## 11. Pagination

All list endpoints support pagination with the following parameters:

- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 20, max: 100)

Paginated responses include:
```json
{
  "count": 156,
  "next": "http://localhost:8000/api/v1/products/?page=2",
  "previous": null,
  "results": [...]
}
```

---

## 12. Filtering & Search

### Filtering
Use query parameters to filter results:
```
GET /products/?status=COMMISSIONABLE&county=KISII
```

### Search
Use the `search` parameter for text search:
```
GET /products/?search=elephant
```

### Ordering
Use the `ordering` parameter to sort results:
```
GET /products/?ordering=-created_at
GET /artisans/?ordering=average_rating
```

Prefix with `-` for descending order.

---

This API specification provides a complete reference for integrating with the CraftersLink platform.