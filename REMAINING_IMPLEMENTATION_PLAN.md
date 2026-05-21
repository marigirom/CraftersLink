# REMAINING IMPLEMENTATION PLAN
## CraftersLink Platform - Complete All Phases

**Status:** Phases 6-10 Implementation Guide  
**Date:** 2026-05-09

---

## ✅ COMPLETED SO FAR

### Phase 6: Separate Dashboards (COMPLETE)
- ✅ `frontend/src/pages/ArtisanDashboard.tsx` - Artisan dashboard (350 lines)
- ✅ `frontend/src/pages/DesignerDashboard.tsx` - Designer dashboard (450 lines)
- ✅ `frontend/src/App.tsx` - Updated with role-specific routes
- ✅ Role-based access control enforced
- ✅ Artisans see only own work
- ✅ Designers can browse all artisans

### Phase 7: Catalogue Management UI (IN PROGRESS)
- ✅ `frontend/src/pages/artisan/MyCatalogue.tsx` - Catalogue list view (330 lines)
- ⏳ Need to create remaining files (see below)

---

## 📋 REMAINING FILES TO CREATE

### Phase 7: Catalogue Management UI (Continued)

#### File 1: `frontend/src/pages/artisan/CatalogueItemForm.tsx`
**Purpose:** Add/Edit catalogue items  
**Features:**
- Form with all fields: title, description, category, price, price_unit, availability
- Image upload (multiple images)
- Form validation
- Create and Update modes
- Preview before save

**Implementation:** ~400 lines

#### File 2: `frontend/src/pages/designer/CatalogueBrowse.tsx`
**Purpose:** Browse all artisan catalogues (read-only for designers)  
**Features:**
- Grid view of all catalogue items from all artisans
- Advanced filters: category, price range, location, availability
- Search functionality
- Sort options: newest, price (low-high, high-low), rating
- Save item button
- Contact artisan button
- Pagination

**Implementation:** ~500 lines

#### File 3: `frontend/src/components/catalogue/CatalogueCard.tsx`
**Purpose:** Reusable catalogue item card  
**Features:**
- Display item image, title, price, artisan name
- Category tag
- Availability badge
- Quick actions: View, Save (for designers), Edit/Delete (for artisans)
- Responsive design

**Implementation:** ~150 lines

#### File 4: `frontend/src/components/catalogue/CatalogueFilters.tsx`
**Purpose:** Filter sidebar for catalogue browse  
**Features:**
- Category checkboxes
- Price range slider
- Location dropdown (Kenyan counties)
- Availability toggles
- Clear filters button
- Apply filters button

**Implementation:** ~200 lines

---

### Phase 8: Database Seed Data

#### File: `backend/apps/common/management/commands/seed_data.py`
**Purpose:** Populate database with realistic test data  
**Data to Create:**

**5 Artisan Users:**
1. John Kamau - Carpenter (Nairobi)
   - Skills: Custom Furniture, Woodworking, Joinery
   - 8 years experience
   - Rating: 4.7

2. Mary Wanjiku - Metalworker (Mombasa)
   - Skills: Gates, Railings, Sculptures
   - 6 years experience
   - Rating: 4.5

3. Peter Omondi - Upholstery (Kisumu)
   - Skills: Sofas, Chairs, Cushions
   - 10 years experience
   - Rating: 4.8

4. Grace Akinyi - Ceramics (Nakuru)
   - Skills: Tiles, Pottery, Sinks
   - 5 years experience
   - Rating: 4.6

5. David Mwangi - Textile Artist (Eldoret)
   - Skills: Curtains, Rugs, Wall Hangings
   - 7 years experience
   - Rating: 4.4

**3 Interior Designer Users:**
1. Sarah Njeri - Residential Design (Nairobi)
   - Company: Njeri Interiors
   - 12 projects completed

2. James Otieno - Commercial Design (Mombasa)
   - Company: Otieno Design Studio
   - 25 projects completed

3. Lucy Wambui - Hospitality Design (Nairobi)
   - Company: Wambui Spaces
   - 18 projects completed

**15-20 Catalogue Items with Kenyan Pricing:**

**Furniture (John Kamau):**
- Custom Dining Table (6-seater) - KES 45,000
- Mahogany Coffee Table - KES 28,000
- Oak Bookshelf - KES 35,000
- Bedside Tables (pair) - KES 18,000

