-- Brochures Table Schema
-- Run this SQL script to create the brochures table for downloadable PDFs

USE duxbed_website;

-- Brochures Table
CREATE TABLE IF NOT EXISTS brochures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INT,
    file_type VARCHAR(50) DEFAULT 'application/pdf',
    sector VARCHAR(100),
    display_order INT DEFAULT 0,
    download_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Example: Insert a sample brochure (replace with actual file)
-- INSERT INTO brochures (title, description, file_path, file_name, file_size, file_type, sector, display_order) 
-- VALUES (
--     'Product Catalog 2025',
--     'Download our comprehensive product catalog featuring our latest collections and designs.',
--     'product_catalog_2025.pdf',
--     'Product Catalog 2025.pdf',
--     5242880,
--     'application/pdf',
--     NULL,
--     1
-- );

