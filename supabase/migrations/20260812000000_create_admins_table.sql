-- Tabla de administradoras/es: define quien puede entrar al panel interno
-- /admin y ver/gestionar TODOS los pedidos. Por defecto esta vacia: hay que
-- anadir a Cynthia a mano una unica vez (ver instrucciones del chat).

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- Cada usuario autenticado solo puede ver su PROPIA fila en "admins".
-- Esto es lo que usa el panel para comprobar "¿soy admin?" sin exponer
-- la lista completa de administradores a nadie desde el navegador.
create policy "users can read own admin row"
  on public.admins for select
  using (auth.uid() = user_id);

-- Quien esta en "admins" puede leer TODOS los pedidos de la tabla "orders".
create policy "admins can read all orders"
  on public.orders for select
  using (exists (select 1 from public.admins where admins.user_id = auth.uid()));

-- Quien esta en "admins" tambien puede actualizar el estado de un pedido
-- (por ejemplo, marcarlo como "shipped" o "delivered" tras prepararlo).
create policy "admins can update orders"
  on public.orders for update
  using (exists (select 1 from public.admins where admins.user_id = auth.uid()))
  with check (exists (select 1 from public.admins where admins.user_id = auth.uid()));
