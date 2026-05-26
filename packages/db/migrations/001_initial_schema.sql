-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE family_role AS ENUM ('mother', 'father', 'family', 'viewer');
CREATE TYPE record_type AS ENUM ('diary', 'photo', 'exam', 'symptom', 'emotion');
CREATE TYPE visibility_type AS ENUM ('family', 'couple', 'private');
CREATE TYPE ai_analysis_type AS ENUM ('ultrasound', 'lab_result', 'weekly_summary');

-- Profiles (extends Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Pregnancies (core family unit)
CREATE TABLE pregnancies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  due_date DATE NOT NULL,
  last_menstrual_period DATE NOT NULL,
  baby_nickname TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Family members
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pregnancy_id UUID NOT NULL REFERENCES pregnancies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role family_role NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(pregnancy_id, user_id)
);

-- Invitation codes
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pregnancy_id UUID NOT NULL REFERENCES pregnancies(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  role family_role NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  used_by UUID REFERENCES profiles(id)
);

-- Weekly guide content (seed data for weeks 5-40)
CREATE TABLE weekly_content (
  week_number INTEGER PRIMARY KEY CHECK (week_number BETWEEN 5 AND 40),
  baby_info JSONB NOT NULL DEFAULT '{}',
  mom_info JSONB NOT NULL DEFAULT '{}',
  essay TEXT,
  checklist JSONB NOT NULL DEFAULT '[]',
  exam_info JSONB,
  illustration_url TEXT
);

-- Records (unified table for all 5 record types)
CREATE TABLE records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pregnancy_id UUID NOT NULL REFERENCES pregnancies(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type record_type NOT NULL,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  week_number INTEGER,
  visibility visibility_type NOT NULL DEFAULT 'family',
  content JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Couple notes (secret diary for mother & father only)
CREATE TABLE couple_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pregnancy_id UUID NOT NULL REFERENCES pregnancies(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- AI analysis results cache
CREATE TABLE ai_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  record_id UUID NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  type ai_analysis_type NOT NULL,
  result JSONB NOT NULL DEFAULT '{}',
  model_version TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Auto-calculate week_number from record_date + pregnancy LMP
CREATE OR REPLACE FUNCTION calculate_week_number()
RETURNS TRIGGER AS $$
DECLARE
  lmp DATE;
BEGIN
  SELECT last_menstrual_period INTO lmp
  FROM pregnancies
  WHERE id = NEW.pregnancy_id;

  IF lmp IS NOT NULL THEN
    NEW.week_number := FLOOR((NEW.record_date - lmp) / 7) + 1;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER records_calculate_week
  BEFORE INSERT OR UPDATE OF record_date, pregnancy_id
  ON records
  FOR EACH ROW
  EXECUTE FUNCTION calculate_week_number();

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pregnancies_updated_at
  BEFORE UPDATE ON pregnancies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER records_updated_at
  BEFORE UPDATE ON records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pregnancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE records ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;

-- Helper function: get user's role in a pregnancy
CREATE OR REPLACE FUNCTION get_my_role(p_pregnancy_id UUID)
RETURNS family_role AS $$
  SELECT role FROM family_members
  WHERE pregnancy_id = p_pregnancy_id AND user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- profiles: users can read their own + pregnancy family members
CREATE POLICY "profiles_select" ON profiles FOR SELECT
  USING (
    id = auth.uid() OR
    id IN (
      SELECT fm.user_id FROM family_members fm
      WHERE fm.pregnancy_id IN (
        SELECT pregnancy_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  USING (id = auth.uid());

-- pregnancies: only family members can view
CREATE POLICY "pregnancies_select" ON pregnancies FOR SELECT
  USING (
    id IN (SELECT pregnancy_id FROM family_members WHERE user_id = auth.uid())
  );

CREATE POLICY "pregnancies_insert" ON pregnancies FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "pregnancies_update" ON pregnancies FOR UPDATE
  USING (owner_id = auth.uid());

-- family_members: members can see their own pregnancy's members
CREATE POLICY "family_members_select" ON family_members FOR SELECT
  USING (
    pregnancy_id IN (SELECT pregnancy_id FROM family_members WHERE user_id = auth.uid())
  );

CREATE POLICY "family_members_insert" ON family_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- invitations: pregnancy owners can create; anyone can read by code
CREATE POLICY "invitations_select" ON invitations FOR SELECT
  USING (
    pregnancy_id IN (SELECT pregnancy_id FROM family_members WHERE user_id = auth.uid())
    OR used_at IS NULL -- allow reading by code for joining
  );

CREATE POLICY "invitations_insert" ON invitations FOR INSERT
  WITH CHECK (
    get_my_role(pregnancy_id) IN ('mother', 'father')
  );

CREATE POLICY "invitations_update" ON invitations FOR UPDATE
  USING (
    pregnancy_id IN (SELECT pregnancy_id FROM family_members WHERE user_id = auth.uid())
  );

-- weekly_content: public read
CREATE POLICY "weekly_content_select" ON weekly_content FOR SELECT
  USING (true);

-- records: visibility-based access
CREATE POLICY "records_select" ON records FOR SELECT
  USING (
    CASE
      WHEN visibility = 'private' THEN author_id = auth.uid()
      WHEN visibility = 'couple' THEN get_my_role(pregnancy_id) IN ('mother', 'father')
      WHEN visibility = 'family' THEN pregnancy_id IN (
        SELECT pregnancy_id FROM family_members WHERE user_id = auth.uid()
      )
      ELSE false
    END
  );

CREATE POLICY "records_insert" ON records FOR INSERT
  WITH CHECK (
    author_id = auth.uid() AND
    pregnancy_id IN (SELECT pregnancy_id FROM family_members WHERE user_id = auth.uid())
  );

CREATE POLICY "records_update" ON records FOR UPDATE
  USING (author_id = auth.uid());

CREATE POLICY "records_delete" ON records FOR DELETE
  USING (author_id = auth.uid());

-- couple_notes: mother and father only
CREATE POLICY "couple_notes_select" ON couple_notes FOR SELECT
  USING (get_my_role(pregnancy_id) IN ('mother', 'father'));

CREATE POLICY "couple_notes_insert" ON couple_notes FOR INSERT
  WITH CHECK (
    author_id = auth.uid() AND
    get_my_role(pregnancy_id) IN ('mother', 'father')
  );

CREATE POLICY "couple_notes_delete" ON couple_notes FOR DELETE
  USING (author_id = auth.uid());

-- ai_analyses: same visibility as parent record
CREATE POLICY "ai_analyses_select" ON ai_analyses FOR SELECT
  USING (
    record_id IN (SELECT id FROM records WHERE author_id = auth.uid())
    OR record_id IN (
      SELECT r.id FROM records r
      WHERE r.pregnancy_id IN (SELECT pregnancy_id FROM family_members WHERE user_id = auth.uid())
      AND r.visibility != 'private'
    )
  );

CREATE POLICY "ai_analyses_insert" ON ai_analyses FOR INSERT
  WITH CHECK (
    record_id IN (SELECT id FROM records WHERE author_id = auth.uid())
  );
