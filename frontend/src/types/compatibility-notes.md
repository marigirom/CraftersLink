# Backend-Frontend Type Compatibility Notes

## Critical Mismatches Found

### ArtisanProfile Interface Mismatches

**Frontend expects:**
- `specialization` (string)
- `location` (string)
- `rating` (number)
- `verified` (boolean)

**Backend provides:**
- `craft_specialty` (string with choices)
- `county` (string with choices) + `town` (string)
- `average_rating` (decimal)
- No `verified` field in ArtisanProfile model

### Commission Interface Mismatches

**Frontend expects:**
- `budget` (string)
- `deadline` (string)
- `requirements` (string)
- `reference_images` (array)

**Backend provides:**
- `budget_kes` (decimal)
- `requested_delivery_date` (date)
- `custom_brief` (text)
- `reference_images` (JSONField)

## Search Parameter Compatibility

**Backend artisan search supports:**
- `search` parameter: searches `user__first_name`, `user__last_name`, `bio`, `business_name`
- `county` filter
- `craft_specialty` filter

**Frontend search uses:**
- `search` parameter ✓ (compatible)
- `specialization` filter ✗ (should be `craft_specialty`)
- `location` filter ✗ (should be `county`)

## Recommendations

1. Update frontend TypeScript interfaces to match backend field names
2. Add field mapping in serializers or create adapter functions
3. Update mock data to use correct field names
4. Ensure search parameters match backend filter fields