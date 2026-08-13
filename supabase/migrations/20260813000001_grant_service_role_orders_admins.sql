-- Correccion: aunque "service_role" normalmente salta las politicas RLS
-- (BYPASSRLS), Postgres sigue exigiendo el permiso BASE (GRANT) sobre la
-- tabla para poder leer/escribir en ella. Sin este GRANT, las Edge
-- Functions que usan la clave de administrador (service_role) para crear
-- o actualizar pedidos fallan con "permission denied", aunque el codigo
-- y las claves esten bien configuradas.

grant select, insert, update, delete on public.orders to service_role;
grant select, insert, update, delete on public.admins to service_role;
