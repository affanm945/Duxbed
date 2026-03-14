-- Migration: Change from 6 product categories to 4
-- Run this on existing database after backup.
-- New categories: Space saving furniture, Duxpod, Interior designing, Modular kitchen

USE duxbed_website;

-- 1. Change product_categories.category_name from ENUM to VARCHAR (if currently ENUM)
ALTER TABLE product_categories 
MODIFY COLUMN category_name VARCHAR(100) NOT NULL UNIQUE;

-- 2. Change products.category from ENUM to VARCHAR (if currently ENUM)
ALTER TABLE products 
MODIFY COLUMN category VARCHAR(100) NOT NULL;

-- 3. Map existing products from old categories to new (adjust mapping as per your preference)
UPDATE products SET category = 'Space saving furniture' WHERE category IN ('Living', 'Outdoor');
UPDATE products SET category = 'Duxpod' WHERE category = 'Office';
UPDATE products SET category = 'Interior designing' WHERE category = 'Bedroom';
UPDATE products SET category = 'Modular kitchen' WHERE category IN ('Dining', 'Modular');

-- 4. Replace product_categories with the 4 new categories
DELETE FROM product_categories;

INSERT INTO product_categories (category_name, display_order, is_active) VALUES
('Space saving furniture', 1, TRUE),
('Duxpod', 2, TRUE),
('Interior designing', 3, TRUE),
('Modular kitchen', 4, TRUE);
