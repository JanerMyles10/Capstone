-- Add city and postal_code columns to data table
ALTER TABLE data
ADD COLUMN city VARCHAR(100) DEFAULT NULL AFTER address,
ADD COLUMN postal_code VARCHAR(20) DEFAULT NULL AFTER city; 