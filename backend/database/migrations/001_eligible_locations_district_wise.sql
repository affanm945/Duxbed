-- Migration: Switch partnership eligibility from pincode to district-wise (Kerala)
-- Run this on existing database. New installs use updated schema.sql.

-- 1. Add district column to eligible_locations
ALTER TABLE eligible_locations ADD COLUMN district VARCHAR(100) NULL AFTER state;

-- 2. Backfill district from existing city data (Kerala city -> district mapping)
UPDATE eligible_locations SET district = 'Malappuram' WHERE city = 'Melattur' AND state = 'Kerala';
UPDATE eligible_locations SET district = 'Ernakulam' WHERE city = 'Kochi' AND state = 'Kerala';
UPDATE eligible_locations SET district = 'Thrissur' WHERE city = 'Thrissur' AND state = 'Kerala';
UPDATE eligible_locations SET district = 'Kozhikode' WHERE city = 'Calicut' AND state = 'Kerala';
UPDATE eligible_locations SET district = 'Thiruvananthapuram' WHERE city = 'Trivandrum' AND state = 'Kerala';
-- Any other rows: use city as district if not set
UPDATE eligible_locations SET district = COALESCE(district, city) WHERE district IS NULL;

-- 3. Make district NOT NULL and add index for lookups
ALTER TABLE eligible_locations MODIFY COLUMN district VARCHAR(100) NOT NULL;
ALTER TABLE eligible_locations ADD INDEX idx_eligible_district_state (district(50), state(50));

-- 4. Make pincode nullable (no longer used for eligibility check)
ALTER TABLE eligible_locations MODIFY COLUMN pincode VARCHAR(10) NULL;

-- 5. Add district to partnership_inquiries
ALTER TABLE partnership_inquiries ADD COLUMN district VARCHAR(100) NULL AFTER location;

-- 6. Pincode is required: backfill any null pincodes then enforce NOT NULL
UPDATE partnership_inquiries SET pincode = '000000' WHERE pincode IS NULL OR pincode = '';
ALTER TABLE partnership_inquiries MODIFY COLUMN pincode VARCHAR(10) NOT NULL;
