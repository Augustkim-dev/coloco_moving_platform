-- Admin이 companies 테이블에 INSERT/UPDATE 할 수 있는 RLS 정책 추가
-- Supabase SQL Editor에서 실행하세요

-- 기존 정책 삭제 (있을 경우)
DROP POLICY IF EXISTS "Admins can insert companies" ON companies;
DROP POLICY IF EXISTS "Admins can update companies" ON companies;
DROP POLICY IF EXISTS "Admins can delete companies" ON companies;

-- Admin이 업체를 등록할 수 있는 정책
CREATE POLICY "Admins can insert companies"
  ON companies FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin이 업체를 수정할 수 있는 정책
CREATE POLICY "Admins can update companies"
  ON companies FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin이 업체를 삭제할 수 있는 정책
CREATE POLICY "Admins can delete companies"
  ON companies FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ================================================
-- matchings 테이블 Admin 정책
-- ================================================
DROP POLICY IF EXISTS "Admins can view all matchings" ON matchings;
DROP POLICY IF EXISTS "Admins can insert matchings" ON matchings;
DROP POLICY IF EXISTS "Admins can update matchings" ON matchings;
DROP POLICY IF EXISTS "Admins can delete matchings" ON matchings;

CREATE POLICY "Admins can view all matchings"
  ON matchings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert matchings"
  ON matchings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update matchings"
  ON matchings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete matchings"
  ON matchings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ================================================
-- estimates 테이블 Admin UPDATE/DELETE 정책
-- ================================================
DROP POLICY IF EXISTS "Admins can update estimates" ON estimates;
DROP POLICY IF EXISTS "Admins can delete estimates" ON estimates;

CREATE POLICY "Admins can update estimates"
  ON estimates FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete estimates"
  ON estimates FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ================================================
-- matchings 테이블에 admin_memo 컬럼 추가
-- ================================================
ALTER TABLE matchings ADD COLUMN IF NOT EXISTS admin_memo TEXT;
