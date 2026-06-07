-- 1. Buat fungsi trigger untuk sinkronisasi user baru dari auth.users ke public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, "createdAt", "updatedAt")
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', 'User'),
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    "updatedAt" = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Hapus trigger jika sudah ada sebelumnya
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Buat trigger setelah data baru masuk ke auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Sinkronisasi data user yang sudah terlanjur terdaftar sebelumnya
INSERT INTO public.users (id, email, name, "createdAt", "updatedAt")
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'name', raw_user_meta_data->>'full_name', 'User'), 
  created_at, 
  updated_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;
