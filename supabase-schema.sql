-- 1. Create user_profiles table
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  school_info TEXT,
  approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add RLS policies for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" 
ON user_profiles FOR SELECT 
USING (auth.uid() = id);

-- Geliştirme aşamasında admin panel herkese açık. Üretime çıkmadan Admin rolü eklenebilir.
CREATE POLICY "Admin can view all profiles" 
ON user_profiles FOR SELECT 
USING (true); 

CREATE POLICY "Users can insert their own profile" 
ON user_profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin can update approval status" 
ON user_profiles FOR UPDATE 
USING (true); 

-- 3. Add user_id to games table
ALTER TABLE games ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
