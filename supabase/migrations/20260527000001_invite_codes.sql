CREATE TABLE invite_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(8) NOT NULL UNIQUE,
  pregnancy_id uuid NOT NULL REFERENCES pregnancies(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  used_by uuid REFERENCES auth.users(id),
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth can read invite codes" ON invite_codes FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth can create invite codes" ON invite_codes FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Auth can update invite codes" ON invite_codes FOR UPDATE USING (auth.uid() IS NOT NULL);