**Metalwork (Mary Wanjiku):**
- Decorative Gate - KES 85,000
- Balcony Railing (per meter) - KES 3,500/sqm
- Garden Sculpture - KES 25,000

**Upholstery (Peter Omondi):**
- 3-Seater Sofa - KES 65,000
- Accent Chair - KES 22,000
- Custom Cushions (set of 4) - KES 6,500

**Ceramics (Grace Akinyi):**
- Bathroom Tiles (per sqm) - KES 2,800/sqm
- Kitchen Backsplash Tiles - KES 3,200/sqm
- Decorative Pottery Set - KES 8,500

**Textiles (David Mwangi):**
- Blackout Curtains (per panel) - KES 4,500
- Hand-woven Rug (2x3m) - KES 15,000
- Wall Hanging - KES 7,500

**5 Sample Commissions:**
- Sarah → John: Custom dining set
- James → Mary: Office gate installation
- Lucy → Peter: Hotel lobby furniture
- Sarah → Grace: Residential bathroom tiles
- James → David: Restaurant curtains

**Sample Notifications:**
- New commission notifications for artisans
- Commission status updates for designers
- Profile view notifications
- Saved item notifications

**Implementation:** ~300 lines

---

### Phase 9: Docker Configuration Updates

#### File 1: `backend/Dockerfile` (UPDATE)
**Changes Needed:**
```dockerfile
# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8000/api/v1/health/')"

# Add entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["docker-entrypoint.sh"]
```

#### File 2: `backend/docker-entrypoint.sh` (CREATE)
**Purpose:** Auto-run migrations and seed data on startup  
**Content:**
```bash
#!/bin/bash
set -e

echo "Waiting for PostgreSQL..."
while ! pg_isready -h db -p 5432 -U $POSTGRES_USER; do
  sleep 1
done

echo "Running migrations..."
python manage.py makemigrations
python manage.py migrate

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Creating superuser if not exists..."
python manage.py shell << END
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(email='admin@crafterslink.com').exists():
    User.objects.create_superuser(
        email='admin@crafterslink.com',
        password='admin123',
        full_name='Admin User'
    )
    print('Superuser created')
else:
    print('Superuser already exists')
END

echo "Seeding database if empty..."
python manage.py seed_data

exec "$@"
```

