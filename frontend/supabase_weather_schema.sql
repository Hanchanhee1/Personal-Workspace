-- Weather Widget: Favorite Cities Table
-- 사용자별 즐겨찾기 도시 저장

CREATE TABLE IF NOT EXISTS favorite_cities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  city_name TEXT NOT NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, city_name)
);

-- RLS (Row Level Security) 활성화
ALTER TABLE favorite_cities ENABLE ROW LEVEL SECURITY;

-- 정책: 사용자는 자신의 데이터만 조회 가능
DROP POLICY IF EXISTS "Users can view own favorite cities" ON favorite_cities;
CREATE POLICY "Users can view own favorite cities"
  ON favorite_cities FOR SELECT
  USING (auth.uid() = user_id);

-- 정책: 사용자는 자신의 데이터만 추가 가능
DROP POLICY IF EXISTS "Users can insert own favorite cities" ON favorite_cities;
CREATE POLICY "Users can insert own favorite cities"
  ON favorite_cities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 정책: 사용자는 자신의 데이터만 삭제 가능
DROP POLICY IF EXISTS "Users can delete own favorite cities" ON favorite_cities;
CREATE POLICY "Users can delete own favorite cities"
  ON favorite_cities FOR DELETE
  USING (auth.uid() = user_id);

-- 인덱스 추가 (성능 최적화)
DROP INDEX IF EXISTS idx_favorite_cities_user_id;
CREATE INDEX idx_favorite_cities_user_id ON favorite_cities(user_id);
