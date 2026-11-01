-- ENUM
CREATE TYPE user_role      AS ENUM ('ADMIN', 'USER');
CREATE TYPE report_status  AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED');
CREATE TYPE waste_category AS ENUM ('ORGANIC', 'PLASTIC', 'PAPER');

-- TABEL
CREATE TABLE users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,              -- hash bcrypt
  phone      VARCHAR(20),
  role       user_role NOT NULL DEFAULT 'USER',
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  description   TEXT NOT NULL,
  image_url     TEXT NOT NULL,
  latitude      DOUBLE PRECISION NOT NULL CHECK (latitude  BETWEEN -90  AND 90),
  longitude     DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  address       TEXT,
  category      waste_category,                  -- hasil AI (boleh diubah user)
  ai_confidence DOUBLE PRECISION CHECK (ai_confidence BETWEEN 0 AND 1),
  status        report_status NOT NULL DEFAULT 'PENDING',
  admin_note    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE report_status_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id     UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  changed_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
  from_status   report_status,
  to_status     report_status NOT NULL,
  note          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEX
CREATE INDEX idx_reports_user_id    ON reports(user_id);
CREATE INDEX idx_reports_status     ON reports(status);
CREATE INDEX idx_reports_category   ON reports(category);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX idx_logs_report_id     ON report_status_logs(report_id);

-- updated_at otomatis ikut berubah
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at   BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_reports_updated_at BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- KEAMANAN (penting di Supabase): blok akses lewat Data API publik.
-- Backend NestJS konek langsung sebagai owner tabel, jadi tidak terpengaruh.
ALTER TABLE users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports             ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_status_logs  ENABLE ROW LEVEL SECURITY;