#### File 3: `frontend/Dockerfile` (UPDATE)
**Changes Needed:**
```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### File 4: `docker-compose.yml` (UPDATE)
**Changes Needed:**
```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-crafterslink}
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - crafterslink-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    command: gunicorn crafterslink.wsgi:application --bind 0.0.0.0:8000 --workers 4
    volumes:
      - ./backend:/app
      - media_files:/app/media
      - static_files:/app/staticfiles
    ports:
      - "8000:8000"
    environment:
      - DEBUG=${DEBUG:-False}
      - SECRET_KEY=${SECRET_KEY}
      - DATABASE_URL=postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-postgres}@db:5432/${POSTGRES_DB:-crafterslink}
      - ALLOWED_HOSTS=${ALLOWED_HOSTS:-localhost,127.0.0.1}
      - CORS_ALLOWED_ORIGINS=${CORS_ALLOWED_ORIGINS:-http://localhost:3000}
    depends_on:
      db:
        condition: service_healthy
    networks:
      - crafterslink-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/v1/health/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        VITE_API_BASE_URL: ${VITE_API_BASE_URL:-http://localhost:8000}
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - crafterslink-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:80/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 5s

volumes:
  postgres_data:
  media_files:
  static_files:

networks:
  crafterslink-network:
    driver: bridge
```

#### File 5: `.env.example` (UPDATE)
**Add all new environment variables with documentation**

---

### Phase 10: Additional Pages

#### File 1: `frontend/src/pages/artisan/Orders.tsx`
**Purpose:** View and manage orders/commissions  
**Features:**
- List of all commissions
- Filter by status
- Accept/Decline actions
- View details
- Send messages

#### File 2: `frontend/src/pages/artisan/Profile.tsx`
**Purpose:** Edit artisan profile  
**Features:**
- Edit personal info
- Update skills
- Upload portfolio images
- Set availability

#### File 3: `frontend/src/pages/designer/SavedItems.tsx`
**Purpose:** View all saved items  
**Features:**
- Grid of saved items
- Remove from saved
- Add to project
- Contact artisan

#### File 4: `frontend/src/pages/designer/Projects.tsx`
**Purpose:** Manage design projects  
**Features:**
- Create new project
- Add items to project
- Share project
- Export project

#### File 5: `frontend/src/pages/designer/Enquiries.tsx`
**Purpose:** View sent enquiries  
**Features:**
- List of enquiries
- Filter by status
- View responses
- Follow up

#### File 6: `frontend/src/pages/Notifications.tsx`
**Purpose:** View all notifications  
**Features:**
- List all notifications
- Mark as read
- Filter by type
- Delete notifications

---

## 🚀 IMPLEMENTATION PRIORITY

### HIGH PRIORITY (Must Have)
1. ✅ Artisan Dashboard
2. ✅ Designer Dashboard
3. ✅ MyCatalogue list view
4. ⏳ CatalogueItemForm (add/edit)
5. ⏳ CatalogueBrowse (designer)
6. ⏳ Seed data command

### MEDIUM PRIORITY (Should Have)
7. ⏳ Docker configuration updates
8. ⏳ CatalogueCard component
9. ⏳ CatalogueFilters component
10. ⏳ Orders page
11. ⏳ SavedItems page

### LOW PRIORITY (Nice to Have)
12. ⏳ Profile pages
13. ⏳ Projects page
14. ⏳ Enquiries page
15. ⏳ Notifications page

---

## 📝 QUICK IMPLEMENTATION GUIDE

### For Each Remaining File:

1. **Create the file** in the correct directory
2. **Import necessary dependencies** (React, Carbon components, API client)
3. **Define TypeScript interfaces** for data structures
4. **Implement state management** (useState, useEffect)
5. **Create API integration** (fetch data, submit forms)
6. **Build UI components** (forms, tables, cards)
7. **Add error handling** (try-catch, error states)
8. **Add loading states** (Loading component)
9. **Implement responsive design** (Tailwind classes)
10. **Test functionality** (manual testing)

### For Seed Data:

1. **Create management command** structure
2. **Define data arrays** (users, profiles, items)
3. **Implement creation logic** (create users, profiles, items)
4. **Add error handling** (check if exists, handle duplicates)
5. **Add console output** (progress messages)
6. **Test command** (`python manage.py seed_data`)

### For Docker:

1. **Update Dockerfiles** (add health checks, entrypoint)
2. **Create entrypoint script** (migrations, seed, superuser)
3. **Update docker-compose.yml** (health checks, depends_on)
4. **Update .env.example** (document all variables)
5. **Test deployment** (`docker-compose up --build`)

---

## ✅ COMPLETION CHECKLIST

### Phase 7: Catalogue Management
- [x] MyCatalogue list view
- [ ] CatalogueItemForm (add/edit)
- [ ] CatalogueBrowse (designer)
- [ ] CatalogueCard component
- [ ] CatalogueFilters component

### Phase 8: Seed Data
- [ ] seed_data.py command
- [ ] 5 artisan users
- [ ] 3 designer users
- [ ] 15-20 catalogue items
- [ ] 5 sample commissions
- [ ] Sample notifications

### Phase 9: Docker
- [ ] Update backend Dockerfile
- [ ] Create docker-entrypoint.sh
- [ ] Update frontend Dockerfile
- [ ] Update docker-compose.yml
- [ ] Update .env.example

### Phase 10: Additional Pages
- [ ] Artisan Orders page
- [ ] Artisan Profile page
- [ ] Designer SavedItems page
- [ ] Designer Projects page
- [ ] Designer Enquiries page
- [ ] Notifications page

---

## 🎯 ESTIMATED COMPLETION TIME

- **Phase 7 (Catalogue UI):** 4-6 hours
- **Phase 8 (Seed Data):** 2-3 hours
- **Phase 9 (Docker):** 2-3 hours
- **Phase 10 (Additional Pages):** 6-8 hours

**Total:** 14-20 hours of development time

---

## 📚 RESOURCES

- **Carbon Design System:** https://carbondesignsystem.com/
- **React Router:** https://reactrouter.com/
- **Django Management Commands:** https://docs.djangoproject.com/en/4.2/howto/custom-management-commands/
- **Docker Multi-stage Builds:** https://docs.docker.com/build/building/multi-stage/

---

**This plan provides a complete roadmap to finish all remaining phases. Each file is documented with purpose, features, and estimated lines of code.**