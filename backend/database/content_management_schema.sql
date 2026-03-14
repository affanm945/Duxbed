-- Content Management Tables for About Us, Our Story, and Leadership
-- Run this SQL script to add tables for dynamic content management

USE duxbed_website;

-- About Us Content Table
CREATE TABLE IF NOT EXISTS about_us_content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    section_key VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255),
    content TEXT,
    image_url VARCHAR(500),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Our Story Timeline Events Table
CREATE TABLE IF NOT EXISTS story_timeline (
    id INT AUTO_INCREMENT PRIMARY KEY,
    year INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    video_url VARCHAR(500),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Leadership Profiles Table
CREATE TABLE IF NOT EXISTS leadership_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    position VARCHAR(255) NOT NULL,
    bio TEXT,
    image_url VARCHAR(500),
    email VARCHAR(100),
    linkedin_url VARCHAR(500),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Why Duxbed USPs Table
CREATE TABLE IF NOT EXISTS why_duxbed_usps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    icon VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default About Us sections
INSERT INTO about_us_content (section_key, title, content, display_order) VALUES
('welcome', 'Welcome to Duxbed', 'Welcome to Duxbed Furniture, a place where furniture is crafted for comfort. At Duxbed, you get to enjoy a variety of high-quality furnishings in the comfort of your home.', 1),
('core_purpose', 'Our Core Purpose', 'To create the updated lifestyle', 2),
('mission', 'Our Mission', 'Our mission is to transform houses into dream homes through quality furniture and exceptional service.', 3),
('vision', 'Our Vision', 'To be the leading furniture brand that combines craftsmanship, innovation, and customer satisfaction.', 4),
('values', 'Our Values', 'Quality, Integrity, Innovation, and Customer Focus are the core values that drive everything we do.', 5);

-- Insert default USPs
INSERT INTO why_duxbed_usps (icon, title, description, display_order) VALUES
('bi-tools', 'Superior Craftsmanship', 'Every piece is meticulously crafted by skilled artisans using premium materials and time-tested techniques.', 1),
('bi-lightbulb', 'Innovation', 'We continuously innovate with new designs, materials, and manufacturing processes to stay ahead of trends.', 2),
('bi-shield-check', 'Premium Materials', 'We use only the finest materials, ensuring durability and long-lasting beauty in every product.', 3),
('bi-person-heart', 'Service Excellence', 'Our dedicated team provides exceptional customer service from consultation to after-sales support.', 4),
('bi-trophy', 'Awards & Recognition', 'Our commitment to excellence has earned us numerous industry awards and customer satisfaction accolades.', 5),
('bi-emoji-smile', 'Customer Satisfaction', 'Thousands of satisfied customers trust Duxbed for their furniture and interior needs.', 6);

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

