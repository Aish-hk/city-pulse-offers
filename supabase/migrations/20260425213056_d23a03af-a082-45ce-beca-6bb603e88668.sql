create table merchants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  address text,
  lat double precision not null,
  lng double precision not null,
  brand_voice text,
  icon_name text,
  created_at timestamptz default now()
);

create table merchant_rules (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid references merchants(id) on delete cascade,
  goal_type text not null,
  goal_text_input text,
  active_window_start time,
  active_window_end time,
  active_days int[] default '{1,2,3,4,5,6,7}',
  max_discount_pct int default 25,
  min_discount_pct int default 10,
  trigger_conditions jsonb default '{}',
  inventory_tag text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table offers (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid references merchants(id),
  rule_id uuid references merchant_rules(id),
  user_session_id text,
  headline text not null,
  body text not null,
  cta text not null,
  discount_pct int not null,
  urgency_reason text not null,
  expires_at timestamptz not null,
  context_snapshot jsonb,
  relevance_score numeric default 0,
  status text default 'active',
  created_at timestamptz default now()
);

create table redemptions (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid references offers(id),
  user_session_id text,
  simulated_amount_pence int,
  redeemed_at timestamptz default now()
);

create table user_sessions (
  session_id text primary key,
  current_lat double precision default 51.5246,
  current_lng double precision default -0.0784,
  created_at timestamptz default now()
);

create table demo_overrides (
  id text primary key default 'global',
  weather_override text,
  time_override timestamptz,
  location_override jsonb
);

create table merchant_insights (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid references merchants(id) on delete cascade,
  diagnosis text not null,
  suggested_action text not null,
  context_snapshot jsonb,
  created_at timestamptz default now()
);

alter table merchants enable row level security;
create policy "public_read_merchants" on merchants for select using (true);
create policy "public_insert_merchants" on merchants for insert with check (true);

alter table merchant_rules enable row level security;
create policy "public_read_rules" on merchant_rules for select using (true);
create policy "public_insert_rules" on merchant_rules for insert with check (true);
create policy "public_update_rules" on merchant_rules for update using (true);

alter table offers enable row level security;
create policy "public_read_offers" on offers for select using (true);
create policy "public_insert_offers" on offers for insert with check (true);
create policy "public_update_offers" on offers for update using (true);

alter table redemptions enable row level security;
create policy "public_read_redemptions" on redemptions for select using (true);
create policy "public_insert_redemptions" on redemptions for insert with check (true);

alter table user_sessions enable row level security;
create policy "public_read_sessions" on user_sessions for select using (true);
create policy "public_insert_sessions" on user_sessions for insert with check (true);
create policy "public_update_sessions" on user_sessions for update using (true);

alter table demo_overrides enable row level security;
create policy "public_read_overrides" on demo_overrides for select using (true);
create policy "public_insert_overrides" on demo_overrides for insert with check (true);
create policy "public_update_overrides" on demo_overrides for update using (true);

alter table merchant_insights enable row level security;
create policy "public_read_insights" on merchant_insights for select using (true);
create policy "public_insert_insights" on merchant_insights for insert with check (true);

alter publication supabase_realtime add table offers;
alter publication supabase_realtime add table redemptions;
alter publication supabase_realtime add table merchant_insights;

INSERT INTO merchants (name, category, address, lat, lng, brand_voice, icon_name) VALUES
('Watch House Coffee', 'cafe', 'Bermondsey St', 51.5246, -0.0784, 'playful and warm, coffee expert', 'ph-coffee'),
('Dishoom Shoreditch', 'restaurant', 'Boundary St', 51.5260, -0.0778, 'confident and generous, never pushy', 'ph-bowl-food'),
('BrewDog Shoreditch', 'bar', 'Bethnal Green Rd', 51.5265, -0.0790, 'irreverent, bold, slightly chaotic', 'ph-beer-bottle'),
('Beigel Bake', 'bakery', 'Brick Lane', 51.5235, -0.0719, 'gritty, honest, east-London-since-forever', 'ph-bread');

INSERT INTO merchant_rules (merchant_id, goal_type, goal_text_input, active_window_start, active_window_end, max_discount_pct, min_discount_pct, trigger_conditions, inventory_tag)
SELECT id, 'fill_quiet_hours', 'Fill empty seats on rainy weekday afternoons', '14:00', '17:00', 25, 12, '{"weather": ["rain","cloudy"]}'::jsonb, 'pastry'
FROM merchants WHERE name = 'Watch House Coffee';

INSERT INTO demo_overrides (id) VALUES ('global') ON CONFLICT DO NOTHING;