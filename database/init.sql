-- Database initialization script
-- Runs on first PostgreSQL container startup

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('USER', 'ADMIN', 'MODERATOR');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE auth_provider AS ENUM ('LOCAL', 'GOOGLE', 'GITHUB', 'MICROSOFT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE project_status AS ENUM ('DRAFT', 'PROCESSING', 'COMPLETED', 'FAILED', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE project_type AS ENUM ('VIDEO_TO_CARTOON', 'AFRICAN_CARTOON_GENERATOR', 'TEXT_TO_CARTOON', 'IMAGE_TO_CARTOON');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE job_status AS ENUM ('PENDING', 'QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE job_type AS ENUM ('VIDEO_TO_CARTOON', 'TEXT_TO_CARTOON', 'LIP_SYNC', 'SUBTITLES', 'UPSCALE', 'BACKGROUND_REMOVAL', 'VOICE_CLONE', 'TRANSLATION');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE asset_type AS ENUM ('VIDEO', 'IMAGE', 'AUDIO', 'MODEL', 'STYLE', 'CHARACTER', 'BACKGROUND', 'CLOTHING', 'ACCESSORY', 'MUSIC', 'SOUND_EFFECT', 'SUBTITLE', 'SCRIPT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE export_format AS ENUM ('MP4', 'MOV', 'GIF', 'WEBM');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE export_quality AS ENUM ('LOW_480P', 'MEDIUM_720P', 'HIGH_1080P', 'ULTRA_2K', 'ULTRA_4K');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE animation_style AS ENUM ('ANIME', 'COMIC', 'PIXAR_STYLE', 'DISNEY_STYLE', 'AFRICAN_CARTOON', 'MANGA', 'CHIBI', 'GHIBLI_STYLE', 'CYBERPUNK', 'FANTASY', 'WATERCOLOR', 'OIL_PAINTING', 'PENCIL_SKETCH', 'CLAYMATION', 'LEGO_STYLE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Create indexes for better performance
-- (These will be created by Prisma migrations, but we can add custom ones here)

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';