-- Add city and postal_code columns to data table
ALTER TABLE data
ADD COLUMN city VARCHAR(100) AFTER address,
ADD COLUMN postal_code VARCHAR(20) AFTER city;

-- Update existing records with default values if needed
UPDATE data 
SET city = 'Manila' 
WHERE city IS NULL;

UPDATE data 
SET postal_code = '1000' 
WHERE postal_code IS NULL; 