-- 이사매칭 플랫폼 DB 스키마
-- Supabase SQL Editor에서 실행하세요

-- ================================================
-- 1. profiles 테이블 (사용자)
-- ================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'company', 'admin')),
  name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- profiles RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 새 사용자 가입 시 profiles 자동 생성 트리거
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (new.id, 'customer');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================
-- 2. companies 테이블 (업체)
-- ================================================
CREATE TABLE IF NOT EXISTS companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  business_name TEXT NOT NULL,
  business_number TEXT,
  service_regions TEXT[] DEFAULT '{}',
  move_types TEXT[] DEFAULT '{}',
  vehicles JSONB DEFAULT '[]',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  avg_rating FLOAT DEFAULT 0,
  review_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- companies RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company owners can view own company"
  ON companies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Company owners can update own company"
  ON companies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert company"
  ON companies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all companies"
  ON companies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ================================================
-- 3. estimates 테이블 (견적 요청)
-- ================================================
CREATE TABLE IF NOT EXISTS estimates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  phone TEXT,  -- 비회원용
  schema_data JSONB NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'matching', 'matched', 'completed', 'cancelled')),
  completion_rate FLOAT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- estimates RLS
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own estimates"
  ON estimates FOR SELECT
  USING (auth.uid() = user_id OR phone IS NOT NULL);

CREATE POLICY "Users can insert estimates"
  ON estimates FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own estimates"
  ON estimates FOR UPDATE
  USING (auth.uid() = user_id OR phone IS NOT NULL);

CREATE POLICY "Admins can view all estimates"
  ON estimates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- JSONB 인덱스 (매칭 필터링용)
CREATE INDEX IF NOT EXISTS idx_est_category
  ON estimates ((schema_data->'move'->>'category'));
CREATE INDEX IF NOT EXISTS idx_est_type
  ON estimates ((schema_data->'move'->>'type'));
CREATE INDEX IF NOT EXISTS idx_est_status
  ON estimates (status);

-- ================================================
-- 4. matchings 테이블 (매칭 이력)
-- ================================================
CREATE TABLE IF NOT EXISTS matchings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  estimate_id UUID REFERENCES estimates(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'timeout', 'completed')),
  match_score FLOAT,
  attempt_number INT DEFAULT 1,
  expires_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- matchings RLS
ALTER TABLE matchings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies can view their matchings"
  ON matchings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE id = matchings.company_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Companies can update their matchings"
  ON matchings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE id = matchings.company_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Estimate owners can view matchings"
  ON matchings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM estimates
      WHERE id = matchings.estimate_id AND user_id = auth.uid()
    )
  );

-- ================================================
-- 5. reviews 테이블 (리뷰)
-- ================================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  matching_id UUID REFERENCES matchings(id) ON DELETE CASCADE NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- reviews RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Estimate owners can insert reviews"
  ON reviews FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM matchings m
      JOIN estimates e ON m.estimate_id = e.id
      WHERE m.id = matching_id AND e.user_id = auth.uid()
    )
  );

-- ================================================
-- 6. chat_messages 테이블 (채팅 이력)
-- ================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  estimate_id UUID REFERENCES estimates(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'system', 'ai')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- chat_messages RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Estimate owners can view messages"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM estimates
      WHERE id = chat_messages.estimate_id
      AND (user_id = auth.uid() OR phone IS NOT NULL)
    )
  );

CREATE POLICY "Estimate owners can insert messages"
  ON chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM estimates
      WHERE id = estimate_id
      AND (user_id = auth.uid() OR user_id IS NULL)
    )
  );

-- ================================================
-- updated_at 자동 업데이트 트리거
-- ================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_estimates_updated_at
  BEFORE UPDATE ON estimates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
