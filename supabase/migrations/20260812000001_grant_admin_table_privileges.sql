-- Correccion: la migracion anterior (20260812000000) creo las politicas RLS
-- correctas para que las administradoras puedan leer "admins" y leer/editar
-- "orders", pero olvido conceder el permiso BASE de esas acciones al rol
-- "authenticated". Sin este GRANT, Postgres devuelve "permission denied"
-- (403) antes de llegar a evaluar las politicas RLS, aunque estas sean
-- correctas. Este GRANT no abre nada nuevo por si solo: las politicas RLS
-- siguen decidiendo, fila a fila, quien puede ver o tocar que.

grant select on public.admins to authenticated;
grant select, update on public.orders to authenticated;
