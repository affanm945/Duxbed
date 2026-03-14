-- Add type_id column to testimonials table
-- type_id: 1 = Client Testimonials, 2 = Employee Testimonials

ALTER TABLE testimonials 
ADD COLUMN type_id INT DEFAULT 1 COMMENT '1 = Client Testimonials, 2 = Employee Testimonials' 
AFTER id;

-- Update existing testimonials to be client testimonials (type_id = 1)
UPDATE testimonials SET type_id = 1 WHERE type_id IS NULL OR type_id = 0;

-- Add index for better query performance
CREATE INDEX idx_testimonials_type_id ON testimonials(type_id);
