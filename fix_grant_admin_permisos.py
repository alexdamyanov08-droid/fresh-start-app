#!/usr/bin/env python3
"""
Guarda en el repo la migracion que concede los permisos que faltaban
(GRANT) para que el panel de administracion pueda leer "admins" y
leer/actualizar "orders". El arreglo YA se aplico directamente en
Supabase via SQL Editor; este script solo deja constancia en el repo
para que quede correcto en futuros despliegues.

Uso: colocar este archivo en la raiz del repo (fresh-start-app) y ejecutar:
    python3 fix_grant_admin_permisos.py
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent

CONTENT = '''-- Correccion: la migracion anterior (20260812000000) creo las politicas RLS
-- correctas para que las administradoras puedan leer "admins" y leer/editar
-- "orders", pero olvido conceder el permiso BASE de esas acciones al rol
-- "authenticated". Sin este GRANT, Postgres devuelve "permission denied"
-- (403) antes de llegar a evaluar las politicas RLS, aunque estas sean
-- correctas. Este GRANT no abre nada nuevo por si solo: las politicas RLS
-- siguen decidiendo, fila a fila, quien puede ver o tocar que.

grant select on public.admins to authenticated;
grant select, update on public.orders to authenticated;
'''

path = ROOT / "supabase/migrations/20260812000001_grant_admin_table_privileges.sql"
if path.exists():
    print(f"AVISO: {path} ya existe, no se sobrescribe (¿ya estaba aplicado?)")
    sys.exit(0)
path.parent.mkdir(parents=True, exist_ok=True)
path.write_text(CONTENT, encoding="utf-8")
print(f"OK: creado {path.relative_to(ROOT)}")
print()
print("Este SQL ya lo aplicaste a mano en Supabase, asi que no hace falta")
print("volver a ejecutar 'supabase db push' ahora. Solo guarda el archivo")
print("y haz el commit para que quede constancia en el repo.")
