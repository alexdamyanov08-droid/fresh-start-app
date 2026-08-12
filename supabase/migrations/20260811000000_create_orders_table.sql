-- Tabla de pedidos reales. Los inserta/actualiza unicamente el backend
-- (las Edge Functions, con la clave de servicio), nunca el navegador del
-- cliente directamente. RLS activado y sin politicas publicas: por defecto
-- nadie desde el navegador puede leer ni escribir aqui. Cynthia consulta
-- los pedidos directamente desde el Table Editor de Supabase.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  stripe_session_id text unique,
  stripe_payment_status text,
  status text not null default 'pending', -- pending | paid | shipped | delivered | cancelled
  customer_email text,
  customer_name text,
  customer_phone text,
  shipping_address jsonb,
  items jsonb not null,
  subtotal numeric not null,
  shipping numeric not null,
  tax numeric not null,
  total numeric not null,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

alter table public.orders enable row level security;

-- Sin "create policy": por diseño, ni anon ni authenticated tienen acceso.
-- Solo la service_role (que usan las Edge Functions) puede leer/escribir.

create index if not exists orders_order_number_idx on public.orders (order_number);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
