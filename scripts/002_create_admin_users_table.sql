-- Create admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RPC function to verify admin login
CREATE OR REPLACE FUNCTION public.verify_admin_login(
  p_username TEXT,
  p_password TEXT
)
RETURNS TABLE (
  success BOOLEAN,
  user_id UUID,
  message TEXT
) AS $$
DECLARE
  v_user_id UUID;
  v_password_hash TEXT;
  v_is_active BOOLEAN;
BEGIN
  -- Get the admin user
  SELECT id, password_hash, is_active INTO v_user_id, v_password_hash, v_is_active
  FROM public.admin_users
  WHERE username = p_username
  LIMIT 1;

  -- Check if user exists
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, 'Invalid credentials'::TEXT;
    RETURN;
  END IF;

  -- Check if user is active
  IF NOT v_is_active THEN
    RETURN QUERY SELECT false, NULL::UUID, 'Account is inactive'::TEXT;
    RETURN;
  END IF;

  -- Verify password (simple comparison - in production use pgcrypto or similar)
  -- Since we can't use bcrypt directly in PostgreSQL without extension,
  -- we'll compare the hashed version. This assumes the frontend sends a hashed password.
  IF v_password_hash = p_password THEN
    RETURN QUERY SELECT true, v_user_id, 'Login successful'::TEXT;
  ELSE
    RETURN QUERY SELECT false, NULL::UUID, 'Invalid credentials'::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies (allow public to call the function, but not direct access to table)
CREATE POLICY "Allow public to verify login" ON public.admin_users
  FOR SELECT
  USING (FALSE); -- Prevent direct table access, use RPC instead
