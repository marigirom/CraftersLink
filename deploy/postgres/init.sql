-- PostgreSQL initialization script for CraftersLink

-- Create database if not exists (handled by Docker environment variables)
-- This file can contain additional initialization SQL if needed

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Set timezone
SET timezone = 'Africa/Nairobi';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE crafterslink TO postgres;

-- Made with Bob
