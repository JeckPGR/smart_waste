-- =========================================================================
-- SMART WASTE MANAGEMENT SYSTEM - DATABASE INITIALIZATION SCRIPT (DDL)
-- Engine: PostgreSQL 16+
-- =========================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CUSTOM ENUM TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('ADMIN', 'USER');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE report_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE waste_category AS ENUM ('ORGANIC', 'PLASTIC', 'PAPER');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 3. TABLES DEFINITION
-- 3.1. Tabel Users
CREATE TABLE IF NOT EXISTS users (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(150) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,              -- Hash bcrypt
    phone      VARCHAR(20),
    role       user_role NOT NULL DEFAULT 'USER',
    is_active  BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.2. Tabel Reports (Laporan Sampah Masuk)
CREATE TABLE IF NOT EXISTS reports (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    description   TEXT NOT NULL,
    image_url     TEXT NOT NULL,
    latitude      DOUBLE PRECISION NOT NULL CHECK (latitude BETWEEN -90 AND 90),
    longitude     DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    address       TEXT,
    category      waste_category,                  -- Klasifikasi AI (Organik, Plastik, Kertas)
    ai_confidence DOUBLE PRECISION CHECK (ai_confidence BETWEEN 0 AND 1),
    status        report_status NOT NULL DEFAULT 'PENDING',
    admin_note    TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.3. Tabel Report Status Logs (Audit Trail Perubahan Status)
CREATE TABLE IF NOT EXISTS report_status_logs (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id     UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    changed_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    from_status   report_status,
    to_status     report_status NOT NULL,
    note          TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_reports_user_id    ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status     ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_category   ON reports(category);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_report_id     ON report_status_logs(report_id);

-- 5. AUTO-UPDATE TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION set_updated_at() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_reports_updated_at ON reports;
CREATE TRIGGER trg_reports_updated_at 
    BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 6. INITIAL SEED DATA (Default Accounts)
-- Admin (Password: Admin123!)
INSERT INTO users (name, email, password, role)
VALUES (
    'Administrator',
    'admin@smartwaste.id',
    '$2b$10$pwNXEZ7j.RtmARCy.2NH1.akS4XO4aFtyH7DdWmwNffSjl.8SDeUW',
    'ADMIN'
)
ON CONFLICT (email) DO NOTHING;

-- Warga (Password: Warga123!)
INSERT INTO users (name, email, password, role)
VALUES (
    'Warga',
    'warga@smartwaste.id',
    '$2b$10$JvFNCrPMhkJFCncTIv16LOIyswkutGg/gaKK5RJ38UQfONxRZnuY2',
    'USER'
)
ON CONFLICT (email) DO NOTHING;
