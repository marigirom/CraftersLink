# MIGRATION INSTRUCTIONS
## Generate and Apply New Migrations

**Issue:** New models (DesignerProfile, SavedItem, Notification) need migrations created.

**✅ NO NEED TO STOP CONTAINERS** - Migrations can be run while containers are running!

---

## STEP 1: Generate Migrations

Run this command to create the migration files (containers stay running):

```bash
sudo docker-compose exec backend python manage.py makemigrations
```

**Expected Output:**
```
Migrations for 'users':
  backend/apps/users/migrations/0002_designerprofile.py
    - Create model DesignerProfile
Migrations for 'common':
  backend/apps/common/migrations/0001_initial.py
    - Create model SavedItem
    - Create model Notification
```

---

## STEP 2: Apply Migrations

After generating migrations, apply them:

```bash
sudo docker-compose exec backend python manage.py migrate
```

**Expected Output:**
```
Running migrations:
  Applying users.0002_designerprofile... OK
  Applying common.0001_initial... OK
```

---

## STEP 3: Verify Migrations

Check that all migrations are applied:

```bash
sudo docker-compose exec backend python manage.py showmigrations
```

**Expected Output:**
All migrations should have [X] marks indicating they're applied.

---

## QUICK REFERENCE

**Two commands while containers are running:**

```bash
# 1. Generate migrations
sudo docker-compose exec backend python manage.py makemigrations

# 2. Apply migrations
sudo docker-compose exec backend python manage.py migrate
```

**That's it! No restart needed.**

---

## TROUBLESHOOTING

### Issue: "No changes detected"
**Cause:** Models already have migrations or Docker not seeing changes  
**Solution:**
```bash
# Rebuild backend container
sudo docker-compose build backend
sudo docker-compose up -d backend
# Try again
sudo docker-compose exec backend python manage.py makemigrations
```

### Issue: "Table already exists"
**Cause:** Tables created manually or from previous attempts  
**Solution:**
```bash
# Fake the initial migration
sudo docker-compose exec backend python manage.py migrate --fake-initial
```

### Issue: Permission denied
**Cause:** Need sudo for docker-compose  
**Solution:** Always prefix with `sudo`

---

## VERIFICATION

After migrations are applied, verify the new tables exist:

```bash
sudo docker-compose exec backend python manage.py dbshell
```

Then in the PostgreSQL shell:
```sql
-- Check tables exist
\dt

-- Should see:
-- users_designerprofile
-- common_saveditem
-- common_notification

-- Exit
\q
```

---

## WHAT THESE MIGRATIONS DO

### DesignerProfile Migration
Creates table for interior designer profiles with:
- company_name
- specialisation (residential/commercial/hospitality/mixed)
- projects_completed
- portfolio_images (array)
- created_at, updated_at

### SavedItem Migration
Creates table for designers to save catalogue items:
- designer (FK to DesignerProfile)
- catalogue_item (FK to CatalogueItem)
- saved_at
- Unique constraint on (designer, catalogue_item)

### Notification Migration
Creates table for user notifications:
- user (FK to User)
- type (new_commission/commission_update/profile_view/saved_item)
- message
- is_read
- reference_id
- created_at

---

## NEXT STEPS AFTER MIGRATIONS

1. **Test the new endpoints:**
   ```bash
   # Get designer profile
   curl -H "Authorization: Bearer TOKEN" \
     http://localhost:8000/api/v1/auth/designer/profile/
   
   # Save an item
   curl -X POST -H "Authorization: Bearer TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"catalogue_item": 1}' \
     http://localhost:8000/api/v1/saved/
   
   # Get notifications
   curl -H "Authorization: Bearer TOKEN" \
     http://localhost:8000/api/v1/notifications/
   ```

2. **Continue with remaining tasks:**
   - Create separate dashboards
   - Implement catalogue UI
   - Create seed data
   - Update Docker configuration

---

**Need Help?** Check the logs:
```bash
sudo docker-compose logs backend | tail -50