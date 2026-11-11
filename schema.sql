-- ====================================================================
-- Sweety - Blood Glucose Tracker (Kenpath Assignment)
-- PostgreSQL Database Schema
-- ====================================================================

-- Create custom enum for the 4 required glucose measurement time slots
CREATE TYPE time_slot_enum AS ENUM (
    'Morning (fasting)',
    'After breakfast',
    'After lunch',
    'After dinner'
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'patient', -- 'patient' or 'doctor'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index on user email for fast authentication lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Blood glucose readings table
CREATE TABLE IF NOT EXISTS readings (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time_slot time_slot_enum NOT NULL,
    value INTEGER NOT NULL CHECK (value >= 40 AND value <= 600), -- Whole number between 40 and 600 mg/dl
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraint: Only one reading per slot per day for a user
    CONSTRAINT unique_user_date_slot UNIQUE (user_id, date, time_slot)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_readings_user_date ON readings(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_readings_user_range ON readings(user_id, date);

-- Function and trigger to enforce maximum 4 readings per day per user
CREATE OR REPLACE FUNCTION enforce_max_four_readings_per_day()
RETURNS TRIGGER AS $$
DECLARE
    daily_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO daily_count
    FROM readings
    WHERE user_id = NEW.user_id AND date = NEW.date AND id != NEW.id;

    IF daily_count >= 4 THEN
        RAISE EXCEPTION 'You can add only 4 readings per day.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_max_readings ON readings;
CREATE TRIGGER trg_check_max_readings
BEFORE INSERT OR UPDATE ON readings
FOR EACH ROW
EXECUTE FUNCTION enforce_max_four_readings_per_day();
