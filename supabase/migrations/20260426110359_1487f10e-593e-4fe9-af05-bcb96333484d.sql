-- Extend merchants
ALTER TABLE public.merchants
  ADD COLUMN IF NOT EXISTS photo_url text,
  ADD COLUMN IF NOT EXISTS cuisine text,
  ADD COLUMN IF NOT EXISTS neighborhood text,
  ADD COLUMN IF NOT EXISTS price_tier int DEFAULT 2,
  ADD COLUMN IF NOT EXISTS is_independent boolean DEFAULT true;

-- Customer profile (session-keyed, no auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  session_id text PRIMARY KEY,
  display_name text,
  avatar_emoji text DEFAULT '🌿',
  dietary_prefs text[] DEFAULT '{}',
  fav_neighborhoods text[] DEFAULT '{}',
  fav_cuisines text[] DEFAULT '{}',
  notify_radius_m int DEFAULT 800,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "public_insert_profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update_profiles" ON public.profiles FOR UPDATE USING (true);

-- Saved offers
CREATE TABLE IF NOT EXISTS public.saved_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  offer_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (session_id, offer_id)
);
ALTER TABLE public.saved_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_saved" ON public.saved_offers FOR SELECT USING (true);
CREATE POLICY "public_insert_saved" ON public.saved_offers FOR INSERT WITH CHECK (true);
CREATE POLICY "public_delete_saved" ON public.saved_offers FOR DELETE USING (true);

-- Apple Wallet passes (simulated)
CREATE TABLE IF NOT EXISTS public.wallet_passes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  offer_id uuid NOT NULL,
  pass_number text NOT NULL,
  activated boolean DEFAULT false,
  last_tapped_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE (session_id, offer_id)
);
ALTER TABLE public.wallet_passes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_passes" ON public.wallet_passes FOR SELECT USING (true);
CREATE POLICY "public_insert_passes" ON public.wallet_passes FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update_passes" ON public.wallet_passes FOR UPDATE USING (true);
CREATE POLICY "public_delete_passes" ON public.wallet_passes FOR DELETE USING (true);
